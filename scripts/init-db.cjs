const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const dbPath = path.resolve(__dirname, '../sau.db');
const schemaPath = path.resolve(__dirname, '../schema.sql');
const sampleDataPath = path.resolve(__dirname, '../sample_data.sql');

console.log(`Initializing database at ${dbPath}...`);

const db = new sqlite3.Database(dbPath);

const readSqlFile = (filePath) => {
    return fs.readFileSync(filePath, 'utf8');
};

const init = async () => {
    // Read schema and sample data
    // Note: SQLite doesn't support all Postgres syntax in schema.sql directly, 
    // so we might need to adjust it or rely on the fact that simple CREATE TABLEs are mostly compatible.
    // We will read the file and split by semicolon to execute statements.

    const schemaSql = readSqlFile(schemaPath);
    const sampleDataSql = readSqlFile(sampleDataPath);

    // Helper to execute multiple statements
    const executeScript = (sqlScript) => {
        return new Promise((resolve, reject) => {
            db.exec(sqlScript, (err) => {
                if (err) {
                    console.error('Error executing script:', err);
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    };

    try {
        // Enable foreign keys
        await new Promise((resolve, reject) => {
            db.run("PRAGMA foreign_keys = ON;", (err) => {
                if (err) reject(err);
                else resolve();
            });
        });

        console.log('Applying schema...');
        // We need to clean up some Postgres specific syntax if present, 
        // but let's try executing first. The schema.sql has SERIAL which is Postgres.
        // SQLite uses INTEGER PRIMARY KEY AUTOINCREMENT.
        // It also has CHECK constraints which SQLite supports.
        // TIMESTAMP DEFAULT CURRENT_TIMESTAMP is supported.

        // Simple regex replacement for Postgres -> SQLite compatibility
        let compatibleSchema = schemaSql
            .replace(/SERIAL PRIMARY KEY/g, 'INTEGER PRIMARY KEY AUTOINCREMENT')
            .replace(/SERIAL/g, 'INTEGER')
            .replace(/BOOLEAN/g, 'INTEGER') // SQLite uses 0/1 for booleans usually, but accepts BOOLEAN keyword as affinity
            .replace(/TRUE/g, '1')
            .replace(/FALSE/g, '0');

        await executeScript(compatibleSchema);
        console.log('Schema applied.');

        console.log('Applying sample data...');
        await executeScript(sampleDataSql);
        console.log('Sample data applied.');

        console.log('Database initialization complete.');
    } catch (err) {
        console.error('Failed to initialize database:', err);
    } finally {
        db.close();
    }
};

init();
