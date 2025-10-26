import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

async function checkAdminUser() {
    let connection;
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });

        console.log('✅ Connected to database');
        console.log('\n📋 Checking admin users...\n');
        
        const [admins] = await connection.query(
            "SELECT id, name, email, role, created_at FROM users WHERE role = 'Admin'"
        );
        
        if (admins.length === 0) {
            console.log('❌ No admin users found in database!');
            console.log('🔄 Creating admin user...\n');
            
            // Create admin user with proper password hash
            const hashedPassword = await bcrypt.hash('admin123', 10);
            await connection.query(
                "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
                ['Admin User', 'admin@localseva.com', hashedPassword, 'Admin']
            );
            
            console.log('✅ Admin user created successfully!');
            console.log('\nAdmin Credentials:');
            console.log('Email: admin@localseva.com');
            console.log('Password: admin123');
        } else {
            console.log('✅ Found admin users:');
            admins.forEach(admin => {
                console.log(`\n  ID: ${admin.id}`);
                console.log(`  Name: ${admin.name}`);
                console.log(`  Email: ${admin.email}`);
                console.log(`  Role: ${admin.role}`);
                console.log(`  Created: ${admin.created_at}`);
            });
            
            console.log('\n\n🔄 Resetting admin password to: admin123');
            const hashedPassword = await bcrypt.hash('admin123', 10);
            await connection.query(
                "UPDATE users SET password = ? WHERE email = 'admin@localseva.com'",
                [hashedPassword]
            );
            console.log('✅ Password reset successfully!');
            
            console.log('\nAdmin Credentials:');
            console.log('Email: admin@localseva.com');
            console.log('Password: admin123');
        }
        
        await connection.end();
        
    } catch (err) {
        console.error('❌ Error:', err.message);
        if (connection) await connection.end();
        process.exit(1);
    }
}

checkAdminUser();
