import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function testConnection() {
    try {
        console.log('Testing database connection...');
        console.log('DB_HOST:', process.env.DB_HOST);
        console.log('DB_USER:', process.env.DB_USER);
        console.log('DB_NAME:', process.env.DB_NAME);
        
        const pool = mysql.createPool({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        });

        const [rows] = await pool.query('SELECT 1 + 1 AS result');
        console.log('\n✅ Database connected successfully!');
        console.log('Test query result:', rows[0].result);
        
        // Test if users table exists
        const [tables] = await pool.query('SHOW TABLES');
        console.log('\n📋 Available tables:');
        tables.forEach(table => console.log('  -', Object.values(table)[0]));
        
        await pool.end();
        console.log('\n✅ Connection test completed successfully!');
    } catch (err) {
        console.error('\n❌ Database connection failed:');
        console.error('Error Message:', err.message);
        console.error('Error Code:', err.code);
        console.error('SQL State:', err.sqlState);
        process.exit(1);
    }
}

testConnection();
