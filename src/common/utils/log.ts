export function log(text: string) {
  if (!log.enabled) return
  console.log(`[COW TRADING SDK] ${text}`)
}

log.enabled = false
