export function ResultContent({ data }: { data: any }) {
  return (
    <div className="result-content">
      <h3>Result:</h3>
      <textarea readOnly={true} value={JSON.stringify(data, null, 4)}></textarea>
    </div>
  )
}
