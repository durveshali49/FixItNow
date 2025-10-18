// Password Hash Verification Script
// Run this with: node verify-password.js

const bcrypt = require('bcryptjs');

async function verifyPassword() {
    const password = 'Admin123!';
    const currentHash = '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi';
    
    console.log('🔍 Testing password hash...');
    console.log('Password to test:', password);
    console.log('Current hash:', currentHash);
    
    try {
        // Test if current hash matches
        const isValid = await bcrypt.compare(password, currentHash);
        console.log('❓ Current hash valid?', isValid ? '✅ YES' : '❌ NO');
        
        if (!isValid) {
            console.log('\n🔧 Generating new hash...');
            
            // Generate a fresh hash
            const newHash = await bcrypt.hash(password, 10);
            console.log('✨ New hash generated:', newHash);
            
            // Verify the new hash works
            const newHashValid = await bcrypt.compare(password, newHash);
            console.log('✅ New hash verification:', newHashValid ? '✅ WORKS' : '❌ FAILED');
            
            console.log('\n📋 SQL to update admin user:');
            console.log(`UPDATE public.admin_users 
SET password_hash = '${newHash}', updated_at = NOW() 
WHERE email = 'admin@fixitnow.com';`);
        } else {
            console.log('✅ Current hash is working correctly!');
        }
        
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

verifyPassword();