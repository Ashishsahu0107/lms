import React from 'react';
import { motion } from 'framer-motion';
import { 
  FileX, 
  Users, 
  BookOpen, 
  Inbox, 
  Search,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

const EmptyState = ({ 
  type = 'default',
  title,
  subtitle,
  action,
  icon: CustomIcon,
  className = '',
  ...props 
}) => {
  const configurations = {
    default: {
      icon: FileX,
      title: title || 'No data found',
      subtitle: subtitle || 'There are no items to display at the moment.',
      gradient: 'from-gray-400 to-gray-600'
    },
    noUsers: {
      icon: Users,
      title: title || 'No users found',
      subtitle: subtitle || 'No users match your current filters.',
      gradient: 'from-blue-400 to-blue-600'
    },
    noCourses: {
      icon: BookOpen,
      title: title || 'No courses available',
      subtitle: subtitle || 'Start by creating your first course.',
      gradient: 'from-green-400 to-green-600'
    },
    noResults: {
      icon: Search,
      title: title || 'No results found',
      subtitle: subtitle || 'Try adjusting your search terms or filters.',
      gradient: 'from-yellow-400 to-orange-600'
    },
    error: {
      icon: AlertCircle,
      title: title || 'Something went wrong',
      subtitle: subtitle || 'An error occurred while loading the data.',
      gradient: 'from-red-400 to-red-600'
    },
    empty: {
      icon: Inbox,
      title: title || 'Nothing here yet',
      subtitle: subtitle || 'This section is waiting for content.',
      gradient: 'from-purple-400 to-purple-600'
    }
  };

  const config = configurations[type] || configurations.default;
  const Icon = CustomIcon || config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`
        flex flex-col items-center justify-center
        text-center py-12 px-6
        ${className}
      `}
      {...props}
    >
      <motion.div
        whileHover={{ scale: 1.05, rotate: 5 }}
        className={`
          p-4 rounded-2xl
          bg-gradient-to-br ${config.gradient}
          text-white shadow-lg
          mb-6
        `}
      >
        <Icon className="w-12 h-12" />
      </motion.div>
      
      <div className="max-w-md">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          {config.title}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {config.subtitle}
        </p>
        
        {action && (
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {action}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default EmptyState;
