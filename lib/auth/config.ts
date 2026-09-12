import "server-only";
export function authConfigured() {
  return [
    process.env.DATABASE_URL,
    process.env.AUTH_SECRET,
    process.env.AUTH_GOOGLE_ID,
    process.env.AUTH_GOOGLE_SECRET,
  ].every((v) => !!v?.trim());
}
export function localOnlyMode() {
  // Missing production credentials must never turn a deployment into a pretend signed-in service.
  return (
    !process.env.VERCEL &&
    ![
      process.env.DATABASE_URL,
      process.env.AUTH_SECRET,
      process.env.AUTH_GOOGLE_ID,
      process.env.AUTH_GOOGLE_SECRET,
    ].some((v) => !!v?.trim())
  );
}
