/**
 * Analyzer Service Adapter
 * 
 * This service provides a clean abstraction layer between the UI and the analyzer engines.
 * It allows easy swapping of backend implementations without modifying UI components.
 * 
 * Configuration:
 * - Set VITE_ANALYZER_MODE in .env file: 'mock' | 'http' | 'websocket' | 'local'
 * - Set VITE_ANALYZER_BASE_URL for HTTP/WebSocket endpoints
 * - Modify ENGINE_CONFIG below to map language-specific endpoints
 * 
 * Usage:
 * - Import and call analyzeCode() from your components
 * - Switch modes by changing .env file, no code changes needed
 * - Keep the return type consistent for UI compatibility
 */

// Dynamic configuration - modify this to connect/disconnect engines
const ENGINE_CONFIG = {
  mode: import.meta.env.VITE_ANALYZER_MODE || 'mock', // 'mock' | 'http' | 'websocket' | 'local'
  baseUrl: import.meta.env.VITE_ANALYZER_BASE_URL || 'http://localhost:8080',
  endpoints: {
    c: '/analyze/c',
    cpp: '/analyze/cpp',
    java: '/analyze/java',
    python: '/analyze/python',
    javascript: '/analyze/javascript'
  },
  timeout: 30000 // 30 seconds
}

export const analyzeCode = async (code, language) => {
  if (!code.trim()) {
    throw new Error('Code cannot be empty')
  }

  // Route to appropriate implementation based on mode
  switch (ENGINE_CONFIG.mode) {
    case 'http':
      return analyzeViaHttp(code, language)
    case 'websocket':
      return analyzeViaWebSocket(code, language)
    case 'local':
      return analyzeViaLocal(code, language)
    case 'mock':
    default:
      return analyzeViaMock(code, language)
  }
}

// Mock implementation - for trial/testing
async function analyzeViaMock(code, language) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const mockResponse = {
        language: language,
        timestamp: new Date().toISOString(),
        sourceCode: code,
        steps: generateMockSteps(code, language),
        metadata: {
          totalSteps: 5,
          executionTime: '0.003s',
          memoryUsed: '2.4 MB',
          mode: 'mock'
        }
      }
      resolve(mockResponse)
    }, 800)
  })
}

// HTTP implementation - for REST API engines
async function analyzeViaHttp(code, language) {
  const endpoint = ENGINE_CONFIG.endpoints[language]
  const url = `${ENGINE_CONFIG.baseUrl}${endpoint}`

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), ENGINE_CONFIG.timeout)

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code, language }),
      signal: controller.signal
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`Engine returned ${response.status}: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Analysis timeout - engine took too long to respond')
    }
    throw new Error(`Engine connection failed: ${error.message}`)
  }
}

// WebSocket implementation - for real-time streaming engines
async function analyzeViaWebSocket(code, language) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(`${ENGINE_CONFIG.baseUrl.replace('http', 'ws')}/ws`)
    const timeoutId = setTimeout(() => {
      ws.close()
      reject(new Error('Analysis timeout'))
    }, ENGINE_CONFIG.timeout)

    ws.onopen = () => {
      ws.send(JSON.stringify({ code, language }))
    }

    ws.onmessage = (event) => {
      clearTimeout(timeoutId)
      try {
        const result = JSON.parse(event.data)
        resolve(result)
        ws.close()
      } catch (error) {
        reject(new Error('Invalid response from engine'))
        ws.close()
      }
    }

    ws.onerror = (error) => {
      clearTimeout(timeoutId)
      reject(new Error('WebSocket connection failed'))
    }
  })
}

// Local implementation - for CLI-based engines (requires backend proxy)
async function analyzeViaLocal(code, language) {
  // This requires a local Node.js backend that spawns child processes
  // Frontend cannot directly execute system commands for security reasons
  return analyzeViaHttp(code, language)
}

// Helper to generate realistic mock steps based on language
function generateMockSteps(code, language) {
  const lines = code.split('\n').filter(line => line.trim())
  
  return lines.slice(0, 5).map((line, index) => ({
    stepNumber: index + 1,
    line: index + 1,
    code: line.trim(),
    operation: detectOperation(line, language),
    state: {
      variables: {},
      stack: [],
      heap: {}
    }
  }))
}

function detectOperation(line, language) {
  if (line.includes('print') || line.includes('console.log') || line.includes('System.out')) {
    return 'output'
  }
  if (line.includes('=') && !line.includes('==')) {
    return 'assignment'
  }
  if (line.includes('if') || line.includes('while') || line.includes('for')) {
    return 'control_flow'
  }
  if (line.includes('def ') || line.includes('function ') || line.includes('void ')) {
    return 'function_declaration'
  }
  return 'statement'
}

export default {
  analyzeCode
}
