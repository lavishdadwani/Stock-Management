import mongoose from 'mongoose';
import chalk from 'chalk';
import dotenv from 'dotenv';

// Load environment variables if not already loaded
dotenv.config({ path: '.env' });

const MONGODB_URL = process.env.MONGODB_URL;

if (!MONGODB_URL) {
  console.error(chalk.red('Error: MONGODB_URL is not defined in environment variables'));
  process.exit(1);
}

mongoose
  .connect(MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then((res) =>  console.log(
    chalk.green.bold('DB connected')
  ))
  .catch((err) => {
    console.error(chalk.red('Database connection error:'), err);
    process.exit(1);
  });