import "server-only";
import { query } from "./query";
import { consumeRequest, type RateBucket } from "./rate-limit-repository";
export async function requestLimit(userId: string, bucket: RateBucket) {
  const result = await consumeRequest(query, userId, bucket);
  return result.allowed
    ? null
    : Response.json(
        { error: "요청이 너무 많습니다. 잠시 후 다시 시도해 주세요." },
        {
          status: 429,
          headers: {
            "Retry-After": String(result.retryAfter),
            "Cache-Control": "private, no-store",
          },
        },
      );
}
