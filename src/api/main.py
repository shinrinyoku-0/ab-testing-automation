from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .routers import users, files, sample_size

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="A/B Testing Experimentation Platform")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(files.router, prefix="/api/files", tags=["files"])
app.include_router(sample_size.router, prefix="/api")

@app.get("/")
async def root():
    return {"message":  "Welcome to A/B Testing Experimentation Platform"}
