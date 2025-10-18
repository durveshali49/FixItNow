// Data Restoration Script for FixItNow - NEW SUPABASE ACCOUNT
// Run this after setting up your NEW Supabase credentials in .env.local

const RESTORE_ENDPOINT = "http://localhost:3000/api/admin/restore-data";
const RESTORE_KEY = "fixitnow-restore-2025"; // Should match your .env.local key

// NOTE: Before running this script, make sure you've:
// 1. Created new Supabase account
// 2. Updated .env.local with new credentials  
// 3. Run the setup-new-supabase.sql script in Supabase SQL Editor
// 4. Started your Next.js app with: npm run dev

async function restoreServiceCategories() {
  console.log("🔄 Starting service categories restoration...");
  
  try {
    const response = await fetch(RESTORE_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        restoreKey: RESTORE_KEY,
        dataType: "service_categories"
      }),
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log("✅ Service categories restored successfully!");
      console.log("📊 Results:", result);
      return true;
    } else {
      console.error("❌ Failed to restore service categories:", result.error);
      return false;
    }
  } catch (error) {
    console.error("💥 Network error:", error.message);
    return false;
  }
}

async function restoreAdminUser() {
  console.log("🔄 Creating default admin user...");
  
  try {
    const response = await fetch(RESTORE_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        restoreKey: RESTORE_KEY,
        dataType: "admin_users"
      }),
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log("✅ Admin user setup completed!");
      console.log("📊 Results:", result);
      
      if (result.results[0]?.credentials) {
        console.log("\n🔑 Admin Login Credentials:");
        console.log("Username:", result.results[0].credentials.username);
        console.log("Email:", result.results[0].credentials.email);
        console.log("Password:", result.results[0].credentials.password);
      }
      return true;
    } else {
      console.error("❌ Failed to create admin user:", result.error);
      return false;
    }
  } catch (error) {
    console.error("💥 Network error:", error.message);
    return false;
  }
}

async function restoreAllData() {
  console.log("🚀 Starting complete data restoration...");
  console.log("⚠️  Make sure your Next.js app is running on localhost:3000");
  console.log("⚠️  Make sure ADMIN_SETUP_KEY is set in .env.local\n");
  
  try {
    const response = await fetch(RESTORE_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        restoreKey: RESTORE_KEY
      }),
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log("✅ Complete data restoration successful!");
      console.log("📊 Restoration Summary:");
      result.results.forEach(item => {
        console.log(`  - ${item.type}: ${item.count} records ${item.message || 'created'}`);
      });
      
      // Show admin credentials if created
      const adminResult = result.results.find(r => r.type === 'admin_users');
      if (adminResult?.credentials) {
        console.log("\n🔑 Admin Login Credentials:");
        console.log("  Username:", adminResult.credentials.username);
        console.log("  Email:", adminResult.credentials.email);
        console.log("  Password:", adminResult.credentials.password);
      }
      
      console.log("\n🎉 Your FixItNow app is ready for client submission!");
      console.log("📝 Next steps:");
      console.log("  1. Test the booking flow to ensure services appear");
      console.log("  2. Login to admin dashboard with the credentials above");
      console.log("  3. Remove the ADMIN_SETUP_KEY from .env.local for security");
      
      return true;
    } else {
      console.error("❌ Data restoration failed:", result.error);
      return false;
    }
  } catch (error) {
    console.error("💥 Network error:", error.message);
    console.log("📝 Make sure:");
    console.log("  1. Your Next.js app is running (npm run dev)");
    console.log("  2. The API route is accessible");
    console.log("  3. ADMIN_SETUP_KEY is correctly set in .env.local");
    return false;
  }
}

// Export functions for use in browser console or Node.js
if (typeof window !== 'undefined') {
  // Browser environment - attach to window
  window.restoreServiceCategories = restoreServiceCategories;
  window.restoreAdminUser = restoreAdminUser;
  window.restoreAllData = restoreAllData;
  
  console.log("🛠️  Data Restoration Tools Loaded!");
  console.log("📋 Available functions:");
  console.log("  - restoreServiceCategories()");
  console.log("  - restoreAdminUser()");
  console.log("  - restoreAllData()");
  console.log("\n💡 Run restoreAllData() to restore everything at once");
  
} else {
  // Node.js environment
  module.exports = {
    restoreServiceCategories,
    restoreAdminUser,
    restoreAllData
  };
}