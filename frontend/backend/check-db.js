const Database = require('better-sqlite3');
const path = require('path');

// Connect to database
const dbPath = path.join(__dirname, 'Merchantdb', 'merchant.db');
const db = new Database(dbPath);

// 1. Get the latest merchant
const merchant = db.prepare('SELECT * FROM merchants ORDER BY id DESC LIMIT 1').get();

if (!merchant) {
  console.log('❌ No merchant data found.');
} else {
  console.log('\n=============================================');
  console.log('MERCHANT PROFILE'); 
  console.log('=============================================');
  console.log('ID:', merchant.id);
  console.log('Name:', merchant.name);
  console.log('Industry:', merchant.industry);       
  console.log('Address:', merchant.address);
  console.log('Timezone:', merchant.timezone);
  console.log('About:', merchant.about);             
  console.log('Things to Know:', merchant.policies_info); 
  console.log('Cancellation:', merchant.cancellation_policy);
  console.log('Deposit Req:', merchant.deposit_required ? 'Yes' : 'No');
  console.log('Break Time:', merchant.break_duration, 'mins');
  console.log('Book Ahead:', merchant.book_ahead_days, 'days');
  console.log('Images:', { Logo: merchant.logo_path, Cover: merchant.cover_photo_path });
  
  // 2. Get Services
  const services = db.prepare('SELECT name, duration, price, description FROM services WHERE merchant_id = ?').all(merchant.id);
  console.log('\nSERVICES (' + services.length + '):');
  console.table(services);

  // 3. Get Staff
  const staff = db.prepare('SELECT name, bio, specialties FROM staff WHERE merchant_id = ?').all(merchant.id);
  console.log('\nSTAFF (' + staff.length + '):');
  console.table(staff);

  // 4. Get Hours
  const hours = db.prepare('SELECT day_of_week, is_open, open_time, close_time FROM working_hours WHERE merchant_id = ?').all(merchant.id);
  console.log('\nWORKING HOURS:');
  console.table(hours);
}