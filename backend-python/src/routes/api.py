from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from datetime import datetime
import sqlite3
from typing import Optional
from ..database.init import get_sql_db
from ..constants import VALID_STATUSES

api_router = APIRouter()

class ElfProfileUpdate(BaseModel):
    specialty: Optional[str] = None
    service_start_date: Optional[str] = None
    profile_image: Optional[str] = None

class ElfProfileCreate(BaseModel):
    name: str
    specialty: Optional[str] = None
    service_start_date: Optional[str] = None

def _dict_factory(cursor, row):
    return {col[0]: row[idx] for idx, col in enumerate(cursor.description)}

def _get_elf_profile_with_toy_count(name: str) -> dict:
    sql_db = get_sql_db()
    sql_db.row_factory = _dict_factory
    cursor = sql_db.cursor()
    
    cursor.execute('SELECT * FROM elf_profiles WHERE name = ?', [name])
    row = cursor.fetchone()
    
    if not row:
        raise HTTPException(status_code=404, detail='Elf not found')
    
    cursor.execute(
        "SELECT COUNT(*) as count FROM toy_orders WHERE assigned_elf = ? AND status = ?",
        [name, VALID_STATUSES[3]]
    )
    count_row = cursor.fetchone()
    
    return {**row, 'toys_completed': count_row['count'] if count_row else 0}

@api_router.get('/elves')
async def get_elves():
    sql_db = get_sql_db()
    sql_db.row_factory = _dict_factory
    cursor = sql_db.cursor()
    
    try:
        cursor.execute('SELECT name, profile_image FROM elf_profiles ORDER BY name')
        rows = cursor.fetchall()
        return rows
    except sqlite3.Error as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get('/elf/{name}')
async def get_elf_profile(name: str):
    try:
        profile = _get_elf_profile_with_toy_count(name)
        return profile
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail='Internal server error')

@api_router.post('/elf')
async def create_elf(elf_data: ElfProfileCreate):
    if not elf_data.name:
        raise HTTPException(status_code=400, detail='Name is required')
    
    start_date = elf_data.service_start_date or datetime.now().strftime('%Y-%m-%d')
    
    sql_db = get_sql_db()
    cursor = sql_db.cursor()
    
    try:
        cursor.execute('''
            INSERT INTO elf_profiles (name, specialty, service_start_date, profile_image) 
            VALUES (?, ?, ?, ?)
        ''', [elf_data.name, elf_data.specialty or 'General', start_date, None])
        
        sql_db.commit()
        
        profile = _get_elf_profile_with_toy_count(elf_data.name)
        return profile
    except sqlite3.IntegrityError as e:
        if 'UNIQUE constraint failed' in str(e):
            raise HTTPException(status_code=400, detail='An elf with this name already exists')
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.put('/elf/{name}')
async def update_elf(name: str, elf_data: ElfProfileUpdate):
    sql_db = get_sql_db()
    cursor = sql_db.cursor()
    
    updates = []
    values = []
    
    if elf_data.specialty is not None:
        updates.append('specialty = ?')
        values.append(elf_data.specialty)
    
    if elf_data.service_start_date is not None:
        updates.append('service_start_date = ?')
        values.append(elf_data.service_start_date)
    
    if elf_data.profile_image is not None:
        updates.append('profile_image = ?')
        values.append(elf_data.profile_image)
    
    if not updates:
        raise HTTPException(status_code=400, detail='No fields to update')
    
    values.append(name)
    
    try:
        cursor.execute(f'''
            UPDATE elf_profiles 
            SET {', '.join(updates)}
            WHERE name = ?
        ''', values)
        
        sql_db.commit()
        
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail='Elf not found')
        
        profile = _get_elf_profile_with_toy_count(name)
        return profile
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

