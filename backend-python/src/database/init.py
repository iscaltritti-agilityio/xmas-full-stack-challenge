import sqlite3
import os
import base64
from datetime import datetime, timedelta
from typing import Dict, Any
from .sample_data import (
    TRAIN_COUNT, SAMPLE_FIRST_NAMES, SAMPLE_LAST_NAMES, SAMPLE_LOCATIONS,
    TRAIN_TYPES, LETTER_GREETINGS, LETTER_WANTS, LETTER_PROMISES,
    LETTER_EXTRAS, LETTER_CLOSINGS
)

_sql_db: sqlite3.Connection = None
_nosql_db: Dict[str, Any] = {}

def init_database():
    global _sql_db, _nosql_db
    
    _sql_db = sqlite3.connect(':memory:', check_same_thread=False)
    _sql_db.row_factory = sqlite3.Row
    
    print('SQLite database connected')
    _create_tables()

def _create_tables():
    _sql_db.execute('''
        CREATE TABLE elf_profiles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE,
            service_start_date TEXT NOT NULL,
            specialty TEXT NOT NULL,
            profile_image TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    print('Elf profiles table created')
    
    _sql_db.execute('''
        CREATE TABLE toy_orders (
            id TEXT PRIMARY KEY,
            child_name TEXT NOT NULL,
            age INTEGER NOT NULL,
            location TEXT NOT NULL,
            toy TEXT NOT NULL,
            category TEXT NOT NULL,
            assigned_elf TEXT NOT NULL,
            status TEXT NOT NULL,
            due_date TEXT NOT NULL,
            notes TEXT,
            nice_list_score INTEGER NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    print('Toy orders table created')
    
    _insert_sample_data()

def _load_image_as_base64(image_name: str) -> str:
    try:
        script_dir = os.path.dirname(os.path.abspath(__file__))
        image_path = os.path.join(script_dir, '..', '..', '..', 'images', image_name)
        
        with open(image_path, 'rb') as image_file:
            image_data = image_file.read()
            base64_image = base64.b64encode(image_data).decode('utf-8')
            return f"data:image/jpeg;base64,{base64_image}"
    except Exception as e:
        print(f"Failed to load image {image_name}: {e}")
        return None

def _insert_sample_data():
    now = datetime.now()
    
    elf_profiles = [
        {
            'name': 'Jingleberry Sparkletoes',
            'specialty': 'Wooden Trains',
            'service_start_date': datetime(now.year - 127, 12, 1).strftime('%Y-%m-%d'),
            'profile_image': _load_image_as_base64('Jingleberry.jpeg')
        },
        {
            'name': 'Snowflake Tinselwhisk',
            'specialty': 'Teddy Bears',
            'service_start_date': datetime(now.year - 43, 12, 15).strftime('%Y-%m-%d'),
            'profile_image': _load_image_as_base64('Snowflake.jpeg')
        },
        {
            'name': 'Peppermint Candycane',
            'specialty': 'Video Games',
            'service_start_date': datetime(now.year - 15, 1, 10).strftime('%Y-%m-%d'),
            'profile_image': _load_image_as_base64('Peppermint.jpeg')
        }
    ]
    
    for elf in elf_profiles:
        _sql_db.execute('''
            INSERT INTO elf_profiles (name, specialty, service_start_date, profile_image) 
            VALUES (?, ?, ?, ?)
        ''', [
            elf['name'],
            elf['specialty'],
            elf['service_start_date'],
            elf['profile_image']
        ])
    
    toy_orders = [
        {
            'id': '1',
            'childName': 'Emily Johnson',
            'age': 7,
            'location': 'New York, USA',
            'toy': 'Deluxe Teddy Bear',
            'category': 'Teddy Bears',
            'assignedElf': 'Snowflake Tinselwhisk',
            'status': 'To Do',
            'dueDate': '2024-12-24',
            'notes': 'Deer Santa, I realy want a Delux Teddy Bear! I promis Ive been realy good this yeer. Can you make it extra soft and hugable? Love, Emily',
            'niceListScore': 98
        },
        {
            'id': '2',
            'childName': 'Marcus Chen',
            'age': 10,
            'location': 'San Francisco, USA',
            'toy': 'MagicBox Game Console',
            'category': 'Video Games',
            'assignedElf': 'Peppermint Candycane',
            'status': 'In Progress',
            'dueDate': '2024-12-24',
            'notes': 'Hi Santa! I would love a MagicBox Game Console for Christmas! If possible, could you include extra controlers so I can play with my freinds? And maybe 3 game cartridges? Thanks! Marcus',
            'niceListScore': 85
        },
        {
            'id': '4',
            'childName': 'Oliver Smith',
            'age': 8,
            'location': 'London, UK',
            'toy': 'Builder Blocks Mega Set',
            'category': 'Puzzles',
            'assignedElf': 'Jingleberry Sparkletoes',
            'status': 'Ready to Deliver',
            'dueDate': '2024-12-24',
            'notes': 'Dear Santa, I would realy like the Builder Blocks Mega Set with 1000 peices! I want to build a huge castle. Can you include the instrution booklet so I know how to make cool things? Oliver',
            'niceListScore': 92
        },
        {
            'id': '5',
            'childName': 'Aisha Patel',
            'age': 6,
            'location': 'Mumbai, India',
            'toy': 'Enchanted Dollhouse',
            'category': 'Dolls',
            'assignedElf': 'Snowflake Tinselwhisk',
            'status': 'To Do',
            'dueDate': '2024-12-24',
            'notes': 'Deer Santa, I dreem of haveing an Enchanted Dollhowse! I want one with three flors and lites that reely work. It would be so majical! Love, Aisha',
            'niceListScore': 96
        },
        {
            'id': '6',
            'childName': 'Lucas Dubois',
            'age': 9,
            'location': 'Paris, France',
            'toy': 'Turbo Racer RC Car',
            'category': 'Electronics',
            'assignedElf': 'Peppermint Candycane',
            'status': 'In Progress',
            'dueDate': '2024-12-24',
            'notes': 'Hello Santa! I realy want a Turbo Racer RC Car this year! It would be amazeing if it comes with a rechargable battery so I can race it all the time. Merci! Lucas',
            'niceListScore': 78
        }
    ]
    
    for order in toy_orders:
        _sql_db.execute('''
            INSERT INTO toy_orders (id, child_name, age, location, toy, category, assigned_elf, status, due_date, notes, nice_list_score) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', [
            order['id'],
            order['childName'],
            order['age'],
            order['location'],
            order['toy'],
            order['category'],
            order['assignedElf'],
            order['status'],
            order['dueDate'],
            order['notes'],
            order['niceListScore']
        ])
    
    _generate_jingleberry_trains()

def _generate_jingleberry_trains():
    for i in range(TRAIN_COUNT):
        order_id = str(7 + i)
        first_name = SAMPLE_FIRST_NAMES[i % len(SAMPLE_FIRST_NAMES)]
        last_name = SAMPLE_LAST_NAMES[(i // len(SAMPLE_FIRST_NAMES)) % len(SAMPLE_LAST_NAMES)]
        child_name = f"{first_name} {last_name}"
        age = 4 + (i % 5)
        location = SAMPLE_LOCATIONS[i % len(SAMPLE_LOCATIONS)]
        toy = TRAIN_TYPES[i % len(TRAIN_TYPES)]
        nice_list_score = 88 + (i % 13)
        
        greeting = LETTER_GREETINGS[i % len(LETTER_GREETINGS)]
        want = LETTER_WANTS[i % len(LETTER_WANTS)]
        promise = LETTER_PROMISES[i % len(LETTER_PROMISES)]
        extra = LETTER_EXTRAS[i % len(LETTER_EXTRAS)]
        closing = LETTER_CLOSINGS[i % len(LETTER_CLOSINGS)]
        
        notes = f"{greeting}, {want} a {toy}! {promise}. {extra} {closing}, {first_name}"
        
        _sql_db.execute('''
            INSERT INTO toy_orders (id, child_name, age, location, toy, category, assigned_elf, status, due_date, notes, nice_list_score) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', [
            order_id,
            child_name,
            age,
            location,
            toy,
            'Wooden Trains',
            'Jingleberry Sparkletoes',
            'Quality Check',
            '2024-12-24',
            notes,
            nice_list_score
        ])

def get_sql_db() -> sqlite3.Connection:
    return _sql_db

def get_nosql_db() -> Dict[str, Any]:
    return _nosql_db

