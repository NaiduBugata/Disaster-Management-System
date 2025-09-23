from fastapi import FastAPI, HTTPException, UploadFile, File, Query
from fastapi.responses import FileResponse
from pydantic import BaseModel, EmailStr
import mysql.connector
from passlib.hash import bcrypt
from passlib.context import CryptContext
from fastapi import Depends
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
from jose import jwt
from datetime import datetime, timedelta
import pandas as pd
import secrets
import os
import random
import string
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from fastapi import Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi import HTTPException
from fastapi import Security
from fastapi.security import HTTPAuthorizationCredentials
from typing import List, Dict, Any
import math

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Allow your frontend origin
origins = [
    "http://localhost:3000",  # React dev server
    # you can also use "*" to allow all origins (not recommended for production)
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins, 
    allow_credentials=True,
    allow_methods=["*"],  # GET, POST, etc.
    allow_headers=["*"],
)

# ---------------- Config ----------------
SECRET_KEY = "your_secret_key_here"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60


# ---------------- DB Connection ----------
def get_db_connection():
    return mysql.connector.connect(
        host="localhost",
        user="root",          
        password="root",     
        database="project_db" 
    )


def generate_username(name, i):
    return f"{name.lower().replace(' ', '')}{i}"

def generate_password():
    return ''.join(random.choices(string.ascii_letters + string.digits, k=8))

# ---------------- Models ----------------
class AdminRegister(BaseModel):
    full_name: str
    email: EmailStr
    username: str
    password: str

class AdminLogin(BaseModel):
    email_or_username: str
    password: str

class SchoolRegister(BaseModel):
    school_name: str
    school_type: str  # Elementary / High School / University
    address: str
    region_state: str
    contact_info: str
    num_students: int
    num_staff: int
    admin_name: str
    admin_email: EmailStr
    admin_phone: str
    password: str
    terms_accepted: bool
    emergency_contact_pref: str

class SchoolLogin(BaseModel):
    email_or_username: str
    password: str

class UpdatePassword(BaseModel):
    admin_id: int
    old_password: str
    new_password: str

class DeleteAdmin(BaseModel):
    admin_id: int

class UpdateSchoolPassword(BaseModel):
    school_id: int
    old_password: str
    new_password: str

class DeleteSchool(BaseModel):
    school_id: int

class Token(BaseModel):
    access_token: str
    token_type: str

class StudentLogin(BaseModel):
    email_or_username: str
    password: str


from pydantic import BaseModel
from typing import Optional, List

# Course
class CourseCreate(BaseModel):
    title: str
    description: str

# Module
class ModuleCreate(BaseModel):
    course_id: int
    title: str
    content: str
    video_url: Optional[str]
    module_order: int

# Quiz
class QuizCreate(BaseModel):
    module_id: int
    question: str
    option_a: str
    option_b: str
    option_c: str
    option_d: str
    correct_option: str

# Exam
class ExamCreate(BaseModel):
    course_id: int
    module_id: Optional[int] = None  # null for final exam
    title: str

# Exam Question
class ExamQuestionCreate(BaseModel):
    exam_id: int
    question: str
    option_a: str
    option_b: str
    option_c: str
    option_d: str
    correct_option: str


# ---------------- JWT Helper -------------
def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


# ---------------- Admin Register ---------
@app.post("/admin/register")
def register_admin(admin: AdminRegister):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("SELECT * FROM admins WHERE email=%s OR username=%s", (admin.email, admin.username))
    existing = cursor.fetchone()
    if existing:
        cursor.close()
        conn.close()
        raise HTTPException(status_code=400, detail="Email or Username already exists")

    hashed_password = bcrypt.hash(admin.password)

    cursor.execute(
        "INSERT INTO admins (full_name, email, username, password) VALUES (%s, %s, %s, %s)",
        (admin.full_name, admin.email, admin.username, hashed_password)
    )
    conn.commit()
    cursor.close()
    conn.close()

    return {"message": "Admin registered successfully"}


