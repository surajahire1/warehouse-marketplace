import mongoose from 'mongoose';
import { config } from './env.js';
import { seedInitialData } from '../utils/seeder.js';

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.mongoUri, {
      autoIndex: true,
      serverSelectionTimeoutMS: 4000,
    });
    console.log(`[MongoDB] Connected successfully: ${conn.connection.host} | Database: ${conn.connection.name}`);
    await seedInitialData();
    return conn;
  } catch (error) {
    console.error(`\n======================================================`);
    console.error(`❌ [MongoDB Error] Could not connect to database.`);
    console.error(`   Target URI: ${config.mongoUri}`);
    console.error(`   Reason:     ${error.message}`);
    console.error(`======================================================`);
    console.error(`\n👉 How to fix this:`);
    console.error(`Option 1 (Fastest - Free Cloud Database):`);
    console.error(`   1. Create a free database at: https://www.mongodb.com/cloud/atlas`);
    console.error(`   2. In backend/.env, update MONGO_URI to your Atlas connection string:`);
    console.error(`      MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxx.mongodb.net/warehouse_db\n`);
    console.error(`Option 2 (Local Windows Install):`);
    console.error(`   Install and start MongoDB locally using Windows winget:`);
    console.error(`      winget install MongoDB.Server`);
    console.error(`   Then start the service:`);
    console.error(`      net start MongoDB\n`);
    process.exit(1);
  }
};
