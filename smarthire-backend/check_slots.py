import asyncio, os
os.environ['DATABASE_URL'] = 'postgresql+asyncpg://postgres:niit%40123@localhost:5432/smarthiredb001'
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

async def main():
    engine = create_async_engine(os.environ['DATABASE_URL'])
    async with engine.begin() as conn:
        r = await conn.execute(text("SELECT column_name FROM information_schema.columns WHERE table_schema='smarthire' AND table_name='interviewer_calendar_details' ORDER BY ordinal_position"))
        print('cols:', [x[0] for x in r.fetchall()])
        r2 = await conn.execute(text("SELECT id, interviewer_id, interview_date, booking_status FROM smarthire.interviewer_calendar_details LIMIT 5"))
        for row in r2.fetchall():
            print(row)
asyncio.run(main())
