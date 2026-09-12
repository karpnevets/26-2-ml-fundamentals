import { currentActor } from "@/lib/auth/actor";
import { authConfigured, localOnlyMode } from "@/lib/auth/config";
import { json } from "@/lib/http";
export const dynamic = "force-dynamic";
export async function GET() {
  if (!authConfigured())
    return json({
      mode: localOnlyMode() ? "local" : "unavailable",
      user: null,
    });
  try {
    const user = await currentActor();
    return json({ mode: user ? "account" : "guest", user });
  } catch {
    return json(
      { error: "계정 상태를 확인하지 못했습니다. 잠시 후 다시 시도하세요." },
      503,
    );
  }
}