# ---------------- Admin Login ------------
@app.post("/admin/login")
def login_admin(login: AdminLogin):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute(
        "SELECT * FROM admins WHERE email=%s OR username=%s",
        (login.email_or_username, login.email_or_username)
    )
    admin = cursor.fetchone()
    cursor.close()
    conn.close()

    if not admin or not bcrypt.verify(login.password, admin["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token_data = {"sub": str(admin["id"]), "username": admin["username"]}
    access_token = create_access_token(token_data)

    return {"message": "Login successful", "token": access_token}


# ---------------- School Register --------
@app.post("/schools/register")
def register_school(school: SchoolRegister):
    if not school.terms_accepted:
        raise HTTPException(status_code=400, detail="Terms and Conditions must be accepted")

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("SELECT * FROM schools WHERE admin_email=%s", (school.admin_email,))
    existing = cursor.fetchone()
    if existing:
        cursor.close()
        conn.close()
        raise HTTPException(status_code=400, detail="Email already exists")

    hashed_password = bcrypt.hash(school.password)

    cursor.execute("""
        INSERT INTO schools (
            school_name, school_type, address, region_state, contact_info, 
            num_students, num_staff, admin_name, admin_email, admin_phone, 
            password, terms_accepted, emergency_contact_pref
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    """, (
        school.school_name, school.school_type, school.address, school.region_state, school.contact_info,
        school.num_students, school.num_staff, school.admin_name, school.admin_email, school.admin_phone,
        hashed_password, school.terms_accepted, school.emergency_contact_pref
    ))

    conn.commit()
    cursor.close()
    conn.close()

    return {"message": "School/Organization registered successfully"}


# ---------------- School Login -----------
@app.post("/schools/login")
def login_school(login: SchoolLogin):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute(
        "SELECT * FROM schools WHERE admin_email=%s OR admin_name=%s",
        (login.email_or_username, login.email_or_username)
    )
    school = cursor.fetchone()
    cursor.close()
    conn.close()

    if not school or not bcrypt.verify(login.password, school["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token_data = {"sub": str(school["id"]), "school_name": school["school_name"], "admin_email": school["admin_email"]}
    access_token = create_access_token(token_data)

    return {
    "message": "Login successful",
    "token": access_token,
    "school_id": school["id"]
}

# ---------------- Student Login ----------
@app.post("/students/login")
def login_student(login: StudentLogin):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    # Try login by email or username
    cursor.execute(
        "SELECT * FROM students WHERE email=%s OR username=%s",
        (login.email_or_username, login.email_or_username)
    )
    student = cursor.fetchone()
    cursor.close()
    conn.close()

    if not student:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    # ✅ Password handling: use hashed passwords if you hash on bulk upload
    # If still storing plain text passwords (not recommended), just compare directly
    stored_password = student["password"]
    if stored_password.startswith("$2b$"):  # bcrypt hash check
        if not bcrypt.verify(login.password, stored_password):
            raise HTTPException(status_code=401, detail="Invalid credentials")
    else:
        if login.password != stored_password:
            raise HTTPException(status_code=401, detail="Invalid credentials")

    # Token payload
    token_data = {
        "sub": str(student["id"]),
        "role": "student",
        "student_id": student["id"],
        "username": student["username"],
        "school_id": student["school_id"]
    }
    access_token = create_access_token(token_data)

    return {
        "message": "Login successful",
        "token": access_token,
        "student_id": student["id"],
        "school_id": student["school_id"]
    }





# ---------------- Admin Update Password --
@app.put("/admin/update-password")
def update_password(data: UpdatePassword):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("SELECT * FROM admins WHERE id=%s", (data.admin_id,))
    admin = cursor.fetchone()

    if not admin or not bcrypt.verify(data.old_password, admin["password"]):
        cursor.close()
        conn.close()
        raise HTTPException(status_code=401, detail="Invalid old password")

    new_hashed_password = bcrypt.hash(data.new_password)
    cursor.execute("UPDATE admins SET password=%s WHERE id=%s", (new_hashed_password, data.admin_id))
    conn.commit()
    cursor.close()
    conn.close()

    return {"message": "Password updated successfully"}


# ---------------- Delete Admin -----------
@app.delete("/admin/delete")
def delete_admin(data: DeleteAdmin):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("DELETE FROM admins WHERE id=%s", (data.admin_id,))
    conn.commit()
    deleted = cursor.rowcount

    cursor.close()
    conn.close()

    if deleted == 0:
        raise HTTPException(status_code=404, detail="Admin not found")

    return {"message": "Admin deleted successfully"}


# ---------------- School Update Password -
@app.put("/schools/update-password")
def update_school_password(data: UpdateSchoolPassword):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("SELECT * FROM schools WHERE id=%s", (data.school_id,))
    school = cursor.fetchone()

    if not school or not bcrypt.verify(data.old_password, school["password"]):
        cursor.close()
        conn.close()
        raise HTTPException(status_code=401, detail="Invalid old password")

    new_hashed_password = bcrypt.hash(data.new_password)
    cursor.execute("UPDATE schools SET password=%s WHERE id=%s", (new_hashed_password, data.school_id))
    conn.commit()
    cursor.close()
    conn.close()

    return {"message": "School password updated successfully"}


# ---------------- Delete School ----------
@app.delete("/schools/delete")
def delete_school(data: DeleteSchool):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("DELETE FROM schools WHERE id=%s", (data.school_id,))
    conn.commit()
    deleted = cursor.rowcount

    cursor.close()
    conn.close()

    if deleted == 0:
        raise HTTPException(status_code=404, detail="School not found")

    return {"message": "School deleted successfully"}


# ---------------- Bulk Upload Students ---
@app.post("/students/bulk-upload")
async def bulk_upload_students(school_id: int = Query(...), file: UploadFile = File(...)):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("SELECT * FROM schools WHERE id=%s", (school_id,))
    school = cursor.fetchone()
    if not school:
        cursor.close()
        conn.close()
        raise HTTPException(status_code=404, detail="School not found")

    if file.filename.endswith(".csv"):
        df = pd.read_csv(file.file)
    elif file.filename.endswith(".xlsx"):
        df = pd.read_excel(file.file)
    else:
        raise HTTPException(status_code=400, detail="Only CSV or XLSX supported")

    added_students = []
    for _, row in df.iterrows():
        name = row["name"]
        email = row["email"]
        username = email.split("@")[0]
        password = secrets.token_urlsafe(8)[:8]

        cursor.execute(
            "INSERT INTO students (name, email, username, password, school_id) VALUES (%s, %s, %s, %s, %s)",
            (name, email, username, password, school_id)
        )
        added_students.append({"name": name, "email": email, "username": username, "password": password})

    conn.commit()
    cursor.close()
    conn.close()

    return {"message": "Students uploaded successfully", "students_added": added_students}


# ---------------- Get Students -----------
# @app.get("/students/{school_id}")
# def get_students(school_id: int):
#     conn = get_db_connection()
#     cursor = conn.cursor(dictionary=True)

#     cursor.execute("SELECT id, name, email, username, password FROM students WHERE school_id=%s", (school_id,))
#     students = cursor.fetchall()

#     cursor.close()
#     conn.close()
#     return students


# ---------------- Download Students ------
@app.get("/students/download/{school_id}")
def download_students(school_id: int):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("SELECT name, email, username, password FROM students WHERE school_id=%s", (school_id,))
    students = cursor.fetchall()

    if not students:
        cursor.close()
        conn.close()
        raise HTTPException(status_code=404, detail="No students found")

    df = pd.DataFrame(students)
    file_path = f"students_school_{school_id}.csv"
    df.to_csv(file_path, index=False)

    cursor.close()
    conn.close()
    return FileResponse(file_path, media_type="text/csv", filename=file_path)

@app.post("/upload-students")
async def upload_students(file: UploadFile = File(...)):
    # Read uploaded CSV/Excel
    if file.filename.endswith(".csv"):
        df = pd.read_csv(file.file)
    elif file.filename.endswith(".xlsx"):
        df = pd.read_excel(file.file)
    else:
        return {"error": "Only CSV or Excel files are supported"}

    # Generate username & password
    for i, row in df.iterrows():
        df.loc[i, "username"] = generate_username(row["name"], i+1)
        df.loc[i, "password"] = generate_password()
        # Here you can also insert into MySQL students table

    # Save new file
    output_file = "students_with_credentials.csv"
    df.to_csv(output_file, index=False)

    return FileResponse(output_file, filename=output_file, media_type="text/csv")


from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# ---------------- JWT Decode Helper ----------------
def decode_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

# ---------------- School Dashboard -----------------
# @app.post("/schools/login", response_model=Token)
# def login_school(login: SchoolLogin):
#     conn = get_db_connection()
#     cursor = conn.cursor(dictionary=True)

#     cursor.execute(
#         "SELECT * FROM schools WHERE admin_email=%s OR admin_name=%s",
#         (login.email_or_username, login.email_or_username)
#     )
#     school = cursor.fetchone()
#     cursor.close()
#     conn.close()

#     if not school or not bcrypt.verify(login.password, school["password"]):
#         raise HTTPException(status_code=401, detail="Invalid credentials")

#     token_data = {
#         "sub": str(school["id"]),   # school_id in token
#         "role": "school",
#         "school_name": school["school_name"],
#         "admin_email": school["admin_email"]
#     }
#     access_token = create_access_token(token_data)

#     return {
#         "access_token": access_token,
#         "token_type": "bearer",
#         "school_id": school["id"]
#     }
@app.get("/schools/dashboard/{school_id}")
def school_dashboard(school_id: int, token: str = Depends(oauth2_scheme)):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("SELECT id, school_name, school_type FROM schools WHERE id=%s", (school_id,))
    school = cursor.fetchone()
    if not school:
        cursor.close()
        conn.close()
        raise HTTPException(status_code=404, detail="School not found")

    cursor.execute("SELECT id, name, email, username FROM students WHERE school_id=%s", (school_id,))
    students = cursor.fetchall()

    cursor.execute("SELECT COUNT(*) as total_staff FROM staff WHERE school_id=%s", (school_id,))
    total_staff = cursor.fetchone()["total_staff"]

    cursor.execute("SELECT COUNT(*) as total_students FROM students WHERE school_id=%s", (school_id,))
    total_students = cursor.fetchone()["total_students"]

    cursor.close()
    conn.close()

    return {
        "school": school,
        "students": students,
        "stats": {
            "total_staff": total_staff,
            "total_students": total_students,
            "region_state": "Karnataka"
        }
    }

from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi import Security
bearer_scheme = HTTPBearer()

import jwt
from datetime import datetime, timedelta

SECRET_KEY = "your-secret-key"
ALGORITHM = "HS256"

def create_token(data: dict, expires_delta: timedelta = timedelta(hours=1)):
    to_encode = data.copy()
    expire = datetime.utcnow() + expires_delta
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def decode_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

# ---------------- Student Dashboard ----------------
@app.get("/students/dashboard/{student_id}")
def student_dashboard(
    student_id: int,
    credentials: HTTPAuthorizationCredentials = Security(bearer_scheme)
):
    token = credentials.credentials
    payload = decode_token(token)
    token_student_id = payload.get("sub")

    # Prevent students from accessing another student's dashboard
    if int(token_student_id) != student_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    # Fetch student details
    cursor.execute("SELECT * FROM students WHERE id=%s", (student_id,))
    student = cursor.fetchone()
    if not student:
        cursor.close()
        conn.close()
        raise HTTPException(status_code=404, detail="Student not found")

    # Fetch the school
    cursor.execute("SELECT * FROM schools WHERE id=%s", (student["school_id"],))
    school = cursor.fetchone()

    cursor.close()
    conn.close()

    return {
        "student": student,
        "school": school,
        "stats": {
            "region_state": school.get("region_state") if school else None,
            "total_staff": school.get("num_staff") if school else 0,
        }
    }


@app.get("/students/dashboard")
def student_dashboard(credentials: HTTPAuthorizationCredentials = Security(bearer_scheme)):
    token = credentials.credentials
    payload = decode_token(token)

    # Ensure token belongs to a student
    if payload.get("role") != "student":
        raise HTTPException(status_code=403, detail="Not authorized")

    student_id = payload.get("student_id")
    if not student_id:
        raise HTTPException(status_code=401, detail="Invalid token")

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    # Fetch student details
    cursor.execute("SELECT id, name, email, username, school_id FROM students WHERE id=%s", (student_id,))
    student = cursor.fetchone()
    if not student:
        cursor.close()
        conn.close()
        raise HTTPException(status_code=404, detail="Student not found")

    # Fetch school info
    cursor.execute("SELECT id, school_name, region_state FROM schools WHERE id=%s", (student["school_id"],))
    school = cursor.fetchone()

    # Fetch student progress summary (optional)
    cursor.execute("SELECT * FROM user_progress WHERE student_id=%s", (student_id,))
    progress = cursor.fetchall()

    cursor.close()
    conn.close()

    return {
        "student": student,
        "school": school,
        "progress": progress,
        "stats": {
            "enrolled_school": school["school_name"] if school else None,
            "region_state": school["region_state"] if school else None,
        }
    }


# ---------------- Admin Dashboard ----------------
@app.get("/admin/dashboard")
def admin_dashboard(credentials: HTTPAuthorizationCredentials = Security(bearer_scheme)):
    token = credentials.credentials
    payload = decode_token(token)

    # Ensure token belongs to admin
    if not payload.get("sub"):
        raise HTTPException(status_code=401, detail="Invalid token")

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    # Fetch all schools
    cursor.execute("SELECT id, name, num_staff, region_state FROM schools")
    schools = cursor.fetchall()

    # Fetch all students
    cursor.execute("SELECT id, name, email, username, school_id FROM students")
    students = cursor.fetchall()

    cursor.close()
    conn.close()

    return {
        "admin_id": payload.get("sub"),
        "total_schools": len(schools),
        "total_students": len(students),
        "schools": schools,
        "students": students
    }


# ---------------- Course APIs ----------------
@app.post("/courses")
def create_course(course: CourseCreate):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("INSERT INTO courses (title, description) VALUES (%s, %s)", 
                   (course.title, course.description))
    conn.commit()
    course_id = cursor.lastrowid
    cursor.close()
    conn.close()
    return {"message": "Course created", "course_id": course_id}


# ---------------- Module APIs ----------------
@app.post("/modules")
def create_module(module: ModuleCreate):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""INSERT INTO modules (course_id, title, content, video_url, module_order)
                      VALUES (%s, %s, %s, %s, %s)""",
                   (module.course_id, module.title, module.content, module.video_url, module.module_order))
    conn.commit()
    module_id = cursor.lastrowid
    cursor.close()
    conn.close()
    return {"message": "Module created", "module_id": module_id}


# ---------------- Quiz APIs ----------------
@app.post("/quizzes")
def create_quiz(quiz: QuizCreate):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""INSERT INTO quizzes 
                      (module_id, question, option_a, option_b, option_c, option_d, correct_option)
                      VALUES (%s, %s, %s, %s, %s, %s, %s)""",
                   (quiz.module_id, quiz.question, quiz.option_a, quiz.option_b,
                    quiz.option_c, quiz.option_d, quiz.correct_option))
    conn.commit()
    quiz_id = cursor.lastrowid
    cursor.close()
    conn.close()
    return {"message": "Quiz created", "quiz_id": quiz_id}


# ---------------- Exam APIs ----------------
@app.post("/exams")
def create_exam(exam: ExamCreate):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""INSERT INTO exams (course_id, module_id, title) VALUES (%s, %s, %s)""",
                   (exam.course_id, exam.module_id, exam.title))
    conn.commit()
    exam_id = cursor.lastrowid
    cursor.close()
    conn.close()
    return {"message": "Exam created", "exam_id": exam_id}


# ---------------- Exam Question APIs ----------------
@app.post("/exam-questions")
def create_exam_question(eq: ExamQuestionCreate):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""INSERT INTO exam_questions 
                      (exam_id, question, option_a, option_b, option_c, option_d, correct_option)
                      VALUES (%s, %s, %s, %s, %s, %s, %s)""",
                   (eq.exam_id, eq.question, eq.option_a, eq.option_b, eq.option_c, eq.option_d, eq.correct_option))
    conn.commit()
    eq_id = cursor.lastrowid
    cursor.close()
    conn.close()
    return {"message": "Exam question created", "exam_question_id": eq_id}


# Fetch all courses
@app.get("/courses")
def get_courses():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM courses")
    courses = cursor.fetchall()
    cursor.close()
    conn.close()
    return courses


# # Fetch modules of a course
# @app.get("/courses/{course_id}/modules")
# def get_modules(course_id: int):
#     conn = get_db_connection()
#     cursor = conn.cursor(dictionary=True)
#     cursor.execute("SELECT * FROM modules WHERE course_id=%s ORDER BY module_order", (course_id,))
#     modules = cursor.fetchall()
#     cursor.close()
#     conn.close()
#     return modules
# --------------------------------------------------------------------------
# Replace your old /courses/{course_id}/modules endpoint with this new one
# --------------------------------------------------------------------------
@app.get("/courses/{course_id}/modules")
def get_modules_with_learning_items(course_id: int):
    """
    Fetches all modules for a course and constructs the nested "learning_items"
    array (content, video, quizzes, exams) expected by the frontend CoursePlayer.
    """
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    # 1. Fetch the base modules for the course
    cursor.execute("SELECT * FROM modules WHERE course_id=%s ORDER BY module_order", (course_id,))
    modules = cursor.fetchall()

    # 2. For each module, fetch its related items and build the nested structure
    for module in modules:
        module_id = module["id"]
        learning_items = []

        # --- Item Type: Content ---
        # A module's primary content is treated as the first learning item.
        if module.get("content"):
            learning_items.append({
                "id": f"module-content-{module_id}",
                "title": "Learning Material", # Generic title for the main content
                "item_type": "content",
                "text_content": module["content"],
                "status": "not-started" # You can enhance this with user progress later
            })

        # --- Item Type: Video ---
        # The module's video is a separate learning item.
        if module.get("video_url"):
            learning_items.append({
                "id": f"module-video-{module_id}",
                "title": "Instructional Video",
                "item_type": "video",
                "video_url": module["video_url"],
                "status": "not-started"
            })
            
        # --- Item Type: Quizzes (as 'exam') ---
        # Fetch any quizzes associated with this module.
        cursor.execute("SELECT * FROM quizzes WHERE module_id=%s", (module_id,))
        quizzes = cursor.fetchall()
        for quiz in quizzes:
            learning_items.append({
                "id": f"quiz-{quiz['id']}",
                "title": f"Quick Quiz: {module['title']}",
                "item_type": "exam", # Use 'exam' type for the ActivityRenderer
                "data": { "questions": [quiz] }, # The ExamPlayer expects a 'questions' array
                "status": "not-started"
            })

        # --- Item Type: Exams ---
        # Fetch any stand-alone exams for this module.
        cursor.execute("SELECT * FROM exams WHERE module_id=%s", (module_id,))
        exams = cursor.fetchall()
        for exam in exams:
            exam_id = exam['id']
            # Fetch the questions for this specific exam
            cursor.execute("SELECT * FROM exam_questions WHERE exam_id=%s", (exam_id,))
            exam_questions = cursor.fetchall()
            
            learning_items.append({
                "id": f"exam-{exam_id}",
                "title": exam['title'],
                "item_type": "exam",
                "data": { "id": exam_id, "questions": exam_questions },
                "status": "not-started"
            })
            
        # Add the complete list of items to the module object
        module["learning_items"] = learning_items
        
        # Add a placeholder for progress (can be calculated later)
        module["progress"] = 0 

    cursor.close()
    conn.close()
    return modules



# Fetch quizzes of a module
@app.get("/modules/{module_id}/quizzes")
def get_quizzes(module_id: int):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM quizzes WHERE module_id=%s", (module_id,))
    quizzes = cursor.fetchall()
    cursor.close()
    conn.close()
    return quizzes


# Fetch exams of a course
@app.get("/courses/{course_id}/exams")
def get_exams(course_id: int):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM exams WHERE course_id=%s", (course_id,))
    exams = cursor.fetchall()
    cursor.close()
    conn.close()
    return exams


# Fetch exam questions
@app.get("/exams/{exam_id}/questions")
def get_exam_questions(exam_id: int):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM exam_questions WHERE exam_id=%s", (exam_id,))
    questions = cursor.fetchall()
    cursor.close()
    conn.close()
    return questions


UPLOAD_DIR = "uploads/quiz_pdfs"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# ========= Upload Quiz PDF =========
@app.post("/modules/{module_id}/quiz-pdf")
async def upload_quiz_pdf(module_id: int, file: UploadFile = File(...)):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files allowed")

    file_path = os.path.join(UPLOAD_DIR, f"{module_id}_{datetime.now().timestamp()}.pdf")

    with open(file_path, "wb") as buffer:
        buffer.write(await file.read())

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO quiz_files (module_id, file_url) VALUES (%s, %s)",
        (module_id, file_path)
    )
    conn.commit()
    cursor.close()
    conn.close()

    return {"message": "Quiz PDF uploaded successfully", "file_path": file_path}


# ========= Fetch Quiz PDF =========
@app.get("/modules/{module_id}/quiz-pdf")
def get_quiz_pdf(module_id: int):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("SELECT file_url FROM quiz_files WHERE module_id = %s ORDER BY uploaded_at DESC LIMIT 1", (module_id,))
    result = cursor.fetchone()

    cursor.close()
    conn.close()

    if not result:
        raise HTTPException(status_code=404, detail="No quiz PDF found for this module")

    return FileResponse(result["file_url"], media_type="application/pdf", filename=os.path.basename(result["file_url"]))

# ---------------- Helper: recalc and update progress ----------------
def recalc_and_update_progress(student_id: int, course_id: int) -> Dict[str, Any]:
    """
    Recalculate completed modules, percentage, current_module and status for the student-course.
    Awards badge if final exam passed.
    Returns new progress summary dict.
    """
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        # total modules in course
        cursor.execute("SELECT id, module_order FROM modules WHERE course_id=%s ORDER BY module_order", (course_id,))
        modules = cursor.fetchall()
        total_modules = len(modules)

        if total_modules == 0:
            # ensure no progress row exists or create with 0
            cursor.execute("SELECT id FROM user_progress WHERE student_id=%s AND course_id=%s", (student_id, course_id))
            up = cursor.fetchone()
            if up is None:
                cursor.execute("INSERT INTO user_progress (student_id, course_id, current_module, percentage_completed, status) VALUES (%s,%s,%s,%s,%s)",
                               (student_id, course_id, 0, 0.0, 'Not Started'))
                conn.commit()
            return {"current_module": 0, "percentage": 0.0, "status": "Not Started"}

        # Determine completed modules
        completed_orders = set()
        for m in modules:
            module_id = m["id"]
            module_order = m["module_order"]

            # is there a module-specific exam?
            cursor.execute("SELECT id FROM exams WHERE course_id=%s AND module_id=%s", (course_id, module_id))
            mod_exam = cursor.fetchone()
            if mod_exam:
                exam_id = mod_exam["id"]
                # check latest exam result for this student & exam
                cursor.execute("SELECT passed FROM user_exam_results WHERE student_id=%s AND exam_id=%s ORDER BY attempted_at DESC LIMIT 1",
                               (student_id, exam_id))
                er = cursor.fetchone()
                if er and er.get("passed"):
                    completed_orders.add(module_order)
            else:
                # no module exam -> consider completed if student attempted module quiz(s)
                cursor.execute("""
                    SELECT 1 FROM user_quiz_results uqr
                    JOIN quizzes q ON q.id = uqr.quiz_id
                    WHERE uqr.student_id=%s AND q.module_id=%s LIMIT 1
                """, (student_id, module_id))
                qres = cursor.fetchone()
                if qres:
                    completed_orders.add(module_order)

        completed_count = len(completed_orders)
        percentage = round((completed_count / total_modules) * 100.0, 2)

        # determine next module (current_module should be the first not-completed module order)
        next_module_order = None
        for idx in range(1, total_modules + 1):
            if idx not in completed_orders:
                next_module_order = idx
                break
        if next_module_order is None:
            # all modules completed
            current_module_order = total_modules
            status = "Completed"
        else:
            current_module_order = next_module_order
            status = "In Progress" if completed_count > 0 else "Not Started"

        # Check final exam pass and award badge if passed
        cursor.execute("SELECT id FROM exams WHERE course_id=%s AND module_id IS NULL", (course_id,))
        final_exam = cursor.fetchone()
        final_passed = False
        if final_exam:
            final_exam_id = final_exam["id"]
            cursor.execute("SELECT passed FROM user_exam_results WHERE student_id=%s AND exam_id=%s ORDER BY attempted_at DESC LIMIT 1",
                           (student_id, final_exam_id))
            fres = cursor.fetchone()
            if fres and fres.get("passed"):
                final_passed = True
                # award badge if not already exists
                cursor.execute("SELECT id FROM badges WHERE student_id=%s AND course_id=%s", (student_id, course_id))
                if cursor.fetchone() is None:
                    cursor.execute("INSERT INTO badges (student_id, course_id) VALUES (%s, %s)", (student_id, course_id))

        # upsert user_progress
        cursor.execute("SELECT id FROM user_progress WHERE student_id=%s AND course_id=%s", (student_id, course_id))
        up = cursor.fetchone()
        if up:
            cursor.execute("""
                UPDATE user_progress
                SET current_module=%s, percentage_completed=%s, status=%s, updated_at=NOW()
                WHERE id=%s
            """, (current_module_order, percentage, status, up["id"]))
        else:
            cursor.execute("""
                INSERT INTO user_progress (student_id, course_id, current_module, percentage_completed, status)
                VALUES (%s, %s, %s, %s, %s)
            """, (student_id, course_id, current_module_order, percentage, status))
        conn.commit()

        return {
            "current_module": current_module_order,
            "percentage": percentage,
            "status": status,
            "final_passed": final_passed,
            "total_modules": total_modules,
            "completed_modules": completed_count
        }
    finally:
        cursor.close()
        conn.close()


# ---------------- Enroll in course (initialize progress) ----------------
@app.post("/courses/{course_id}/enroll")
def enroll_course(course_id: int, credentials: HTTPAuthorizationCredentials = Security(bearer_scheme)):
    token = credentials.credentials
    payload = decode_token(token)
    if payload.get("role") != "student":
        raise HTTPException(status_code=403, detail="Only students can enroll")

    student_id = payload.get("student_id")
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        # ensure course exists
        cursor.execute("SELECT id FROM courses WHERE id=%s", (course_id,))
        if cursor.fetchone() is None:
            raise HTTPException(status_code=404, detail="Course not found")

        # create progress row if not exists
        cursor.execute("SELECT id FROM user_progress WHERE student_id=%s AND course_id=%s", (student_id, course_id))
        if cursor.fetchone() is None:
            cursor.execute("INSERT INTO user_progress (student_id, course_id, current_module, percentage_completed, status) VALUES (%s,%s,%s,%s,%s)",
                           (student_id, course_id, 1, 0.0, 'In Progress'))
            conn.commit()

        # recalc (in case there are pre-existing results)
        summary = recalc_and_update_progress(student_id, course_id)
        return {"message": "Enrolled successfully", "progress": summary}
    finally:
        cursor.close()
        conn.close()


# ---------------- Get progress (detailed) ----------------
@app.get("/courses/{course_id}/progress")
def get_course_progress(course_id: int, credentials: HTTPAuthorizationCredentials = Security(bearer_scheme)):
    token = credentials.credentials
    payload = decode_token(token)
    if payload.get("role") != "student":
        raise HTTPException(status_code=403, detail="Only students can view progress")

    student_id = payload.get("student_id")

    # Recompute & update progress before returning
    summary = recalc_and_update_progress(student_id, course_id)

    # Build per-module status list
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT id, title, module_order FROM modules WHERE course_id=%s ORDER BY module_order", (course_id,))
        modules = cursor.fetchall()

        # get current_module value from user_progress
        cursor.execute("SELECT current_module, percentage_completed, status FROM user_progress WHERE student_id=%s AND course_id=%s",
                       (student_id, course_id))
        up = cursor.fetchone()

        module_statuses = []
        for m in modules:
            module_id = m["id"]
            module_order = m["module_order"]

            # check module exam
            cursor.execute("SELECT id FROM exams WHERE course_id=%s AND module_id=%s", (course_id, module_id))
            mod_exam = cursor.fetchone()
            completed = False
            passed_exam_id = None
            if mod_exam:
                exam_id = mod_exam["id"]
                cursor.execute("SELECT passed FROM user_exam_results WHERE student_id=%s AND exam_id=%s ORDER BY attempted_at DESC LIMIT 1",
                               (student_id, exam_id))
                res = cursor.fetchone()
                if res and res.get("passed"):
                    completed = True
                    passed_exam_id = exam_id
            else:
                # if no module exam, check if student attempted module quiz(s)
                cursor.execute("""
                    SELECT uqr.id FROM user_quiz_results uqr
                    JOIN quizzes q ON q.id = uqr.quiz_id
                    WHERE uqr.student_id=%s AND q.module_id=%s LIMIT 1
                """, (student_id, module_id))
                qres = cursor.fetchone()
                if qres:
                    completed = True

            unlocked = False
            if up:
                unlocked = (module_order <= up["current_module"])

            module_statuses.append({
                "module_id": module_id,
                "title": m["title"],
                "module_order": module_order,
                "unlocked": unlocked,
                "completed": completed,
                "passed_exam_id": passed_exam_id
            })

        return {
            "summary": summary,
            "progress_row": up,
            "modules": module_statuses
        }
    finally:
        cursor.close()
        conn.close()

# ------------------- Email Config -------------------
SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587
sender_email = "aakshayguptha@gmail.com"
sender_password = "wcbayrcarswqkkzy"

class EmailRequest(BaseModel):
    recipient: str
    subject: str
    message: str

from email.mime.text import MIMEText
import smtplib
from typing import Optional
from fastapi.middleware.cors import CORSMiddleware

def send_email(request: EmailRequest):
    try:
        msg = MIMEText(request.message)
        msg["Subject"] = request.subject
        msg["From"] = sender_email
        msg["To"] = request.recipient

        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(sender_email, sender_password)
            server.sendmail(sender_email, [request.recipient], msg.as_string())

        print(f"✅ Email sent to {request.recipient}")
        return {"message": "Email sent successfully"}

    except Exception as e:
        print(f"❌ Email sending failed: {e}")
        raise HTTPException(status_code=500, detail=f"Email sending failed: {e}")

@app.post("/send-email/")
def send_email_api(request: EmailRequest):
    return send_email(request)

# ------------------- Donations -------------------
class Donation(BaseModel):
    item_name: str
    category: str
    quantity: int
    location: str
    lat: float
    lng: float

@app.get("/donations")
def get_donations():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM donations ORDER BY id DESC")
    donations = cursor.fetchall()
    cursor.close()
    conn.close()
    return donations

@app.post("/donations")
def add_donation(donation: Donation):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO donations (item_name, category, quantity, location, lat, lng) VALUES (%s, %s, %s, %s, %s, %s)",
        (donation.item_name, donation.category, donation.quantity, donation.location, donation.lat, donation.lng)
    )
    conn.commit()
    cursor.close()
    conn.close()
    return {"message": "Donation added successfully"}

