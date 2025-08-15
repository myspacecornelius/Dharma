"""
API Middleware for logging, rate limiting, error handling, and security
"""

from fastapi import Request, Response, HTTPException
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.middleware.cors import CORSMiddleware
import time
import json
import logging
import uuid
from datetime import datetime, timedelta
import redis.asyncio as redis
from typing import Dict, Optional, Callable
import hashlib
import hmac
from functools import wraps
import asyncio

logger = logging.getLogger(__name__)

class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """Log all requests with timing and response info"""
    
    async def dispatch(self, request: Request, call_next):
        request_id = str(uuid.uuid4())
        request.state.request_id = request_id
        
        # Start timing
        start_time = time.time()
        
        # Log request
        logger.info(f"Request {request_id}: {request.method} {request.url.path}")
        
        # Add request ID to response headers
        response = await call_next(request)
        
        # Calculate duration
        duration = time.time() - start_time
        
        # Log response
        logger.info(
            f"Response {request_id}: "
            f"status={response.status_code} "
            f"duration={duration:.3f}s"
        )
        
        # Add headers
        response.headers["X-Request-ID"] = request_id
        response.headers["X-Response-Time"] = f"{duration:.3f}"
        
        return response

class RateLimitMiddleware(BaseHTTPMiddleware):
    """Rate limiting using sliding window algorithm"""
    
    def __init__(self, app, redis_client: redis.Redis):
        super().__init__(app)
        self.redis = redis_client
        self.limits = {
            "/api/monitors": {"requests": 100, "window": 3600},  # 100/hour
            "/api/checkout": {"requests": 500, "window": 3600},  # 500/hour
            "/api/commands/parse": {"requests": 1000, "window": 3600},  # 1000/hour
            "default": {"requests": 2000, "window": 3600}  # 2000/hour
        }
    
    async def dispatch(self, request: Request, call_next):
        # Skip rate limiting for health checks
        if request.url.path == "/health":
            return await call_next(request)
        
        # Get client identifier (API key or IP)
        client_id = await self._get_client_id(request)
        
        # Check rate limit
        path_pattern = self._get_path_pattern(request.url.path)
        limit_config = self.limits.get(path_pattern, self.limits["default"])
        
        is_allowed = await self._check_rate_limit(
            client_id, 
            path_pattern,
            limit_config["requests"],
            limit_config["window"]
        )
        
        if not is_allowed:
            return JSONResponse(
                status_code=429,
                content={
                    "error": {
                        "code": "RATE_LIMIT_EXCEEDED",
                        "message": "Too many requests. Please try again later."
                    }
                },
                headers={
                    "Retry-After": str(limit_config["window"]),
                    "X-RateLimit-Limit": str(limit_config["requests"]),
                    "X-RateLimit-Window": str(limit_config["window"])
                }
            )
        
        response = await call_next(request)
        
        # Add rate limit headers
        remaining = await self._get_remaining_requests(
            client_id, 
            path_pattern,
            limit_config["requests"],
            limit_config["window"]
        )
        
        response.headers["X-RateLimit-Limit"] = str(limit_config["requests"])
        response.headers["X-RateLimit-Remaining"] = str(remaining)
        response.headers["X-RateLimit-Reset"] = str(
            int(time.time()) + limit_config["window"]
        )
        
        return response
    
    async def _get_client_id(self, request: Request) -> str:
        """Get client identifier from auth token or IP"""
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
            return f"token:{token}"
        
        # Fallback to IP
        client_ip = request.client.host
        return f"ip:{client_ip}"
    
    def _get_path_pattern(self, path: str) -> str:
        """Match path to pattern for rate limiting"""
        for pattern in self.limits.keys():
            if pattern != "default" and path.startswith(pattern):
                return pattern
        return "default"
    
    async def _check_rate_limit(
        self, 
        client_id: str, 
        endpoint: str,
        limit: int, 
        window: int
    ) -> bool:
        """Check if request is within rate limit using sliding window"""
        now = time.time()
        key = f"rate_limit:{client_id}:{endpoint}"
        
        # Remove old entries
        await self.redis.zremrangebyscore(key, 0, now - window)
        
        # Count requests in window
        count = await self.redis.zcard(key)
        
        if count >= limit:
            return False
        
        # Add current request
        await self.redis.zadd(key, {str(uuid.uuid4()): now})
        await self.redis.expire(key, window)
        
        return True
    
    async def _get_remaining_requests(
        self,
        client_id: str,
        endpoint: str,
        limit: int,
        window: int
    ) -> int:
        """Get remaining requests in current window"""
        now = time.time()
        key = f"rate_limit:{client_id}:{endpoint}"
        
        # Remove old entries
        await self.redis.zremrangebyscore(key, 0, now - window)
        
        # Count requests
        count = await self.redis.zcard(key)
        
        return max(0, limit - count)

class ErrorHandlingMiddleware(BaseHTTPMiddleware):
    """Global error handling with proper formatting"""
    
    async def dispatch(self, request: Request, call_next):
        try:
            response = await call_next(request)
            return response
        except HTTPException as e:
            return JSONResponse(
                status_code=e.status_code,
                content={
                    "success": False,
                    "error": {
                        "code": f"HTTP_{e.status_code}",
                        "message": e.detail
                    },
                    "request_id": getattr(request.state, "request_id", str(uuid.uuid4())),
                    "timestamp": datetime.now().isoformat()
                }
            )
        except Exception as e:
            logger.error(f"Unhandled error: {str(e)}", exc_info=True)
            return JSONResponse(
                status_code=500,
                content={
                    "success": False,
                    "error": {
                        "code": "INTERNAL_ERROR",
                        "message": "An unexpected error occurred"
                    },
                    "request_id": getattr(request.state, "request_id", str(uuid.uuid4())),
                    "timestamp": datetime.now().isoformat()
                }
            )

