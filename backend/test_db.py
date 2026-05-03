import sys
import traceback
from database import SessionLocal, engine
import models

try:
    print("Testing DB Connection...")
    models.Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    print("DB Connection OK!")
    
    import auth
    pw = auth.get_password_hash("test")
    print("Password hashing OK!")
except Exception as e:
    traceback.print_exc()
