export function defaultColabUrl(week: number) {
  return `https://colab.research.google.com/github/karpnevets/26-2-ml-fundamentals/blob/main/notebooks/week-${week}.ipynb`;
}
export function validColabUrl(value: unknown): value is string {
  if (typeof value !== "string" || value.length > 2000) return false;
  if (!value) return true;
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      url.hostname === "colab.research.google.com" &&
      !url.port &&
      !url.username &&
      !url.password &&
      (/^\/drive\/[\w-]+$/.test(url.pathname) ||
        /^\/github\/[\w.-]+\/[\w.-]+\/blob\/.+\.ipynb$/.test(url.pathname))
    );
  } catch {
    return false;
  }
}
