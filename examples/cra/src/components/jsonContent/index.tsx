import { ClipboardEvent, useCallback, useEffect, useRef, useState } from 'react'

export function JsonContent<T>({ defaultValue, onChange }: { defaultValue: T; onChange: (data: T | null) => void }) {
  const [isValid, setIsValid] = useState(true)
  const ref = useRef<HTMLPreElement>(null)

  const onPasteCallback = useCallback((event: ClipboardEvent) => {
    event.preventDefault()
    document.execCommand('inserttext', false, event.clipboardData?.getData('text/plain'))
  }, [])

  const onChangeCallback = useCallback(() => {
    const text = ref.current?.innerText || ''

    try {
      onChange(JSON.parse(text))
      setIsValid(true)
    } catch (e) {
      console.error(e)
      console.log(text)
      setIsValid(false)
    }
  }, [onChange])

  useEffect(() => {
    onChangeCallback()
  }, [defaultValue, onChangeCallback])

  return (
    <pre
      ref={ref}
      className={`json-content ${isValid ? '' : 'invalid'}`}
      contentEditable={true}
      onPaste={onPasteCallback}
      onInput={onChangeCallback}
    >
      {JSON.stringify(defaultValue, null, 4)}
    </pre>
  )
}
