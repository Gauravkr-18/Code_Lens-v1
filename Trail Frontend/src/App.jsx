import { useState } from 'react'
import './App.css'
import Toolbar from './components/Toolbar'
import CodeEditor from './components/CodeEditor'
import JsonViewer from './components/JsonViewer'
import { analyzeCode } from './services/analyzerService'

function App() {
  const [code, setCode] = useState('')
  const [language, setLanguage] = useState('python')
  const [jsonOutput, setJsonOutput] = useState(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const handleAnalyze = async () => {
    setIsAnalyzing(true)
    try {
      const result = await analyzeCode(code, language)
      setJsonOutput(result)
    } catch (error) {
      setJsonOutput({ error: error.message })
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="app">
      <Toolbar 
        language={language}
        onLanguageChange={setLanguage}
        onAnalyze={handleAnalyze}
        isAnalyzing={isAnalyzing}
      />
      <div className="content">
        <CodeEditor 
          code={code}
          onChange={setCode}
          language={language}
        />
        <JsonViewer 
          data={jsonOutput}
        />
      </div>
    </div>
  )
}

export default App
