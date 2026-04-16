const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

const objectivesData = {
  'Data Structures and Algorithms (DSA)': [
    'Understand fundamental concepts of data structures such as arrays, linked lists, stacks, queues, trees, and graphs.',
    'Design efficient algorithms for solving computational problems.',
    'Analyze time and space complexity of algorithms.',
    'Implement searching and sorting algorithms.',
    'Understand recursion and its applications.',
    'Apply divide and conquer techniques.',
    'Explore greedy and dynamic programming approaches.',
    'Solve real-world problems using appropriate data structures.',
    'Optimize algorithms for performance improvement.',
    'Develop logical thinking and coding efficiency.'
  ],
  'Mathematics': [
    'Understand concepts of Discrete Mathematics.',
    'Apply logic and reasoning in problem-solving.',
    'Understand sets, relations, and functions.',
    'Use combinatorics in counting problems.',
    'Apply probability theory in computing.',
    'Understand graph theory concepts.',
    'Perform matrix and algebraic operations.',
    'Apply mathematical models in computing systems.',
    'Enhance analytical and critical thinking skills.',
    'Solve complex problems using mathematical techniques.'
  ],
  'Operating Systems (OS)': [
    'Understand the fundamentals of operating systems.',
    'Study process management and scheduling algorithms.',
    'Understand memory management techniques.',
    'Analyze virtual memory concepts.',
    'Implement synchronization mechanisms.',
    'Understand deadlock prevention and avoidance.',
    'Explore file system structures.',
    'Manage system resources efficiently.',
    'Understand I/O systems and device management.',
    'Analyze system performance and optimization.'
  ],
  'Computer Networks': [
    'Understand fundamentals of computer networks.',
    'Study OSI and TCP/IP models.',
    'Understand data transmission methods.',
    'Analyze network protocols.',
    'Understand routing and switching techniques.',
    'Explore network topologies.',
    'Study error detection and correction methods.',
    'Understand network security principles.',
    'Analyze wireless and mobile networks.',
    'Evaluate network performance and reliability.'
  ],
  'Database Management Systems (DBMS)': [
    'Understand concepts of database management systems.',
    'Design database schemas using ER models.',
    'Learn SQL for querying and data manipulation.',
    'Apply normalization techniques.',
    'Ensure data integrity and consistency.',
    'Understand transaction management.',
    'Study concurrency control mechanisms.',
    'Implement indexing and optimization techniques.',
    'Understand database security concepts.',
    'Manage large-scale data efficiently.'
  ]
};

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS objectives (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    subject TEXT NOT NULL,
    content TEXT NOT NULL
  )`);
  db.run('DELETE FROM objectives');
  
  const stmt = db.prepare('INSERT INTO objectives (subject, content) VALUES (?, ?)');
  
  for (const [subject, objectives] of Object.entries(objectivesData)) {
    // We can store it as a JSON string array to easily parse in the frontend
    stmt.run(subject, JSON.stringify(objectives));
  }
  
  stmt.finalize();
  console.log('Objectives seeded successfully.');
});

db.close();
