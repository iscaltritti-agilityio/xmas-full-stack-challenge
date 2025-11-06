import strawberry
from typing import List, Optional
import time
from ..database.init import get_sql_db
from ..constants import VALID_STATUSES, DEFAULT_DUE_DATE

@strawberry.type
class ToyOrder:
    id: strawberry.ID
    child_name: str
    age: int
    location: str
    toy: str
    category: str
    assigned_elf: str
    status: str
    due_date: str
    notes: Optional[str] = None
    nice_list_score: int

@strawberry.input
class ToyOrderFilter:
    status: Optional[str] = None
    assigned_elf: Optional[str] = None

@strawberry.input
class ToyOrderInput:
    child_name: str
    age: int
    location: str
    toy: str
    category: str
    assigned_elf: str
    notes: Optional[str] = None
    nice_list_score: int

def _dict_factory(cursor, row):
    return {col[0]: row[idx] for idx, col in enumerate(cursor.description)}

def _filter_toy_order_fields(row: dict) -> dict:
    return {k: v for k, v in row.items() if k != 'created_at'}

@strawberry.type
class Query:
    @strawberry.field(name="toyOrders")
    def toy_orders(self, filter: Optional[ToyOrderFilter] = None) -> List[ToyOrder]:
        sql_db = get_sql_db()
        sql_db.row_factory = _dict_factory
        cursor = sql_db.cursor()
        
        query = 'SELECT * FROM toy_orders'
        params = []
        
        if filter:
            conditions = []
            if filter.status:
                conditions.append('status = ?')
                params.append(filter.status)
            if filter.assigned_elf:
                conditions.append('assigned_elf = ?')
                params.append(filter.assigned_elf)
            if conditions:
                query += ' WHERE ' + ' AND '.join(conditions)
        
        cursor.execute(query, params)
        rows = cursor.fetchall()
        
        return [ToyOrder(**_filter_toy_order_fields(row)) for row in rows]
    
    @strawberry.field(name="toyOrder")
    def toy_order(self, id: strawberry.ID) -> Optional[ToyOrder]:
        sql_db = get_sql_db()
        sql_db.row_factory = _dict_factory
        cursor = sql_db.cursor()
        
        cursor.execute('SELECT * FROM toy_orders WHERE id = ?', [str(id)])
        row = cursor.fetchone()
        
        if not row:
            return None
        
        return ToyOrder(**_filter_toy_order_fields(row))

@strawberry.type
class Mutation:
    @strawberry.mutation(name="addToyOrder")
    def add_toy_order(self, input: ToyOrderInput) -> ToyOrder:
        sql_db = get_sql_db()
        sql_db.row_factory = _dict_factory
        cursor = sql_db.cursor()
        
        assigned_elf = input.assigned_elf
        
        if not assigned_elf or assigned_elf == 'auto':
            cursor.execute('SELECT name, specialty FROM elf_profiles')
            rows = cursor.fetchall()
            
            if rows:
                matching_elf = None
                for row in rows:
                    if row['specialty'] == input.category:
                        matching_elf = row['name']
                        break
                
                assigned_elf = matching_elf if matching_elf else (input.assigned_elf or rows[0]['name'])
            else:
                assigned_elf = input.assigned_elf or 'Unassigned'
        
        new_order = {
            'id': str(int(time.time() * 1000)),
            'child_name': input.child_name,
            'age': input.age,
            'location': input.location,
            'toy': input.toy,
            'category': input.category,
            'assigned_elf': assigned_elf,
            'status': 'To Do',
            'due_date': DEFAULT_DUE_DATE,
            'notes': input.notes or '',
            'nice_list_score': input.nice_list_score
        }
        
        cursor.execute('''
            INSERT INTO toy_orders (id, child_name, age, location, toy, category, assigned_elf, status, due_date, notes, nice_list_score)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', [
            new_order['id'],
            new_order['child_name'],
            new_order['age'],
            new_order['location'],
            new_order['toy'],
            new_order['category'],
            new_order['assigned_elf'],
            new_order['status'],
            new_order['due_date'],
            new_order['notes'],
            new_order['nice_list_score']
        ])
        
        sql_db.commit()
        
        return ToyOrder(**new_order)
    
    @strawberry.mutation(name="updateToyOrderStatus")
    def update_toy_order_status(self, id: strawberry.ID, status: str) -> ToyOrder:
        sql_db = get_sql_db()
        sql_db.row_factory = _dict_factory
        cursor = sql_db.cursor()
        
        if status not in VALID_STATUSES:
            raise Exception(f'Invalid status. Must be one of: {", ".join(VALID_STATUSES)}')
        
        cursor.execute('SELECT * FROM toy_orders WHERE id = ?', [str(id)])
        row = cursor.fetchone()
        
        if not row:
            raise Exception('Toy order not found')
        
        return ToyOrder(**_filter_toy_order_fields(row))
    
    @strawberry.mutation(name="updateToyOrderElf")
    def update_toy_order_elf(self, id: strawberry.ID, assigned_elf: str) -> ToyOrder:
        sql_db = get_sql_db()
        sql_db.row_factory = _dict_factory
        cursor = sql_db.cursor()
        
        cursor.execute('UPDATE toy_orders SET assigned_elf = ? WHERE id = ? RETURNING *', [assigned_elf, str(id)])
        row = cursor.fetchone()
        sql_db.commit()
        
        if not row:
            raise Exception('Toy order not found')
        
        return ToyOrder(**_filter_toy_order_fields(row))

schema = strawberry.Schema(
    query=Query,
    mutation=Mutation,
    config=strawberry.schema.config.StrawberryConfig(auto_camel_case=False)
)

