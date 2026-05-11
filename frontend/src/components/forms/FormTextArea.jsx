import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';

const FormTextArea = forwardRef(({
  label,
  placeholder,
  error,
  helper,
  required = false,
  disabled = false,
  rows = 4,
  resize = 'vertical',
  className = '',
  containerClassName = '',
  ...props
}, ref) => {
  const [isFocused, setIsFocused] = React.useState(false);

  const resizeClasses = {
    none: 'resize-none',
    vertical: 'resize-y',
    horizontal: 'resize-x',
    both: 'resize'
  };

  return (
    <div className={`space-y-1 ${containerClassName}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <motion.textarea
          ref={ref}
          placeholder={placeholder}
          disabled={disabled}
          rows={rows}
          className={`
            w-full px-4 py-2 rounded-lg border transition-all duration-200
            ${error 
              ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
              : isFocused
                ? 'border-blue-500 focus:ring-blue-500 focus:border-blue-500'
                : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500'
            }
            ${disabled 
              ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed' 
              : 'bg-white dark:bg-gray-900'
            }
            text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400
            ${resizeClasses[resize]}
            ${className}
          `}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          whileFocus={{ scale: 1.01 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
          {...props}
        />
        
        {error && (
          <div className="absolute top-3 right-3 text-red-500">
            <AlertCircle className="w-4 h-4" />
          </div>
        )}
      </div>
      
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
        >
          <AlertCircle className="w-3 h-3" />
          {error}
        </motion.p>
      )}
      
      {helper && !error && (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {helper}
        </p>
      )}
    </div>
  );
});

FormTextArea.displayName = 'FormTextArea';

export default FormTextArea;
