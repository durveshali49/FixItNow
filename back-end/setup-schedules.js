import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function setupProviderSchedule() {
    let connection;
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });

        console.log('✅ Connected to database');
        console.log('\n📋 Checking provider schedules...\n');
        
        // Get all service providers
        const [providers] = await connection.query(
            "SELECT id, name, email FROM users WHERE role = 'Service Provider'"
        );
        
        if (providers.length === 0) {
            console.log('❌ No service providers found!');
            await connection.end();
            return;
        }
        
        console.log(`Found ${providers.length} service provider(s):\n`);
        
        for (const provider of providers) {
            console.log(`Provider: ${provider.name} (${provider.email})`);
            
            // Check existing schedule
            const [existingSchedule] = await connection.query(
                "SELECT * FROM provider_schedules WHERE provider_id = ?",
                [provider.id]
            );
            
            if (existingSchedule.length > 0) {
                console.log('  ⚠️  Schedule already exists, clearing old schedule...');
                await connection.query(
                    "DELETE FROM provider_schedules WHERE provider_id = ?",
                    [provider.id]
                );
            }
            
            console.log('  🔄 Creating full week schedule (9 AM - 5 PM)...');
            
            // Create schedule for all 7 days (0=Sunday through 6=Saturday)
            const schedules = [
                { day: 0, name: 'Sunday' },
                { day: 1, name: 'Monday' },
                { day: 2, name: 'Tuesday' },
                { day: 3, name: 'Wednesday' },
                { day: 4, name: 'Thursday' },
                { day: 5, name: 'Friday' },
                { day: 6, name: 'Saturday' }
            ];
            
            for (const schedule of schedules) {
                await connection.query(
                    "INSERT INTO provider_schedules (provider_id, day_of_week, start_time, end_time, is_available) VALUES (?, ?, ?, ?, ?)",
                    [provider.id, schedule.day, '09:00:00', '17:00:00', true]
                );
                console.log(`    ✅ ${schedule.name}: 9:00 AM - 5:00 PM`);
            }
            console.log('');
        }
        
        console.log('✅ All provider schedules set up successfully!');
        console.log('\n📅 Available time slots: 9:00 AM - 5:00 PM (all days)');
        console.log('⏰ Slot duration: 1 hour');
        
        await connection.end();
        
    } catch (err) {
        console.error('❌ Error:', err.message);
        if (connection) await connection.end();
        process.exit(1);
    }
}

setupProviderSchedule();