class SecurityMiddleware(BaseHTTPMiddleware):
    """Security headers and request validation"""
    
    async def dispatch(self, request: Request, call_next):
        # Add security headers
        response = await call_next(request)
        
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        response.headers["Content-Security-Policy"] = "default-src 'self'"
        
        return response

class CacheMiddleware(BaseHTTPMiddleware):
    """Redis-based response caching for GET requests"""
    
    def __init__(self, app, redis_client: redis.Redis):
        super().__init__(app)
        self.redis = redis_client
        self.cache_config = {
            "/api/metrics": 60,  # 1 minute
            "/api/products": 300,  # 5 minutes
            "/api/prices": 180,  # 3 minutes
        }
    
    async def dispatch(self, request: Request, call_next):
        # Only cache GET requests
        if request.method != "GET":
            return await call_next(request)
        
        # Check if path should be cached
        cache_ttl = self._get_cache_ttl(request.url.path)
        if not cache_ttl:
            return await call_next(request)
        
        # Generate cache key
        cache_key = self._generate_cache_key(request)
        
        # Try to get from cache
        cached_response = await self.redis.get(cache_key)
        if cached_response:
            data = json.loads(cached_response)
            return JSONResponse(
                content=data["content"],
                status_code=data["status_code"],
                headers={
                    **data["headers"],
                    "X-Cache": "HIT",
                    "X-Cache-TTL": str(cache_ttl)
                }
            )
        
        # Get fresh response
        response = await call_next(request)
        
        # Cache successful responses
        if response.status_code == 200:
            # Read response body
            body = b""
            async for chunk in response.body_iterator:
                body += chunk
            
            # Cache the response
            cache_data = {
                "content": json.loads(body),
                "status_code": response.status_code,
                "headers": dict(response.headers)
            }
            
            await self.redis.setex(
                cache_key,
                cache_ttl,
                json.dumps(cache_data)
            )
            
            # Return new response with cache headers
            return JSONResponse(
                content=cache_data["content"],
                status_code=cache_data["status_code"],
                headers={
                    **cache_data["headers"],
                    "X-Cache": "MISS",
                    "X-Cache-TTL": str(cache_ttl)
                }
            )
        
        return response
    
    def _get_cache_ttl(self, path: str) -> Optional[int]:
        """Get cache TTL for path"""
        for pattern, ttl in self.cache_config.items():
            if path.startswith(pattern):
                return ttl
        return None
    
    def _generate_cache_key(self, request: Request) -> str:
        """Generate cache key from request"""
        # Include query params in cache key
        query_string = str(request.url.query)
        path = request.url.path
        
        # Include auth info if present
        auth_header = request.headers.get("Authorization", "")
        
        # Create hash of key components
        key_data = f"{path}:{query_string}:{auth_header}"
        key_hash = hashlib.md5(key_data.encode()).hexdigest()
        
        return f"cache:{key_hash}"

class WebhookSignatureMiddleware(BaseHTTPMiddleware):
    """Validate webhook signatures for security"""
    
    def __init__(self, app, secret_key: str):
        super().__init__(app)
        self.secret_key = secret_key
    
    async def dispatch(self, request: Request, call_next):
        # Only validate webhook endpoints
        if not request.url.path.startswith("/webhooks/"):
            return await call_next(request)
        
        # Get signature from header
        signature = request.headers.get("X-Webhook-Signature")
        if not signature:
            return JSONResponse(
                status_code=401,
                content={"error": "Missing webhook signature"}
            )
        
        # Read body
        body = await request.body()
        
        # Calculate expected signature
        expected_signature = hmac.new(
            self.secret_key.encode(),
            body,
            hashlib.sha256
        ).hexdigest()
        
        # Validate signature
        if not hmac.compare_digest(signature, expected_signature):
            return JSONResponse(
                status_code=401,
                content={"error": "Invalid webhook signature"}
            )
        
        # Continue with valid request
        return await call_next(request)

# Decorator for endpoint-specific caching
def cache_response(ttl: int = 300):
    """Decorator to cache endpoint responses"""
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Get request from args
            request = None
            for arg in args:
                if isinstance(arg, Request):
                    request = arg
                    break
            
            if not request:
                return await func(*args, **kwargs)
            
            # Generate cache key
            cache_key = f"endpoint:{func.__name__}:{str(kwargs)}"
            
            # Try to get from cache
            redis_client = request.app.state.redis
            cached = await redis_client.get(cache_key)
            
            if cached:
                return json.loads(cached)
            
            # Get fresh result
            result = await func(*args, **kwargs)
            
            # Cache result
            await redis_client.setex(
                cache_key,
                ttl,
                json.dumps(result.dict() if hasattr(result, 'dict') else result)
            )
            
            return result
        
        return wrapper
    return decorator

# Request ID context manager
class RequestIDContext:
    """Context manager for request ID propagation"""
    
    def __init__(self):
        self._request_id = None
    
    def set(self, request_id: str):
        self._request_id = request_id
    
    def get(self) -> Optional[str]:
        return self._request_id

request_id_context = RequestIDContext()