@app.get("/donations/stats")
def donation_stats():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT category, SUM(quantity) as total FROM donations GROUP BY category")
    stats = cursor.fetchall()
    cursor.close()
    conn.close()
    return stats

# ------------------- Requests -------------------
class RequestItem(BaseModel):
    location: str
    item_needed: str
    email: str

class RequestUpdate(BaseModel):
    status: str

@app.get("/requests")
def get_requests():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM requests ORDER BY id DESC")
    requests = cursor.fetchall()
    cursor.close()
    conn.close()
    return requests

@app.post("/requests")
def add_request(request: RequestItem):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO requests (location, item_needed, email, status) VALUES (%s, %s, %s, 'pending')",
        (request.location, request.item_needed, request.email)
    )
    conn.commit()
    cursor.close()
    conn.close()
    return {"message": "Request submitted successfully"}

@app.put("/requests/{id}")
def update_request_status(id: int, update: RequestUpdate):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("SELECT * FROM requests WHERE id = %s", (id,))
    request = cursor.fetchone()

    if not request:
        cursor.close()
        conn.close()
        raise HTTPException(status_code=404, detail="Request not found")

    cursor.execute("UPDATE requests SET status = %s WHERE id = %s", (update.status, id))
    conn.commit()
    cursor.close()
    conn.close()

    # ✅ Email requester
    if update.status in ['approved', 'rejected']:
        subject = f"Your Request Has Been {update.status.capitalize()}"
        message = f"Your request for {request['item_needed']} at {request['location']} has been {update.status}."
        email_request = EmailRequest(
            recipient=request['email'],
            subject=subject,
            message=message
        )
        try:
            send_email(email_request)
        except Exception as e:
            print(f"Failed to send email: {e}")

    return {"message": f"Request {update.status} successfully"}

