import asyncio
import asyncpg
from datetime import datetime, timezone

async def main():
    conn = await asyncpg.connect('postgresql://postgres:niit%40123@localhost:5432/smarthiredb001')
    await conn.execute("SET search_path TO smarthire")
    now = datetime.now(timezone.utc).replace(tzinfo=None)
    
    for cid in [3, 4]:
        # End current open status
        await conn.execute(
            'UPDATE candidate_status SET status_end_date=$1 WHERE candidate_id=$2 AND status_end_date IS NULL',
            now, cid
        )
        # Insert SHORTLISTED
        await conn.execute(
            'INSERT INTO candidate_status (candidate_id, status_id, status_start_date, changed_by, created_by, created_date) VALUES ($1, 2, $2, $3, $4, $5)',
            cid, now, 'recruiter', 'recruiter', now
        )
    
    rows = await conn.fetch(
        'SELECT cs.candidate_id, cm.candidate_name, cs.status_id '
        'FROM candidate_status cs '
        'JOIN candidate_detail cm ON cm.id=cs.candidate_id '
        'WHERE cs.status_id=2 AND cs.status_end_date IS NULL'
    )
    for r in rows:
        print(dict(r))
    await conn.close()

asyncio.run(main())
