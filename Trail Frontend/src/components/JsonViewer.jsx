import { useState } from 'react'
import './JsonViewer.css'

function JsonViewer({ data }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    if (!data) return
    
    const jsonString = JSON.stringify(data, null, 2)
    navigator.clipboard.writeText(jsonString)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="json-viewer">
      <div className="viewer-header">
        <span className="viewer-title">Execution JSON</span>
        <button 
          className="copy-button"
          onClick={handleCopy}
          disabled={!data}
        >
          {copied ? '✓ Copied!' : 'Copy JSON'}
        </button>
      </div>
      <div className="viewer-content">
        {data ? (
          <pre className="json-output">
            {JSON.stringify(data, null, 2)}
          </pre>
        ) : (
          <div className="empty-state">
            <span className="empty-icon">📋</span>
            <p>No analysis results yet</p>
            <p className="empty-hint">Enter code and click Analyze</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default JsonViewer
