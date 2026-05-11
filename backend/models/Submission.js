import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assignment',
    required: true
  },
  file: {
    name: String,
    url: String,
    type: {
      type: String,
      enum: ['pdf', 'doc', 'docx', 'zip', 'image', 'other']
    },
    size: Number // in bytes
  },
  marks: {
    type: Number,
    min: 0,
    default: null
  },
  feedback: {
    type: String,
    maxlength: [1000, 'Feedback cannot be more than 1000 characters']
  },
  status: {
    type: String,
    enum: ['submitted', 'graded', 'late', 'plagiarized'],
    default: 'submitted'
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  gradedAt: {
    type: Date
  },
  gradedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  isLate: {
    type: Boolean,
    default: false
  },
  latePenalty: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  finalMarks: {
    type: Number,
    min: 0
  },
  comments: [{
    text: String,
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Check if submission is late
submissionSchema.pre('save', async function(next) {
  if (this.isNew && !this.submittedAt) {
    this.submittedAt = new Date();
  }

  // Check if submission is late
  if (this.assignment) {
    const Assignment = mongoose.model('Assignment');
    const assignment = await Assignment.findById(this.assignment);
    if (assignment && this.submittedAt > assignment.dueDate) {
      this.isLate = true;
      this.status = 'late';
      this.latePenalty = assignment.latePenalty || 0;
    }
  }

  // Calculate final marks when graded
  if (this.isModified('marks') && this.marks !== null) {
    this.gradedAt = new Date();
    this.status = 'graded';
    this.finalMarks = this.marks - (this.marks * this.latePenalty / 100);
  }

  next();
});

// Index for efficient querying
submissionSchema.index({ assignment: 1, student: 1 });
submissionSchema.index({ student: 1, status: 1 });

export default mongoose.model('Submission', submissionSchema);