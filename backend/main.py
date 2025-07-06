from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import openai
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI(title="YC Pitch Coach API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class PitchRequest(BaseModel):
    name: str
    description: str
    problem: str
    solution: str
    team: str
    traction: str

@app.get("/")
async def root():
    return {"message": "YC Pitch Coach API is running"}

@app.post("/api/generate_pitch")
async def generate_pitch(request: PitchRequest):
    try:
        # Get API key from environment
        openai.api_key = os.getenv("OPENAI_API_KEY")
        if not openai.api_key:
            raise HTTPException(status_code=500, detail="OpenAI API key not configured")
        
        # Create the prompt
        prompt = f"""Create a compelling YC pitch for the following startup:

Startup Name: {request.name}
One-liner: {request.description}

Problem:
{request.problem}

Solution:
{request.solution}

Team:
{request.team}

Traction:
{request.traction}

Please provide:
1. A compelling 60-second pitch
2. YC Readiness Score (1-10) with brief rationale
3. 2-3 specific, actionable suggestions for improvement"""

        # Call OpenAI API
        response = openai.ChatCompletion.create(
            model="gpt-4-turbo-preview",
            messages=[
                {"role": "system", "content": "You are an expert startup advisor helping founders create compelling Y Combinator pitches."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=1000
        )
        
        feedback = response.choices[0].message.content.strip()
        return {"feedback": feedback}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
