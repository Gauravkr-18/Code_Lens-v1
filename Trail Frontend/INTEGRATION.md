# Engine Integration Guide

This document explains how to connect/disconnect analyzer engines from the trial frontend **without modifying code**.

## Quick Switch: Mock ↔ Real Engines

### Step 1: Create Environment File

Copy the example configuration:

```bash
cp .env.example .env
```

### Step 2: Configure Mode

Edit `.env` and set your mode:

```env
# For testing without engines (current setup)
VITE_ANALYZER_MODE=mock

# To connect to real engines via HTTP
VITE_ANALYZER_MODE=http
VITE_ANALYZER_BASE_URL=http://localhost:8080

# To connect via WebSocket for streaming
VITE_ANALYZER_MODE=websocket
VITE_ANALYZER_BASE_URL=http://localhost:8080
```

### Step 3: Restart Dev Server

```bash
npm run dev
```

**That's it!** No code changes needed.

---

## Available Modes

### 1. Mock Mode (Current - For Trial)

**When to use:** Testing UI without engines, development, demos

```env
VITE_ANALYZER_MODE=mock
```

- No backend required
- Returns fake but realistic JSON
- 800ms simulated delay
- Perfect for frontend development

### 2. HTTP Mode (For Production Engines)

**When to use:** Engines running as REST API services

```env
VITE_ANALYZER_MODE=http
VITE_ANALYZER_BASE_URL=http://localhost:8080
```

**Expected Engine API:**

```
POST /analyze/c
POST /analyze/cpp
POST /analyze/java
POST /analyze/python
POST /analyze/javascript

Request Body:
{
  "code": "print('hello')",
  "language": "python"
}

Response:
{
  "language": "python",
  "timestamp": "2025-11-14T10:30:00Z",
  "sourceCode": "print('hello')",
  "steps": [...],
  "metadata": {...}
}
```

### 3. WebSocket Mode (For Real-time Streaming)

**When to use:** Long-running analysis, progress updates, large files

```env
VITE_ANALYZER_MODE=websocket
VITE_ANALYZER_BASE_URL=http://localhost:8080
```

**Expected WebSocket flow:**

1. Frontend connects to `ws://localhost:8080/ws`
2. Sends: `{ "code": "...", "language": "python" }`
3. Receives: Complete JSON response
4. Connection closes

### 4. Local Mode (For CLI Engines)

**When to use:** Engines are CLI tools, not services

```env
VITE_ANALYZER_MODE=local
VITE_ANALYZER_BASE_URL=http://localhost:8080
```

**Note:** This mode requires a lightweight Node.js proxy server that spawns CLI processes. The frontend cannot directly execute system commands.

---

## Engine-Specific Configuration

To customize endpoints per language, edit `src/services/analyzerService.js`:

```javascript
const ENGINE_CONFIG = {
  // ... other config ...
  endpoints: {
    c: '/analyze/c',           // Change these URLs
    cpp: '/analyze/cpp',       // to match your
    java: '/analyze/java',     // engine setup
    python: '/analyze/python',
    javascript: '/analyze/javascript'
  }
}
```

**Important:** After changing `ENGINE_CONFIG`, restart the dev server.

---

## Switching to Main Frontend

When transitioning from trial to main frontend:

1. **Copy** `.env` configuration
2. **Copy** `src/services/analyzerService.js` logic
3. **Reuse** JSON schema contract
4. **Update** UI components with production versions

The analyzer integration layer remains the same!

---

## Troubleshooting

### "Engine connection failed"

- Check that engines are running on correct ports
- Verify `VITE_ANALYZER_BASE_URL` matches engine address
- Check CORS settings on engine services

### "Analysis timeout"

- Increase timeout in `ENGINE_CONFIG.timeout` (default 30s)
- Check engine performance and optimize if needed

### Changes not taking effect

- Restart dev server after changing `.env`
- Clear browser cache (`Ctrl+Shift+R`)
- Check browser console for errors

---

## Example: Complete Setup for HTTP Engines

1. **Start your engines** (example):
   ```bash
   # Terminal 1: Python engine
   cd ../Engines/Main/Python\ Engine
   python analyzer.py --port 8081
   
   # Terminal 2: JavaScript engine
   cd ../Engines/Main/JavaScript\ Engine
   node analyzer.js --port 8082
   ```

2. **Update engine configuration** in `src/services/analyzerService.js`:
   ```javascript
   endpoints: {
     python: 'http://localhost:8081/analyze',
     javascript: 'http://localhost:8082/analyze',
     // ... other languages
   }
   ```

3. **Configure frontend** `.env`:
   ```env
   VITE_ANALYZER_MODE=http
   VITE_ANALYZER_BASE_URL=http://localhost:8080
   ```

4. **Start frontend**:
   ```bash
   npm run dev
   ```

---

## For Future Developers

**Rule #1:** Never hardcode engine URLs in UI components

**Rule #2:** All engine communication goes through `analyzerService.js`

**Rule #3:** Keep JSON schema consistent across all engines

**Rule #4:** Use `.env` for configuration, not code changes

This design ensures the frontend can work with ANY backend implementation without code modifications.
