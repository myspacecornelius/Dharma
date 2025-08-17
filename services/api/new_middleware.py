
"""
Enhanced API Middleware for SNPD
"""

from fastapi import Request, Response, HTTPException
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
import time
import json
import logging
import uuid
import redis.asyncio as redis
from typing import Dict, Optional, Callable, List, Any, Tuple
import hashlib
import hmac
import os
import re
from prometheus_client import Counter, Gauge, Histogram

logger = logging.getLogger(__name__)

# --- Prometheus Metrics ---
RATE_LIMIT_REQUESTS = Counter(
    "snpd_rate_limiter_requests_total",
    "Total requests processed by the rate limiter",
    ["policy", "decision"]
)
ADMISSION_CONTROL_REQUESTS = Counter(
    "snpd_admission_controller_requests_total",
    "Total requests processed by the admission controller",
    ["decision"]
)
INFLIGHT_REQUESTS = Gauge(
    "snpd_inflight_requests",
    "Number of inflight requests"
)
CACHE_HITS = Counter("snpd_cache_hits_total", "Total cache hits", ["endpoint"])
CACHE_MISSES = Counter("snpd_cache_misses_total", "Total cache misses", ["endpoint"])
CACHE_EVICTIONS = Counter("snpd_cache_evictions_total", "Total cache evictions", ["endpoint"])
CIRCUIT_BREAKER_STATE = Gauge(
    "snpd_circuit_breaker_state",
    "State of the circuit breaker (0=CLOSED, 1=OPEN, 2=HALF_OPEN)",
    ["dependency"]
)

class EnhancedRateLimitMiddleware(BaseHTTPMiddleware):
    """
    High-performance rate limiter using a token bucket algorithm in Redis LUA.
    Supports hierarchical quotas and admission control.
    """
    def __init__(self, app, redis_client: redis.Redis, lua_script_path: str):
        super().__init__(app)
        self.redis = redis_client
        with open(lua_script_path, "r") as f:
            self.lua_script = self.redis.register_script(f.read())
        
        # --- Configuration ---
        self.rate_limit_enabled = os.getenv("RATE_LIMITER_ENABLED", "true").lower() == "true"
        self.admission_control_enabled = os.getenv("ADMISSION_CONTROL_ENABLED", "true").lower() == "true"
        self.max_concurrency = int(os.getenv("MAX_CONCURRENCY", "100"))
        
        self.policies = self._compile_policies()

    def _compile_policies(self) -> List[Dict[str, Any]]:
        # In a real app, this would come from a config file
        raw_policies = [
            {"pattern": r"/api/auth/session", "max_tokens": 20, "rate": 5, "cost": 1, "key_parts": ["ip"]},
            {"pattern": r"/api/commands/parse", "max_tokens": 100, "rate": 20, "cost": 1, "key_parts": ["user_id", "ip"]},
            {"pattern": r"/api/monitors", "max_tokens": 50, "rate": 10, "cost": 2, "key_parts": ["user_id"]},
            {"pattern": r"/api/checkout/tasks/batch", "max_tokens": 30, "rate": 5, "cost": 5, "key_parts": ["user_id"]},
            {"pattern": r"/api/.*", "max_tokens": 1000, "rate": 100, "cost": 1, "key_parts": ["user_id", "ip"]},
            {"pattern": r"/.*", "max_tokens": 2000, "rate": 200, "cost": 1, "key_parts": ["ip"]},
        ]
        
        for policy in raw_policies:
            policy["regex"] = re.compile(policy["pattern"])
        return raw_policies

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        if not self.rate_limit_enabled:
            return await call_next(request)

        # --- Admission Control ---
        if self.admission_control_enabled:
            if INFLIGHT_REQUESTS._value.get() >= self.max_concurrency:
                ADMISSION_CONTROL_REQUESTS.labels(decision="shed").inc()
                return JSONResponse(
                    status_code=429,
                    content={"error": "Server busy, please try again later."},
                    headers={"Retry-After": "10"}
                )
            ADMISSION_CONTROL_REQUESTS.labels(decision="allowed").inc()

        # --- Rate Limiting ---
        policy, key = await self._get_policy_and_key(request)
        
        if policy:
            allowed, tokens_left = await self._check_rate_limit(policy, key)
            
            if not allowed:
                RATE_LIMIT_REQUESTS.labels(policy=policy["pattern"], decision="limited").inc()
                return JSONResponse(
                    status_code=429,
                    content={"error": "Rate limit exceeded."},
                    headers={"X-RateLimit-Remaining": str(int(tokens_left))}
                )
            RATE_LIMIT_REQUESTS.labels(policy=policy["pattern"], decision="allowed").inc()

        # --- Process Request ---
        INFLIGHT_REQUESTS.inc()
        try:
            response = await call_next(request)
        finally:
            INFLIGHT_REQUESTS.dec()
            
        return response

    async def _get_policy_and_key(self, request: Request) -> Tuple[Optional[Dict], Optional[str]]:
        for policy in self.policies:
            if policy["regex"].match(request.url.path):
                key_parts = []
                for part in policy["key_parts"]:
                    if part == "ip":
                        key_parts.append(request.client.host)
                    elif part == "user_id":
                        # In a real app, get user_id from a validated token
                        user_id = "anonymous" 
                        auth_header = request.headers.get("Authorization")
                        if auth_header:
                            # This is a placeholder for actual token validation
                            user_id = f"user_{hashlib.sha1(auth_header.encode()).hexdigest()[:8]}"
                        key_parts.append(user_id)
                
                key = f"rate_limit:{policy['pattern']}:" + ":".join(key_parts)
                return policy, key
        return None, None

    async def _check_rate_limit(self, policy: Dict, key: str) -> Tuple[bool, int]:
        now = time.time()
        result = await self.lua_script(
            keys=[key],
            args=[
                policy["max_tokens"], 
                policy["rate"], 
                policy["cost"], 
                now
            ]
        )
        allowed, tokens_left = result
        return bool(allowed), int(tokens_left)

