-- Idempotency verification for Time → Invoice import
-- Expect 0 rows if idempotency is enforced correctly
select timelog_id, count(*) as occurrences
from invoice_lines
group by 1
having count(*) > 1;
