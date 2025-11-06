# Worker Scaling Notes

## Database Locking Strategy

Use `FOR UPDATE SKIP LOCKED` when claiming jobs to prevent duplicates across workers.

### Example Query Pattern

```sql
SELECT * FROM social_queue
WHERE status = 'pending'
AND (next_attempt_at IS NULL OR next_attempt_at <= NOW())
ORDER BY scheduled_at ASC
LIMIT 1
FOR UPDATE SKIP LOCKED;
```

## Concurrency Configuration

Set `CONCURRENCY` environment variable to control the number of worker processes:

```bash
CONCURRENCY=4 npm run worker:social
```

Default: Number of CPU cores (`os.cpus().length`)

## Graceful Shutdown

Workers should:
1. Stop accepting new jobs when SIGTERM received
2. Complete current job before exiting
3. Update job status to allow retry by other workers

## Soak Testing

Run with `CONCURRENCY=4` for at least 1 hour to verify:
- Zero duplicate posts
- No dropped jobs
- Proper error handling
- Memory stability
