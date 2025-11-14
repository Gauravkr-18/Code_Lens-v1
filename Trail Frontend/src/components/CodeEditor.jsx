import './CodeEditor.css'

function CodeEditor({ code, onChange, language }) {
  return (
    <div className="code-editor">
      <div className="editor-header">
        <span className="editor-title">Code Input</span>
        <span className="editor-language">{language}</span>
      </div>
      <textarea
        className="editor-textarea"
        value={code}
        onChange={(e) => onChange(e.target.value)}
        placeholder={`Enter your ${language} code here...`}
        spellCheck="false"
      />
    </div>
  )
}

export default CodeEditor
