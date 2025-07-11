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

## Azure Architecture & Deployment

This project is deployed on Azure as a single, unified **Azure Static Web App**. This service automatically hosts the frontend and manages the serverless API functions. Deployment is handled automatically by a GitHub Actions workflow (`.github/workflows/azure-static-web-apps.yml`) whenever changes are pushed to the `main` branch.

The architecture consists of:

-   **Azure Static Web Apps:** Hosts the frontend (`/frontend`) and the serverless API (`/api`).
    -   **App Name:** `ycoach-v2`
    -   **Resource Group:** `YCPitchCoachSWA`
-   **Azure Functions:** Provides the backend logic for user authentication.
    -   `signup_user`: Handles new user registration.
    -   `login_user`: Handles user login.
-   **Azure Cosmos DB:** A NoSQL database used to store user data.
    -   **Account:** `ycom-db`
    -   **Database:** `YC-Coach-DB`
    -   **Container:** `Users`

## Environment Variables & Secrets

The deployment requires the following to be configured as **secrets in the GitHub repository** and as **Application Settings in the Azure Static Web App**:

| Variable                  | Description                                | Required |
| ------------------------- | ------------------------------------------ | -------- |
| `OPENAI_API_KEY`          | Your OpenAI API key                        | Yes      |
| `CosmosDbConnectionString`| The connection string for the Cosmos DB    | Yes      |

## Development Roadmap

- [x] Basic pitch generation
- [ ] User authentication
- [ ] Save/load pitch drafts
- [ ] Pitch history
- [ ] PDF export
- [ ] Advanced analytics

## License

MIT
