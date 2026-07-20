import sqlite3
import json
from datetime import datetime

class Database:
    def __init__(self, db_name="curator.db"):
        self.db_name = db_name
        self.create_tables()
    
    def create_tables(self):
        conn = sqlite3.connect(self.db_name)
        cursor = conn.cursor()
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS courses (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                topic TEXT,
                subtopics TEXT,
                resources TEXT,
                roadmap TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        conn.commit()
        conn.close()
    
    def save_course(self, topic, subtopics, resources, roadmap):
        conn = sqlite3.connect(self.db_name)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO courses (topic, subtopics, resources, roadmap)
            VALUES (?, ?, ?, ?)
        ''', (topic, json.dumps(subtopics), json.dumps(resources), json.dumps(roadmap)))
        
        conn.commit()
        conn.close()
    
    def get_all_courses(self):
        conn = sqlite3.connect(self.db_name)
        cursor = conn.cursor()
        
        cursor.execute('SELECT id, topic, created_at FROM courses ORDER BY created_at DESC')
        results = cursor.fetchall()
        conn.close()
        
        return results
    
    def get_course(self, course_id):
        conn = sqlite3.connect(self.db_name)
        cursor = conn.cursor()
        
        cursor.execute('SELECT * FROM courses WHERE id = ?', (course_id,))
        result = cursor.fetchone()
        conn.close()
        
        return result