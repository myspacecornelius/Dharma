
from contextlib import asynccontextmanager
import asyncio
from typing import AsyncGenerator
import asyncpg
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:password@localhost/dbname")

@asynccontextmanager
async def connection_pool_manager() -> AsyncGenerator:
    pool = await asyncpg.create_pool(
        DATABASE_URL,
        min_size=10,
        max_size=50,
        command_timeout=60
    )
    try:
        yield pool
    finally:
        await pool.close()
