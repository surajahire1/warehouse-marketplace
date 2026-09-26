import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { config } from '../config/env.js';
import { User, USER_ROLES } from '../models/User.js';

const [,, command, arg1, arg2, arg3] = process.argv;

async function main() {
  try {
    await mongoose.connect(config.mongoUri);
    console.log('[DB] Connected to MongoDB');

    if (command === 'list') {
      const users = await User.find({}, 'name email role phone createdAt');
      console.log('\n--- Existing Users ---');
      console.table(
        users.map((u) => ({
          ID: u._id.toString(),
          Name: u.name,
          Email: u.email,
          Role: u.role,
          Phone: u.phone || 'N/A',
        }))
      );
    } else if (command === 'reset') {
      const email = arg1;
      const newPassword = arg2;

      if (!email || !newPassword) {
        console.error('Usage: node src/utils/manage-user.js reset <email> <newPassword>');
        process.exit(1);
      }

      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        console.error(`User with email "${email}" not found.`);
        process.exit(1);
      }

      user.password = newPassword; // Pre-save hook will hash it
      await user.save();
      console.log(`✅ Successfully updated password for ${user.email} (Role: ${user.role}) to: "${newPassword}"`);
    } else if (command === 'create-admin') {
      const email = arg1;
      const password = arg2;
      const name = arg3 || 'Super Admin';

      if (!email || !password) {
        console.error('Usage: node src/utils/manage-user.js create-admin <email> <password> [name]');
        process.exit(1);
      }

      let user = await User.findOne({ email: email.toLowerCase() });
      if (user) {
        user.role = USER_ROLES.ADMIN;
        user.password = password;
        await user.save();
        console.log(`✅ Existing user ${email} upgraded to ADMIN with the new password.`);
      } else {
        user = await User.create({
          name,
          email: email.toLowerCase(),
          password,
          role: USER_ROLES.ADMIN,
          isVerified: true,
        });
        console.log(`✅ New ADMIN user created: ${user.email} with password: "${password}"`);
      }
    } else {
      console.log(`
Available commands:
  node src/utils/manage-user.js list
  node src/utils/manage-user.js reset <email> <newPassword>
  node src/utils/manage-user.js create-admin <email> <password> [name]
      `);
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

main();
