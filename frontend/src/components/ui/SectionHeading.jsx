import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

const SectionHeading = ({ 
  title, 
  subtitle, 
  icon: Icon,
  action,
  className = '',
  size = 'lg',
  ...props 
}) => {
  const sizeClasses = {
    sm: 'text-lg font-semibold',
    md: 'text-xl font-bold',
    lg: 'text-2xl font-bold',
    xl: 'text-3xl font-bold'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`
        flex items-center justify-between
        mb-6 sm:mb-8
        ${className}
      `}
      {...props}
    >
      <div className="flex items-center space-x-3">
        {Icon && (
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl text-white"
          >
            <Icon className="w-5 h-5" />
          </motion.div>
        )}
        <div>
          <h2 className={`
            ${sizeClasses[size]}
            text-gray-900 dark:text-white
            flex items-center gap-2
          `}>
            {title}
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </h2>
          {subtitle && (
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      
      {action && (
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {action}
        </motion.div>
      )}
    </motion.div>
  );
};

export default SectionHeading;
