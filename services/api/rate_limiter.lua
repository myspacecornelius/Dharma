
--
-- Token Bucket Rate Limiter
--
-- ARGV[1]: key
-- ARGV[2]: max_tokens
-- ARGV[3]: tokens_per_second
-- ARGV[4]: requested_tokens
-- ARGV[5]: timestamp
--
-- Returns:
-- {
--   allowed, (0 or 1)
--   tokens_left
-- }
--

local key = ARGV[1]
local max_tokens = tonumber(ARGV[2])
local tokens_per_second = tonumber(ARGV[3])
local requested_tokens = tonumber(ARGV[4])
local now = tonumber(ARGV[5])

local bucket = redis.call('hgetall', key)
local tokens = max_tokens
local last_refreshed = now

if #bucket > 0 then
  tokens = tonumber(bucket[2])
  last_refreshed = tonumber(bucket[4])
end

local elapsed = now - last_refreshed
local new_tokens = elapsed * tokens_per_second
tokens = math.min(max_tokens, tokens + new_tokens)

local allowed = 0
if tokens >= requested_tokens then
  tokens = tokens - requested_tokens
  allowed = 1
end

redis.call('hset', key, 'tokens', tokens, 'last_refreshed', now)
redis.call('expire', key, max_tokens / tokens_per_second)

return {allowed, tokens}
