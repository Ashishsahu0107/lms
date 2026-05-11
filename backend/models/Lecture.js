import mongoose from 'mongoose';

const lectureSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a lecture title'],
    trim: true,
    maxlength: [200, 'Title cannot be more than 200 characters']
  },
  videoUrl: {
    type: String,
    required: [true, 'Please add a video URL']
  },
  pdfNotes: {
    type: String
  },
  duration: {
    type: Number, // in minutes
    required: [true, 'Please add lecture duration']
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  order: {
    type: Number,
    required: true
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  description: {
    type: String,
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  resources: [{
    name: String,
    url: String,
    type: {
      type: String,
      enum: ['pdf', 'link', 'image', 'video']
    }
  }]
}, {
  timestamps: true
});

// Index for efficient querying
lectureSchema.index({ course: 1, order: 1 });

export default mongoose.model('Lecture', lectureSchema);
