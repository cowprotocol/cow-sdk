let logEnabled = false

export function log(text: string) {
  if (!logEnabled) return
  console.log(`[COW TRADING SDK] ${text}`)
}

export function enableLogging(enabled: boolean) {
  logEnabled = enabled
}
