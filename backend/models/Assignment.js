import mongoose from 'mongoose';

const assignmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add an assignment title'],
    trim: true,
    maxlength: [200, 'Title cannot be more than 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add an assignment description'],
    maxlength: [2000, 'Description cannot be more than 2000 characters']
  },
  dueDate: {
    type: Date,
    required: [true, 'Please add a due date']
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  submissions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Submission'
  }],
  maxMarks: {
    type: Number,
    default: 100,
    min: [1, 'Max marks must be at least 1']
  },
  instructions: {
    type: String,
    maxlength: [1000, 'Instructions cannot be more than 1000 characters']
  },
  attachments: [{
    name: String,
    url: String,
    type: {
      type: String,
      enum: ['pdf', 'image', 'video', 'other']
    }
  }],
  isPublished: {
    type: Boolean,
    default: false
  },
  publishedAt: {
    type: Date
  },
  allowLateSubmission: {
    type: Boolean,
    default: false
  },
  latePenalty: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  }
}, {
  timestamps: true
});

// Update publishedAt when assignment is published
assignmentSchema.pre('save', function(next) {
  if (this.isModified('isPublished') && this.isPublished && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});

// Virtual for total submissions count
assignmentSchema.virtual('totalSubmissions').get(function() {
  return this.submissions ? this.submissions.length : 0;
});

// Index for efficient querying
assignmentSchema.index({ course: 1, dueDate: 1 });

export default mongoose.model('Assignment', assignmentSchema);