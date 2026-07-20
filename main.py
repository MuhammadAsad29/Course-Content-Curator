from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from agent import CourseAgent
from database import Database
from pydantic import BaseModel
import json

app = FastAPI(docs_url="/docs", openapi_url="/openapi.json")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

agent = CourseAgent()
db = Database()

class TopicRequest(BaseModel):
    topic: str

@app.post("/curate")
async def curate_course(request: TopicRequest):
    """Curate course and save to DB"""
    result = agent.curate_course(request.topic)
    
    # Save to database
    db.save_course(
        result['topic'],
        result['subtopics'],
        result['resources'],
        result['roadmap']
    )
    
    return result

@app.get("/courses")
async def get_all_courses():
    """Get all saved courses"""
    courses = db.get_all_courses()
    return {"courses": courses}

@app.get("/courses/{course_id}")
async def get_course(course_id: int):
    """Get specific course"""
    course = db.get_course(course_id)
    if course:
        try:
            subtopics = json.loads(course[2])
        except Exception:
            subtopics = course[2]
            
        try:
            resources = json.loads(course[3])
        except Exception:
            resources = course[3]
            
        try:
            roadmap = json.loads(course[4])
        except Exception:
            roadmap = course[4]
            
        return {
            "id": course[0],
            "topic": course[1],
            "subtopics": subtopics,
            "resources": resources,
            "roadmap": roadmap
        }
    return {"error": "Course not found"}

@app.get("/health")
async def health():
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)