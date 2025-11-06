import sqlite3 from 'sqlite3';
import * as fs from 'fs';
import * as path from 'path';
import { TRAIN_COUNT, SAMPLE_FIRST_NAMES, SAMPLE_LAST_NAMES, SAMPLE_LOCATIONS, TRAIN_TYPES, LETTER_GREETINGS, LETTER_WANTS, LETTER_PROMISES, LETTER_EXTRAS, LETTER_CLOSINGS } from './sampleData';

export let sqlDb: sqlite3.Database;

export let noSqlDb: Map<string, any> = new Map();

export function initDatabase() {
  sqlDb = new sqlite3.Database(':memory:', (err) => {
    if (err) {
      console.error('Error opening SQLite database:', err);
    } else {
      console.log('📦 SQLite database connected');
      createTables();
    }
  });
}

function createTables() {
  sqlDb.serialize(() => {
    sqlDb.run(`
      CREATE TABLE elf_profiles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        service_start_date TEXT NOT NULL,
        specialty TEXT NOT NULL,
        profile_image TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) {
        console.error('Error creating elf_profiles table:', err);
      } else {
        console.log('📋 Elf profiles table created');
      }
    });

    sqlDb.run(`
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
    `, (err) => {
      if (err) {
        console.error('Error creating toy_orders table:', err);
      } else {
        console.log('🎁 Toy orders table created');
      }
    });

    insertSampleData();
  });
}

function loadImageAsBase64(imageName: string): string | null {
  try {
    const imagePath = path.join(__dirname, '..', '..', '..', 'images', imageName);
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString('base64');
    return `data:image/jpeg;base64,${base64Image}`;
  } catch (error) {
    console.error(`Failed to load image ${imageName}:`, error);
    return null;
  }
}

function insertSampleData() {
  const now = new Date();
  const elfProfiles = [
    {
      name: 'Jingleberry Sparkletoes',
      specialty: 'Wooden Trains',
      service_start_date: new Date(now.getFullYear() - 127, 11, 1).toISOString().split('T')[0],
      profile_image: loadImageAsBase64('Jingleberry.jpeg')
    },
    {
      name: 'Snowflake Tinselwhisk',
      specialty: 'Teddy Bears',
      service_start_date: new Date(now.getFullYear() - 43, 11, 15).toISOString().split('T')[0],
      profile_image: loadImageAsBase64('Snowflake.jpeg')
    },
    {
      name: 'Peppermint Candycane',
      specialty: 'Video Games',
      service_start_date: new Date(now.getFullYear() - 15, 0, 10).toISOString().split('T')[0],
      profile_image: loadImageAsBase64('Peppermint.jpeg')
    }
  ];

  elfProfiles.forEach(elf => {
    sqlDb.run(`
      INSERT INTO elf_profiles (name, specialty, service_start_date, profile_image) 
      VALUES (?, ?, ?, ?)
    `, [
      elf.name,
      elf.specialty,
      elf.service_start_date,
      elf.profile_image
    ]);
  });

  const toyOrders = [
    {
      id: '1',
      childName: 'Emily Johnson',
      age: 7,
      location: 'New York, USA',
      toy: 'Deluxe Teddy Bear',
      category: 'Teddy Bears',
      assignedElf: 'Snowflake Tinselwhisk',
      status: 'To Do',
      dueDate: '2024-12-24',
      notes: 'Deer Santa, I realy want a Delux Teddy Bear! I promis Ive been realy good this yeer. Can you make it extra soft and hugable? Love, Emily',
      niceListScore: 98
    },
    {
      id: '2',
      childName: 'Marcus Chen',
      age: 10,
      location: 'San Francisco, USA',
      toy: 'MagicBox Game Console',
      category: 'Video Games',
      assignedElf: 'Peppermint Candycane',
      status: 'In Progress',
      dueDate: '2024-12-24',
      notes: 'Hi Santa! I would love a MagicBox Game Console for Christmas! If possible, could you include extra controlers so I can play with my freinds? And maybe 3 game cartridges? Thanks! Marcus',
      niceListScore: 85
    },
    {
      id: '3',
      childName: 'Sofia Rodriguez',
      age: 5,
      location: 'Madrid, Spain',
      toy: 'Classic Wooden Train with 12 Cars',
      category: 'Wooden Trains',
      assignedElf: 'Jingleberry Sparkletoes',
      status: 'Quality Check',
      dueDate: '2024-12-24',
      notes: 'Deer Santa, I want a Clasic Wooden Trane with 12 Cars pleese! I luv tranes so much! Can you paynt it with prety culurs? Thank you Santa! Sofia',
      niceListScore: 100
    },
    {
      id: '4',
      childName: 'Oliver Smith',
      age: 8,
      location: 'London, UK',
      toy: 'Builder Blocks Mega Set',
      category: 'Puzzles',
      assignedElf: 'Jingleberry Sparkletoes',
      status: 'Ready to Deliver',
      dueDate: '2024-12-24',
      notes: 'Dear Santa, I would realy like the Builder Blocks Mega Set with 1000 peices! I want to build a huge castle. Can you include the instrution booklet so I know how to make cool things? Oliver',
      niceListScore: 92
    },
    {
      id: '5',
      childName: 'Aisha Patel',
      age: 6,
      location: 'Mumbai, India',
      toy: 'Enchanted Dollhouse',
      category: 'Dolls',
      assignedElf: 'Snowflake Tinselwhisk',
      status: 'To Do',
      dueDate: '2024-12-24',
      notes: 'Deer Santa, I dreem of haveing an Enchanted Dollhowse! I want one with three flors and lites that reely work. It would be so majical! Love, Aisha',
      niceListScore: 96
    },
    {
      id: '6',
      childName: 'Lucas Dubois',
      age: 9,
      location: 'Paris, France',
      toy: 'Turbo Racer RC Car',
      category: 'Electronics',
      assignedElf: 'Peppermint Candycane',
      status: 'In Progress',
      dueDate: '2024-12-24',
      notes: 'Hello Santa! I realy want a Turbo Racer RC Car this year! It would be amazeing if it comes with a rechargable battery so I can race it all the time. Merci! Lucas',
      niceListScore: 78
    }
  ];

  toyOrders.forEach(order => {
    sqlDb.run(`
      INSERT INTO toy_orders (id, child_name, age, location, toy, category, assigned_elf, status, due_date, notes, nice_list_score) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      order.id,
      order.childName,
      order.age,
      order.location,
      order.toy,
      order.category,
      order.assignedElf,
      order.status,
      order.dueDate,
      order.notes,
      order.niceListScore
    ]);
  });

  generateJingleberryTrains();
}

