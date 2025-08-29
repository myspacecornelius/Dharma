from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api import router as api_router
from .api import hyperlocal
from .database import check_db_connection, engine

app = FastAPI()

@app.on_event("startup")
def startup_event():
    check_db_connection()


# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check endpoint
@app.get("/health")
def health_check():
    return {"status": "ok"}

# Include API router
app.include_router(api_router)
app.include_router(hyperlocal.router, prefix="/v1", tags=["hyperlocal"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
