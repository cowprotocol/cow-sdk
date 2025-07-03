export function defineReadOnly<T, K extends keyof T>(object: T, name: K, value: T[K]): void {
  Object.defineProperty(object, name, {
    enumerable: true,
    value: value,
    writable: false,
  })
}

export function getStatic<T>(ctor: any, key: string): T | null {
  for (let i = 0; i < 32; i++) {
    if (ctor[key]) {
      return ctor[key]
    }
    if (!ctor.prototype || typeof ctor.prototype !== 'object') {
      break
    }
    ctor = Object.getPrototypeOf(ctor.prototype).constructor
  }
  return null
}
