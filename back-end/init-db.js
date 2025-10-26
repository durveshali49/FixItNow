import mysql from 'mysql2/promise';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

async function initializeDatabase() {
    let connection;
    try {
        console.log('🔄 Connecting to MySQL server...');
        
        // Connect without specifying database
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            multipleStatements: true
        });

        console.log('✅ Connected to MySQL server');
        console.log('🔄 Reading init.sql file...');
        
        const initSql = fs.readFileSync('init.sql', 'utf8');
        
        console.log('🔄 Executing SQL script to create database and tables...');
        await connection.query(initSql);
        
        console.log('✅ Database initialized successfully!');
        console.log('✅ Database "Service" created');
        console.log('✅ All tables created');
        console.log('✅ Sample data inserted');
        
        await connection.end();
        console.log('\n🎉 Setup complete! You can now run the server.');
        
    } catch (err) {
        console.error('\n❌ Database initialization failed:');
        console.error('Error Message:', err.message);
        console.error('Error Code:', err.code);
        if (connection) await connection.end();
        process.exit(1);
    }
}

initializeDatabase();
