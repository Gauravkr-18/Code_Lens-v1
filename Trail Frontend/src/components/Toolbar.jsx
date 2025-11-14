import './Toolbar.css'

function Toolbar({ language, onLanguageChange, onAnalyze, isAnalyzing }) {
  const languages = [
    { value: 'c', label: 'C' },
    { value: 'cpp', label: 'C++' },
    { value: 'java', label: 'Java' },
    { value: 'python', label: 'Python' },
    { value: 'javascript', label: 'JavaScript' }
  ]

  return (
    <div className="toolbar">
      <div className="toolbar-left">
        <h1 className="toolbar-title">Code Lens</h1>
        <span className="toolbar-badge">Trial</span>
      </div>
      <div className="toolbar-right">
        <select 
          className="language-selector"
          value={language}
          onChange={(e) => onLanguageChange(e.target.value)}
        >
          {languages.map(lang => (
            <option key={lang.value} value={lang.value}>
              {lang.label}
            </option>
          ))}
        </select>
        <button 
          className="analyze-button"
          onClick={onAnalyze}
          disabled={isAnalyzing}
        >
          {isAnalyzing ? 'Analyzing...' : 'Analyze'}
        </button>
      </div>
    </div>
  )
}

export default Toolbar
