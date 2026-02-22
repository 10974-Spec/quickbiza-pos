import db from './backend/database/db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log("--- Checking Uploads Directory ---");
const uploadDir = path.join(__dirname, 'uploads');
if (fs.existsSync(uploadDir)) {
    const files = fs.readdirSync(uploadDir);
    console.log(`Files in ${uploadDir}:`, files);
} else {
    console.log(`Uploads directory ${uploadDir} does not exist!`);
}

console.log("\n--- Checking Users Table Schema ---");
const schema = db.prepare("PRAGMA table_info(users)").all();
const hasProfilePic = schema.some(c => c.name === 'profile_picture');
console.log("Has profile_picture column:", hasProfilePic);
console.log("Columns:", schema.map(c => c.name));

console.log("\n--- Checking User Data ---");
const user = db.prepare("SELECT id, full_name, profile_picture FROM users LIMIT 1").get();
console.log("Sample User:", user);
