/**
 * Multiplier for every wall-clock budget and timeout in the tests, from `PUG_LINT_TIME_SCALE`
 * (default 1). CI sets it above 1 because shared and Windows runners are slower and noisier.
 */
export function timeScale(raw: string | undefined): number {
  if (raw === undefined || raw === '') return 1
  const n = Number(raw)
  if (!Number.isFinite(n) || n <= 0) throw new Error(`PUG_LINT_TIME_SCALE must be a positive number, got ${JSON.stringify(raw)}`)
  return n
}

/** `ms` multiplied by the time scale. */
export function scaled(ms: number): number {
  return ms * timeScale(process.env.PUG_LINT_TIME_SCALE)
}
