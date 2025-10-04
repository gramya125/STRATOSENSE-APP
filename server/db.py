from typing import Optional, Any, Dict
import os

# SQLModel (SQLite) minimal scaffold
try:
    from sqlmodel import SQLModel, Field, create_engine, Session, select
    SQLMODEL_AVAILABLE = True
except Exception:
    SQLMODEL_AVAILABLE = False

# Motor (MongoDB) minimal scaffold
try:
    import motor.motor_asyncio as motor
    MOTOR_AVAILABLE = True
except Exception:
    MOTOR_AVAILABLE = False


DATABASE_URL = os.environ.get('DATABASE_URL', 'sqlite:///./server.db')

if SQLMODEL_AVAILABLE:
    engine = create_engine(DATABASE_URL, echo=False)

    class Symptom(SQLModel, table=True):
        id: Optional[int] = Field(default=None, primary_key=True)
        text: str
        created_at: str

    def init_db():
        SQLModel.metadata.create_all(engine)

    def add_symptom(text: str, created_at: str):
        with Session(engine) as session:
            s = Symptom(text=text, created_at=created_at)
            session.add(s)
            session.commit()
            session.refresh(s)
            return s

else:
    def init_db():
        print('SQLModel not available; skipping DB init')

if MOTOR_AVAILABLE:
    MONGO_URI = os.environ.get('MONGO_URI', None)
    if MONGO_URI:
        mongo_client = motor.AsyncIOMotorClient(MONGO_URI)
        mongo_db = mongo_client.get_default_database()
    else:
        mongo_client = None
        mongo_db = None

else:
    mongo_client = None
    mongo_db = None

def ping_db() -> Dict[str, Any]:
    return {
        'sqlmodel': SQLMODEL_AVAILABLE,
        'motor': MOTOR_AVAILABLE and (mongo_client is not None),
    }
