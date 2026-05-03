from database import engine
from sqlalchemy import text

def upgrade():
    with engine.connect() as conn:
        print("Migrating users table...")
        try:
            conn.execute(text("ALTER TABLE users MODIFY email VARCHAR(255) NULL;"))
            conn.execute(text("ALTER TABLE users MODIFY hashed_password VARCHAR(255) NULL;"))
        except Exception as e:
            print("Alter email/password failed (might already be nullable):", e)
            
        try:
            conn.execute(text("ALTER TABLE users ADD COLUMN google_id VARCHAR(255) UNIQUE;"))
        except Exception as e:
            print("Add google_id failed:", e)

        try:
            conn.execute(text("ALTER TABLE users ADD COLUMN kakao_id VARCHAR(255) UNIQUE;"))
        except Exception as e:
            print("Add kakao_id failed:", e)

        try:
            conn.execute(text("ALTER TABLE users ADD COLUMN naver_id VARCHAR(255) UNIQUE;"))
        except Exception as e:
            print("Add naver_id failed:", e)
            
        print("Migrating purchases table...")
        try:
            conn.execute(text("ALTER TABLE purchases ADD COLUMN view_count INTEGER DEFAULT 0;"))
        except Exception as e:
            print("Add view_count failed:", e)
            
        try:
            conn.execute(text("ALTER TABLE purchases ADD COLUMN total_view_time INTEGER DEFAULT 0;"))
        except Exception as e:
            print("Add total_view_time failed:", e)

        conn.commit()
        print("Database migration completed!")

if __name__ == '__main__':
    upgrade()
