import asyncio
import os
os.environ['DATABASE_URL'] = 'postgresql+asyncpg://postgres:niit%40123@localhost:5432/smarthiredb001'
os.environ['SMARTHIRE_DB_SCHEMA'] = 'smarthire'

from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

async def main():
    engine = create_async_engine(os.environ['DATABASE_URL'])
    async with engine.begin() as conn:
        sql = text("SELECT table_name FROM information_schema.tables WHERE table_schema='smarthire' ORDER BY table_name")
        result = await conn.execute(sql)
        tables = [r[0] for r in result.fetchall()]
        print('\n'.join(tables))
        
        # Check tower_master specifically
        try:
            r2 = await conn.execute(text("SELECT count(*) FROM smarthire.tower_master"))
            print("tower_master count:", r2.scalar())
        except Exception as e:
            print("tower_master error:", e)

asyncio.run(main())
