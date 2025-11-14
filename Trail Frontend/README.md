# Code Lens - Trail Frontend

A minimal trial frontend for the Code Lens project. This React application provides a clean interface for testing analyzer engines with minimal coupling, allowing easy transition to the main frontend in the future.

## Features

- **Split-pane interface**: Code input (left) and JSON output (right)
- **Multi-language support**: C, C++, Java, Python, JavaScript
- **Copy functionality**: One-click JSON copying
- **No scroll design**: Fixed viewport for focused workflow
- **Decoupled architecture**: Analyzer service abstraction for easy backend swapping

## Quick Start

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The app will open at `http://localhost:3000`

### Build for Production

```bash
npm run build
```

Output will be in the `dist/` folder.

## Architecture

### Component Structure

```
src/
├── App.jsx              # Main app component with state management
├── components/
│   ├── Toolbar.jsx      # Language selector and analyze button
│   ├── CodeEditor.jsx   # Left pane: code input textarea
│   └── JsonViewer.jsx   # Right pane: JSON output with copy button
└── services/
    └── analyzerService.js   # Backend adapter (currently mocked)
```

### Connecting to Real Analyzer Engines

The frontend is intentionally decoupled from the analyzer engines. To connect real backends, modify **only** `src/services/analyzerService.js`:

#### Option 1: HTTP/REST API

```javascript
export const analyzeCode = async (code, language) => {
  const response = await fetch('http://localhost:8080/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, language })
  })
  return await response.json()
}
```

#### Option 2: WebSocket (Real-time)

```javascript
export const analyzeCode = async (code, language) => {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket('ws://localhost:8080')
    ws.onmessage = (event) => {
      resolve(JSON.parse(event.data))
      ws.close()
    }
    ws.onopen = () => ws.send(JSON.stringify({ code, language }))
    ws.onerror = reject
  })
}
```

#### Option 3: CLI Execution (Node child_process)

```javascript
import { exec } from 'child_process'

export const analyzeCode = async (code, language) => {
  return new Promise((resolve, reject) => {
    const enginePath = `../Engines/Main/${language}-engine/bin/analyzer`
    exec(`echo "${code}" | ${enginePath}`, (error, stdout) => {
      if (error) reject(error)
      else resolve(JSON.parse(stdout))
    })
  })
}
```

### Expected JSON Schema

Analyzer engines should return JSON matching this structure:

```json
{
  "language": "python",
  "timestamp": "2025-11-14T10:30:00.000Z",
  "sourceCode": "x = 10\nprint(x)",
  "steps": [
    {
      "stepNumber": 1,
      "line": 1,
      "code": "x = 10",
      "operation": "assignment",
      "state": {
        "variables": { "x": 10 },
        "stack": [],
        "heap": {}
      }
    }
  ],
  "metadata": {
    "totalSteps": 2,
    "executionTime": "0.003s",
    "memoryUsed": "2.4 MB"
  }
}
```

## Design Philosophy

This is a **trail frontend** designed for:

1. **Isolation**: Minimal coupling with analyzer engines
2. **Replaceability**: Easy to swap for main frontend later
3. **Testing**: Quick validation of engine outputs
4. **Simplicity**: No complex state management or routing

## Migration Path

When transitioning to the main frontend:

1. Copy `analyzerService.js` logic to new backend integration layer
2. Reuse the JSON schema contract
3. Replace UI components with production versions
4. Add authentication, persistence, and advanced features

## Tech Stack

- **React 18** - UI library
- **Vite 5** - Build tool and dev server
- **Pure CSS** - No UI framework dependencies for minimal bundle size

## License

Part of the Code Lens project.
