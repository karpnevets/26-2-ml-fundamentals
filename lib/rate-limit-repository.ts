import type { Query } from "./progress-repository";
export const requestLimits = {
  read: 120,
  write: 60,
  import: 6,
  unlock: 30,
} as const;
export type RateBucket = keyof typeof requestLimits;
export async function consumeRequest(
  query: Query,
  userId: string,
  bucket: RateBucket,
) {
  const limit = requestLimits[bucket];
  const [row] = await query(
    `INSERT INTO api_rate_limits(user_id,bucket) VALUES($1::uuid,$2)
     ON CONFLICT(user_id,bucket) DO UPDATE SET
     attempts=CASE WHEN api_rate_limits.window_start <= now()-interval '1 minute' THEN 1 ELSE LEAST(api_rate_limits.attempts+1,$3::integer+1) END,
     window_start=CASE WHEN api_rate_limits.window_start <= now()-interval '1 minute' THEN now() ELSE api_rate_limits.window_start END
     RETURNING attempts,GREATEST(1,CEIL(EXTRACT(EPOCH FROM window_start+interval '1 minute'-now())))::integer AS retry_after`,
    [userId, bucket, limit],
  );
  return {
    allowed: Number(row.attempts) <= limit,
    retryAfter: Number(row.retry_after),
  };
}
