/**
 * Script to create an admin user for AASML Backend
 * Run this script once to create your first admin user
 * 
 * Usage: ts-node scripts/createAdmin.ts
 * Or: npm run create-admin
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import readline from 'readline';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

// Import User model and UserRole enum
import User from '../src/modules/users/user.model';
import { UserRole } from '../src/types';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = (query: string): Promise<string> => {
  return new Promise((resolve) => rl.question(query, resolve));
};

async function createAdminUser() {
  try {
    // Connect to MongoDB
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log('✅ Connected to MongoDB\n');

    // Get admin details from user
    console.log('📝 Create Admin User\n');
    const name = await question('Enter admin name (e.g., Admin User): ');
    const email = await question('Enter admin email (e.g., admin@aasml.org): ');
    const password = await question('Enter admin password (min 6 characters): ');

    if (!name || !email || !password) {
      console.error('❌ All fields are required!');
      await mongoose.connection.close();
      rl.close();
      process.exit(1);
    }

    if (password.length < 6) {
      console.error('❌ Password must be at least 6 characters!');
      await mongoose.connection.close();
      rl.close();
      process.exit(1);
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('\n⚠️  User with this email already exists!');
      const update = await question('Do you want to update this user to ADMIN role? (yes/no): ');
      
      if (update.toLowerCase() === 'yes' || update.toLowerCase() === 'y') {
        existingUser.role = UserRole.ADMIN;
        existingUser.name = name;
        await existingUser.save();
        console.log('\n✅ User updated to ADMIN role successfully!');
        console.log('\n📧 Login Credentials:');
        console.log(`   Email: ${email}`);
        console.log(`   Password: ${password}`);
        console.log(`   Role: ADMIN`);
        console.log('\n🔗 Login URL: http://localhost:8080/admin/login');
      } else {
        console.log('\n❌ Operation cancelled.');
      }
    } else {
      // Create new admin user
      const adminUser = await User.create({
        name,
        email,
        password, // Will be hashed by pre-save hook
        role: UserRole.ADMIN,
      });

      console.log('\n✅ Admin user created successfully!');
      console.log('\n📧 Login Credentials:');
      console.log(`   Email: ${email}`);
      console.log(`   Password: ${password}`);
      console.log(`   Role: ADMIN`);
      console.log('\n🔗 Login URL: http://localhost:8080/admin/login');
      console.log('\n⚠️  Please change your password after first login!');
    }

    // Close connection
    await mongoose.connection.close();
    rl.close();
    process.exit(0);
  } catch (error: any) {
    console.error('\n❌ Error creating admin user:', error.message);
    if (error.stack) {
      console.error('\n📋 Stack trace:', error.stack);
    }
    await mongoose.connection.close();
    rl.close();
    process.exit(1);
  }
}

// Run the script
createAdminUser();
