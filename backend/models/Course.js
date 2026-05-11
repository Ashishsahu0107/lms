import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a course title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a course description'],
    maxlength: [2000, 'Description cannot be more than 2000 characters']
  },
  thumbnail: {
    type: String,
    default: 'default-course.jpg'
  },
  category: {
    type: String,
    required: [true, 'Please add a course category'],
    enum: [
      'Programming',
      'Design',
      'Business',
      'Marketing',
      'Data Science',
      'Photography',
      'Music',
      'Other'
    ]
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  students: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  lectures: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lecture'
  }],
  assignments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assignment'
  }],
  price: {
    type: Number,
    default: 0,
    min: [0, 'Price cannot be negative']
  },
  level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  duration: {
    type: Number, // in minutes
    required: [true, 'Please add course duration']
  },
  language: {
    type: String,
    default: 'English'
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  publishedAt: {
    type: Date
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  ratingCount: {
    type: Number,
    default: 0
  },
  enrollmentCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Update publishedAt when course is published
courseSchema.pre('save', function(next) {
  if (this.isModified('isPublished') && this.isPublished && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});

// Virtual for total lectures count
courseSchema.virtual('totalLectures').get(function() {
  return this.lectures ? this.lectures.length : 0;
});

// Virtual for total assignments count
courseSchema.virtual('totalAssignments').get(function() {
  return this.assignments ? this.assignments.length : 0;
});

export default mongoose.model('Course', courseSchema);