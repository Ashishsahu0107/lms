import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const TooltipWrapper = ({ 
  children, 
  content, 
  position = 'top',
  delay = 0,
  className = '',
  tooltipClassName = '',
  ...props 
}) => {
  const [isVisible, setIsVisible] = useState(false);

  const positionClasses = {
    top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 transform -translate-y-1/2 ml-2'
  };

  const arrowClasses = {
    top: 'top-full left-1/2 transform -translate-x-1/2 -mt-1 border-l-transparent border-r-transparent border-b-transparent border-t-gray-900',
    bottom: 'bottom-full left-1/2 transform -translate-x-1/2 -mb-1 border-l-transparent border-r-transparent border-t-transparent border-b-gray-900',
    left: 'left-full top-1/2 transform -translate-y-1/2 -ml-1 border-t-transparent border-b-transparent border-r-transparent border-l-gray-900',
    right: 'right-full top-1/2 transform -translate-y-1/2 -mr-1 border-t-transparent border-b-transparent border-l-transparent border-r-gray-900'
  };

  return (
    <div 
      className={`relative inline-block ${className}`}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      {...props}
    >
      {children}
      
      <AnimatePresence>
        {isVisible && content && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2, delay }}
            className={`
              absolute z-50 px-3 py-2 text-sm text-white bg-gray-900 dark:bg-gray-700 
              rounded-lg shadow-lg whitespace-nowrap
              ${positionClasses[position]}
              ${tooltipClassName}
            `}
          >
            {content}
            <div 
              className={`
                absolute w-0 h-0 border-4
                ${arrowClasses[position]}
              `}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TooltipWrapper;
