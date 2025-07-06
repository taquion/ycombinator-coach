# YC Pitch Coach

An AI-powered tool that helps startup founders create and refine their Y Combinator pitch.

## Features

- Generate a compelling 60-second YC pitch
- Get a YC readiness score
- Receive actionable suggestions for improvement
- Simple, intuitive interface

## Local Development Setup

### Prerequisites

- Python 3.8+
- Node.js 14+ (for frontend development)
- Azure Functions Core Tools (for local backend)
- OpenAI API key

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create and activate a virtual environment:
   ```bash
   # Windows
   python -m venv .venv
   .venv\Scripts\activate
   
   # macOS/Linux
   python3 -m venv .venv
   source .venv/bin/activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Create a `.env` file in the backend directory with your OpenAI API key:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   ```

5. Run the Azure Function locally:
   ```bash
   func start
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Open `script.js` and update the `AZURE_FUNCTION_URL` with your local function URL (usually `http://localhost:7071/api/pitch_generator` when running locally).

3. For local development, you can use a simple HTTP server to serve the frontend:
   ```bash
   # Python 3
   python -m http.server 8000
   
   # Or with Node.js
   npx http-server -p 8000
   ```

4. Open `http://localhost:8000` in your browser.

## Deployment

### Azure Static Web App (Frontend)

1. Push your code to a GitHub repository
2. Create a new Static Web App in Azure Portal
3. Connect to your GitHub repository
4. Configure build settings:
   - App location: `frontend`
   - App artifact location: `frontend`
   - API location: `backend`

### Azure Functions (Backend)

1. Create a new Function App in Azure Portal
2. Set the runtime stack to Python
3. Add your OpenAI API key in Configuration > Application settings
4. Deploy your function using Azure Functions Core Tools or GitHub Actions

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENAI_API_KEY` | Your OpenAI API key | Yes |

## Development Roadmap

- [x] Basic pitch generation
- [ ] User authentication
- [ ] Save/load pitch drafts
- [ ] Pitch history
- [ ] PDF export
- [ ] Advanced analytics

## License

MIT
