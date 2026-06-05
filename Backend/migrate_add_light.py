"""
One-time migration: adds light_intensity column to sensor_readings table.
Run once: python migrate_add_light.py
"""
from app.database.connection import engine
from sqlalchemy import text

with engine.connect() as conn:
    try:
        conn.execute(text(
            "ALTER TABLE sensor_readings ADD COLUMN IF NOT EXISTS light_intensity FLOAT DEFAULT 0.0"
        ))
        conn.commit()
        print("Migration complete: light_intensity column added.")
    except Exception as e:
        print(f"Migration skipped or failed: {e}")
