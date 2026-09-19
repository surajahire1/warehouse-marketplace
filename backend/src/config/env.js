import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:4200',
  mongoUri: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/warehouse_db',
  jwtSecret: process.env.JWT_SECRET || 'dev_secret_jwt_key_should_be_changed_in_prod',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 10,
  razorpayKeyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_warehousespace',
  razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET || 'rzp_test_secret_key_12345',
  platformCommissionPercent: parseFloat(process.env.PLATFORM_COMMISSION_PERCENT) || 10,
};