# ------------------- Persons -------------------
class Person(BaseModel):
    name: str
    role: str
    email: Optional[str] = None

@app.get("/persons")
def get_persons():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM persons ORDER BY id DESC")
    persons = cursor.fetchall()
    cursor.close()
    conn.close()
    return persons

@app.post("/persons")
def add_person(person: Person):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO persons (name, role, allocated, email) VALUES (%s, %s, FALSE, %s)",
        (person.name, person.role, person.email)
    )
    conn.commit()
    cursor.close()
    conn.close()
    return {"message": "Person added successfully"}

@app.put("/allocate-person/{id}")
def allocate_person(id: int):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM persons WHERE id = %s", (id,))
    person = cursor.fetchone()

    if not person:
        cursor.close()
        conn.close()
        raise HTTPException(status_code=404, detail="Person not found")

    cursor.execute("UPDATE persons SET allocated = TRUE WHERE id = %s", (id,))
    conn.commit()
    cursor.close()
    conn.close()

    # ✅ Email person if they have email
    if person.get("email"):
        subject = "You Have Been Allocated"
        message = f"Hello {person['name']}, you have been allocated as {person['role']}."
        email_request = EmailRequest(
            recipient=person["email"],
            subject=subject,
            message=message
        )
        try:
            send_email(email_request)
        except Exception as e:
            print(f"Failed to send email: {e}")

    return {"message": "Person allocated successfully"}

# ------------------- Users -------------------
@app.get("/users")
def get_users():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT id, email FROM users")
    users = cursor.fetchall()
    cursor.close()
    conn.close()
    return users

# Pydantic model for input validation
class FeynmanActivity(BaseModel):
    module_id: int
    concept_to_explain: str
    simple_explanation: str

# --------------------------
# POST /feynman-activities
# --------------------------
@app.post("/feynman-activities")
def create_feynman_activity(activity: FeynmanActivity):
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute(
            """
            INSERT INTO feynman_activities (module_id, concept_to_explain, simple_explanation)
            VALUES (%s, %s, %s)
            """,
            (activity.module_id, activity.concept_to_explain, activity.simple_explanation)
        )
        conn.commit()
        return {"message": "Feynman activity created successfully!"}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        cursor.close()
        conn.close()

# ------------------- Main -------------------
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
