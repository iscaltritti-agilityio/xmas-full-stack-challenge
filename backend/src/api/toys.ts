import { sqlDb } from '../database/init';
import { VALID_STATUSES, DEFAULT_DUE_DATE } from '../constants';

interface ToyOrder {
  id: string;
  child_name: string;
  age: number;
  location: string;
  toy: string;
  category: string;
  assigned_elf: string;
  status: string;
  due_date: string;
  notes: string;
  nice_list_score: number;
}

interface ToyOrderFilter {
  status?: string;
  assigned_elf?: string;
}

interface ToyOrderInput {
  child_name: string;
  age: number;
  location: string;
  toy: string;
  category: string;
  assigned_elf: string;
  notes?: string;
  nice_list_score: number;
}

interface ElfProfileRow {
  name: string;
  specialty: string;
}

export const typeDefs = `
  type ToyOrder {
    id: ID!
    child_name: String!
    age: Int!
    location: String!
    toy: String!
    category: String!
    assigned_elf: String!
    status: String!
    due_date: String!
    notes: String
    nice_list_score: Int!
  }

  input ToyOrderFilter {
    status: String
    assigned_elf: String
  }

  input ToyOrderInput {
    child_name: String!
    age: Int!
    location: String!
    toy: String!
    category: String!
    assigned_elf: String!
    notes: String
    nice_list_score: Int!
  }

  type Query {
    toyOrders(filter: ToyOrderFilter): [ToyOrder!]!
    toyOrder(id: ID!): ToyOrder
  }

  type Mutation {
    addToyOrder(input: ToyOrderInput!): ToyOrder!
    updateToyOrderStatus(id: ID!, status: String!): ToyOrder!
    updateToyOrderElf(id: ID!, assigned_elf: String!): ToyOrder!
  }
`;

export const resolvers = {
  Query: {
    toyOrders: (_: unknown, { filter }: { filter?: ToyOrderFilter }): Promise<ToyOrder[]> => {
      return new Promise((resolve, reject) => {
        let query = 'SELECT * FROM toy_orders';
        const params: string[] = [];
        
        if (filter) {
          const conditions: string[] = [];
          if (filter.status) {
            conditions.push('status = ?');
            params.push(filter.status);
          }
          if (filter.assigned_elf) {
            conditions.push('assigned_elf = ?');
            params.push(filter.assigned_elf);
          }
          if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
          }
        }
        
        sqlDb.all(query, params, (err, rows: ToyOrder[]) => {
          if (err) {
            reject(err);
            return;
          }
          
          resolve(rows);
        });
      });
    },

    toyOrder: (_: unknown, { id }: { id: string }): Promise<ToyOrder | null> => {
      return new Promise((resolve, reject) => {
        sqlDb.get('SELECT * FROM toy_orders WHERE id = ?', [id], (err, row: ToyOrder | undefined) => {
          if (err) {
            reject(err);
            return;
          }
          
          if (!row) {
            resolve(null);
            return;
          }
          
          resolve(row);
        });
      });
    },
  },

  Mutation: {
    addToyOrder: async (_: unknown, { input }: { input: ToyOrderInput }): Promise<ToyOrder> => {
      let assigned_elf = input.assigned_elf;
      
      if (!assigned_elf || assigned_elf === 'auto') {
        assigned_elf = await new Promise<string>((resolve) => {
          sqlDb.all('SELECT name, specialty FROM elf_profiles', (err, rows: ElfProfileRow[] | undefined) => {
            if (err || !rows || rows.length === 0) {
              resolve(input.assigned_elf || 'Unassigned');
              return;
            }
            
            const matchingElf = rows.find(elf => elf.specialty === input.category);
            resolve(matchingElf ? matchingElf.name : (input.assigned_elf || rows[0].name));
          });
        });
      }
      
      const newOrder: ToyOrder = {
        id: Date.now().toString(),
        child_name: input.child_name,
        age: input.age,
        location: input.location,
        toy: input.toy,
        category: input.category,
        assigned_elf: assigned_elf,
        status: 'To Do',
        due_date: DEFAULT_DUE_DATE,
        notes: input.notes || '',
        nice_list_score: input.nice_list_score
      };

      return new Promise((resolve, reject) => {
        sqlDb.run(`
          INSERT INTO toy_orders (id, child_name, age, location, toy, category, assigned_elf, status, due_date, notes, nice_list_score)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          newOrder.id,
          newOrder.child_name,
          newOrder.age,
          newOrder.location,
          newOrder.toy,
          newOrder.category,
          newOrder.assigned_elf,
          newOrder.status,
          newOrder.due_date,
          newOrder.notes,
          newOrder.nice_list_score
        ], (err) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(newOrder);
        });
      });
    },

    updateToyOrderStatus: (_: unknown, { id, status }: { id: string; status: string }): Promise<ToyOrder> => {
      return new Promise((resolve, reject) => {
        if (!VALID_STATUSES.includes(status as any)) {
          reject(new Error(`Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`));
          return;
        }

        sqlDb.get('SELECT * FROM toy_orders WHERE id = ?', [id], (err, row: ToyOrder | undefined) => {
          if (err) {
            reject(err);
            return;
          }
          
          if (!row) {
            reject(new Error('Toy order not found'));
            return;
          }

          resolve(row);
        });
      });
    },

    updateToyOrderElf: (_: unknown, { id, assigned_elf }: { id: string; assigned_elf: string }): Promise<ToyOrder> => {
      return new Promise((resolve, reject) => {
        sqlDb.get(
          'UPDATE toy_orders SET assigned_elf = ? WHERE id = ? RETURNING *',
          [assigned_elf, id],
          (err, row: ToyOrder | undefined) => {
            if (err) {
              reject(err);
              return;
            }
            
            if (!row) {
              reject(new Error('Toy order not found'));
              return;
            }

            resolve(row);
          }
        );
      });
    },
  },
};