class EnhancedCacheMiddleware(BaseHTTPMiddleware):
    """
    HMAC-secured cache keys and stale-while-revalidate.
    """
    def __init__(self, app, redis_client: redis.Redis, secret_key: str):
        super().__init__(app)
        self.redis = redis_client
        self.secret_key = secret_key.encode()
        self.cache_config = self._compile_cache_config()

    def _compile_cache_config(self) -> List[Dict[str, Any]]:
        # In a real app, this would come from a config file
        raw_config = [
            {"pattern": r"/api/metrics", "ttl": 60, "swr": 10},
            {"pattern": r"/api/predictions/.*", "ttl": 3600, "swr": 300},
            {"pattern": r"/api/heatmap/.*", "ttl": 120, "swr": 30},
        ]
        for config in raw_config:
            config["regex"] = re.compile(config["pattern"])
        return raw_config

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        if request.method != "GET":
            return await call_next(request)

        config = self._get_cache_config(request.url.path)
        if not config:
            return await call_next(request)

        cache_key = self._generate_cache_key(request)
        
        # --- Check Cache ---
        cached = await self.redis.get(cache_key)
        if cached:
            CACHE_HITS.labels(endpoint=config["pattern"]).inc()
            data = json.loads(cached)
            
            # Stale-while-revalidate logic
            is_stale = time.time() > data["expiry"]
            if is_stale and config.get("swr"):
                # Serve stale, but trigger a background refresh
                # This requires a background task manager
                logger.info(f"SWR: Serving stale for {cache_key}, needs background refresh.")
            
            headers = data["headers"]
            headers["X-Cache"] = "HIT"
            headers["X-Cache-Stale"] = "true" if is_stale else "false"
            return JSONResponse(content=data["content"], status_code=data["status_code"], headers=headers)

        CACHE_MISSES.labels(endpoint=config["pattern"]).inc()
        
        # --- Call Endpoint and Cache Response ---
        response = await call_next(request)
        if response.status_code == 200:
            body = b""
            async for chunk in response.body_iterator:
                body += chunk
            
            content = json.loads(body)
            now = time.time()
            
            cache_data = {
                "content": content,
                "status_code": response.status_code,
                "headers": dict(response.headers),
                "timestamp": now,
                "expiry": now + config["ttl"]
            }
            
            await self.redis.setex(cache_key, config["ttl"] + config.get("swr", 0), json.dumps(cache_data))
            
            # Return a new response from the fresh data
            return JSONResponse(content=content, status_code=200, headers=response.headers)
            
        return response

    def _get_cache_config(self, path: str) -> Optional[Dict]:
        for config in self.cache_config:
            if config["regex"].match(path):
                return config
        return None

    def _generate_cache_key(self, request: Request) -> str:
        # In a real app, get user_id and scope from a validated token
        user_id = "anonymous"
        scope = "default"
        
        # Hash the request body for POST/PUT requests if they were to be cached
        body_hash = ""
        
        key_data = f"{request.method}:{request.url.path}:{request.url.query}:{user_id}:{scope}:{body_hash}"
        
        # Create a signature for the key
        signature = hmac.new(self.secret_key, key_data.encode(), hashlib.sha256).hexdigest()
        
        return f"cache:{signature}"
