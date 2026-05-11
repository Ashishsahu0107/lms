// Script to import quiz.json into MongoDB
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Quiz = require('./models/Quiz');
const db = require('./config/db');

// MongoDB connection
mongoose.connect(db.mongoURI || 'mongodb://localhost:27017/lms', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.on('connected', async () => {
  console.log('MongoDB connected');
  try {
    const quizData = JSON.parse(fs.readFileSync(path.join(__dirname, 'quiz.json'), 'utf-8'));
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