function generateJingleberryTrains() {
  for (let i = 0; i < TRAIN_COUNT; i++) {
    const orderId = (7 + i).toString();
    const firstName = SAMPLE_FIRST_NAMES[i % SAMPLE_FIRST_NAMES.length];
    const lastName = SAMPLE_LAST_NAMES[Math.floor(i / SAMPLE_FIRST_NAMES.length) % SAMPLE_LAST_NAMES.length];
    const childName = `${firstName} ${lastName}`;
    const age = 4 + (i % 5);
    const location = SAMPLE_LOCATIONS[i % SAMPLE_LOCATIONS.length];
    const toy = TRAIN_TYPES[i % TRAIN_TYPES.length];
    const niceListScore = 88 + (i % 13);

    const greeting = LETTER_GREETINGS[i % LETTER_GREETINGS.length];
    const want = LETTER_WANTS[i % LETTER_WANTS.length];
    const promise = LETTER_PROMISES[i % LETTER_PROMISES.length];
    const extra = LETTER_EXTRAS[i % LETTER_EXTRAS.length];
    const closing = LETTER_CLOSINGS[i % LETTER_CLOSINGS.length];

    const notes = `${greeting}, ${want} a ${toy}! ${promise}. ${extra} ${closing}, ${firstName}`;

    sqlDb.run(`
      INSERT INTO toy_orders (id, child_name, age, location, toy, category, assigned_elf, status, due_date, notes, nice_list_score) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      orderId,
      childName,
      age,
      location,
      toy,
      'Wooden Trains',
      'Jingleberry Sparkletoes',
      'Quality Check',
      '2024-12-24',
      notes,
      niceListScore
    ]);
  }
}


