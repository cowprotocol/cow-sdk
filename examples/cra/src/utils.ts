import { FormEvent } from 'react'

export function parseFormData<T = any>(event: FormEvent): T {
  const data = new FormData(event.target as HTMLFormElement)

  return Object.fromEntries(data.entries()) as T
}
