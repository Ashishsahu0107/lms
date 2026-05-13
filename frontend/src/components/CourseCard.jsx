import { useState } from 'react';

import { motion } from 'framer-motion';
import { 
  Users, 
  Clock, 
  BookOpen, 
  Play, 
  Edit, 
  Trash2, 
  MoreVertical,
  Star,
  TrendingUp
} from 'lucide-react';
import { 
  GlassCard, 
  SaaSButton, 
  TooltipWrapper 
} from './ui';

const CourseCard = ({ 
  course,
  isTeacher = false,
  onContinue,
  onEdit,
  onDelete,
  className = '',
  ...props 
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const {
    id,
    title,
    thumbnail,
    instructor,
    instructorAvatar,
    progress = 0,
    studentsCount = 0,
    duration,
    rating = 0,
    totalLessons = 0,
    completedLessons = 0,
    level = 'beginner',

    isPublished = true,

  } = course;

  const levelColors = {
    beginner: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    intermediate: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    advanced: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
  };

  const handleAction = (action) => {
    setIsDropdownOpen(false);
    action();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -5 }}
      className={`group ${className}`}
      {...props}
    >
      <GlassCard hover className="overflow-hidden">
        {/* Course Thumbnail */}
        <div className="relative h-48 overflow-hidden">
          <img
            src={thumbnail || '/api/placeholder/400/200'}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          
          {/* Overlay with play button */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="absolute bottom-4 left-4 right-4">
              <SaaSButton
                variant="primary"
                size="sm"
                icon={Play}
                fullWidth
                onClick={() => onContinue?.(id)}
              >
                Continue Learning
              </SaaSButton>
            </div>
          </div>

          {/* Status badge */}
          {!isPublished && (
            <div className="absolute top-4 left-4">
              <span className="px-2 py-1 bg-yellow-500 text-white text-xs font-semibold rounded-full">
                Draft
              </span>
            </div>
          )}

          {/* Teacher actions dropdown */}
          {isTeacher && (
            <div className="absolute top-4 right-4">
              <TooltipWrapper content="More options" position="left">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="p-2 bg-white/90 dark:bg-gray-800/90 rounded-lg hover:bg-white dark:hover:bg-gray-800 transition-colors"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
              </TooltipWrapper>

              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute right-0 top-12 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10"
                >
                  <button
                    onClick={() => handleAction(() => onEdit?.(id))}
                    className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Edit Course
                  </button>
                  <button
                    onClick={() => handleAction(() => onDelete?.(id))}
                    className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 text-red-600 dark:text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Course
                  </button>
                </motion.div>
              )}
            </div>
          )}
        </div>

        {/* Course Content */}
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 line-clamp-2">
                {title}
              </h3>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${levelColors[level]}`}>
                  {level}
                </span>
                {rating > 0 && (
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span>{rating.toFixed(1)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Instructor */}
          <div className="flex items-center gap-3 mb-4">
            <img
              src={instructorAvatar || '/api/placeholder/32/32'}
              alt={instructor}
              className="w-8 h-8 rounded-full object-cover"
            />
            <span className="text-sm text-gray-600 dark:text-gray-400">{instructor}</span>
          </div>

          {/* Progress Section */}
          {progress > 0 && (
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600 dark:text-gray-400">Progress</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {completedLessons}/{totalLessons} lessons
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
                />
              </div>
              <div className="text-right mt-1">
                <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                  {progress}% complete
                </span>
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-4">
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{studentsCount.toLocaleString()} students</span>
            </div>
            {duration && (
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{duration}</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            {isTeacher ? (
              <>
                <SaaSButton
                  variant="secondary"
                  size="sm"
                  icon={Edit}
                  onClick={() => onEdit?.(id)}
                  className="flex-1"
                >
                  Edit
                </SaaSButton>
                <SaaSButton
                  variant="outline"
                  size="sm"
                  icon={TrendingUp}
                  onClick={() => {/* Analytics */}}
                >
                  Analytics
                </SaaSButton>
              </>
            ) : (
              <>
                <SaaSButton
                  variant="primary"
                  size="sm"
                  icon={Play}
                  onClick={() => onContinue?.(id)}
                  className="flex-1"
                >
                  {progress > 0 ? 'Continue' : 'Start'}
                </SaaSButton>
                <SaaSButton
                  variant="outline"
                  size="sm"
                  icon={BookOpen}
                  onClick={() => {/* View details */}}
                >
                  Details
                </SaaSButton>
              </>
            )}
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
};

export { CourseCard };
export default CourseCard;
