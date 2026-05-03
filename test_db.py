import sys
import traceback
from backend.database import SessionLocal, engine
from backend import models

try:
    print("Testing DB Connection...")
    models.Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    print("DB Connection OK!")
    
    from backend import auth
    # try creating a test user
    pw = auth.get_password_hash("test")
    print("Password hashing OK!")
except Exception as e:
    traceback.print_exc()

