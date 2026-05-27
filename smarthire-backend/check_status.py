import asyncio
import os
os.environ['DATABASE_URL'] = 'postgresql+asyncpg://postgres:niit%40123@localhost:5432/smarthiredb001'
os.environ['SMARTHIRE_DB_SCHEMA'] = 'smarthire'

from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

async def main():
    engine = create_async_engine(os.environ['DATABASE_URL'])
    async with engine.begin() as conn:
        # Check candidate_status table
        # Check status_master columns
        r0 = await conn.execute(text("SELECT column_name FROM information_schema.columns WHERE table_schema='smarthire' AND table_name='status_master'"))
        print('status_master cols:', [x[0] for x in r0.fetchall()])
        r = await conn.execute(text("SELECT cs.id, cs.candidate_id, cs.status_id FROM smarthire.candidate_status cs LIMIT 10"))
        rows = r.fetchall()
        for row in rows:
            print(row)
        
        print("\n--- Candidate counts by status ---")
        r2 = await conn.execute(text("SELECT cs.status_id, count(*) FROM smarthire.candidate_status cs GROUP BY cs.status_id"))
        for row in r2.fetchall():
            print(row)

asyncio.run(main())
