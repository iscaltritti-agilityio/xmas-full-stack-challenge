import express from 'express';
import { sqlDb } from '../database/init';
import { VALID_STATUSES } from '../constants';

export const apiRoutes = express.Router();

interface ElfProfileRow {
  id: number;
  name: string;
  specialty: string;
  service_start_date: string;
  profile_image: string | null;
  created_at: string;
}

interface ToyCountRow {
  count: number;
}

const getLocalDateString = (date: Date = new Date()): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getElfProfileWithToyCount = (name: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    sqlDb.get('SELECT * FROM elf_profiles WHERE name = ?', [name], (err, row: ElfProfileRow | undefined) => {
      if (err) {
        return reject({ status: 500, error: err.message });
      }
      if (!row) {
        return reject({ status: 404, error: 'Elf not found' });
      }
      
      sqlDb.get(
        'SELECT COUNT(*) as count FROM toy_orders WHERE assigned_elf = ? AND status = ?',
        [name, VALID_STATUSES[3]],
        (countErr, countRow: ToyCountRow | undefined) => {
          if (countErr) {
            return reject({ status: 500, error: countErr.message });
          }
          
          resolve({ ...row, toys_completed: countRow?.count || 0 });
        }
      );
    });
  });
};

apiRoutes.get('/elves', (req, res) => {
  sqlDb.all('SELECT name, profile_image FROM elf_profiles ORDER BY name', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

apiRoutes.get('/elf/:name', async (req, res) => {
  const { name } = req.params;
  
  try {
    const profile = await getElfProfileWithToyCount(name);
    res.json(profile);
  } catch (err: any) {
    res.status(err.status || 500).json({ error: err.error || 'Internal server error' });
  }
});

apiRoutes.post('/elf', async (req, res) => {
  const { name, specialty, service_start_date } = req.body;
  
  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }

  const startDate = service_start_date || getLocalDateString();

  sqlDb.run(`
    INSERT INTO elf_profiles (name, specialty, service_start_date, profile_image) 
    VALUES (?, ?, ?, ?)
  `, [name, specialty || 'General', startDate, null], async function(err) {
    if (err) {
      if (err.message.includes('UNIQUE constraint failed')) {
        return res.status(400).json({ error: 'An elf with this name already exists' });
      }
      return res.status(500).json({ error: err.message });
    }
    
    try {
      const profile = await getElfProfileWithToyCount(name);
      res.json(profile);
    } catch (err: any) {
      res.status(err.status || 500).json({ error: err.error || 'Internal server error' });
    }
  });
});

apiRoutes.put('/elf/:name', async (req, res) => {
  const { name } = req.params;
  const { specialty, service_start_date, profile_image } = req.body;

  const updates: string[] = [];
  const values: any[] = [];

  if (specialty !== undefined) {
    updates.push('specialty = ?');
    values.push(specialty);
  }

  if (service_start_date !== undefined) {
    updates.push('service_start_date = ?');
    values.push(service_start_date);
  }

  if (profile_image !== undefined) {
    updates.push('profile_image = ?');
    values.push(profile_image);
  }

  if (updates.length === 0) {
    return res.status(400).json({ error: 'No fields to update' });
  }

  values.push(name);

  sqlDb.run(`
    UPDATE elf_profiles 
    SET ${updates.join(', ')}
    WHERE name = ?
  `, values, async function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Elf not found' });
    }
    
    try {
      const profile = await getElfProfileWithToyCount(name);
      res.json(profile);
    } catch (err: any) {
      res.status(err.status || 500).json({ error: err.error || 'Internal server error' });
    }
  });
});

