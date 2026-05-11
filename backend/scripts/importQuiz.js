// Script to import quiz.json into MongoDB
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Quiz from '../models/Quiz.js';

// Get __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/lms', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.on('connected', async () => {
  console.log('MongoDB connected');
  try {
    const quizData = JSON.parse(fs.readFileSync(path.join(__dirname, '../quiz.json'), 'utf-8'));
    // Insert all quizzes
    await Quiz.insertMany(quizData);
    console.log('Quiz data imported successfully!');
  } catch (err) {
    console.error('Error importing quiz:', err);
  } finally {
    mongoose.disconnect();
  }
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});
