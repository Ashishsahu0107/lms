import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';

const FormCheckbox = forwardRef(({
  label,
  error,
  helper,
  required = false,
  disabled = false,
  className = '',
  containerClassName = '',
  ...props
}, ref) => {
  const [isFocused, setIsFocused] = React.useState(false);

  return (
    <div className={`space-y-1 ${containerClassName}`}>
      <div className="flex items-center gap-3">
        <motion.div
          className="relative"
          whileTap={{ scale: 0.95 }}
        >
          <input
            ref={ref}
            type="checkbox"
            disabled={disabled}
            className={`
              w-4 h-4 rounded border transition-all duration-200
              ${error 
                ? 'border-red-500 focus:ring-red-500' 
                : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500'
              }
              ${disabled 
                ? 'cursor-not-allowed opacity-50' 
                : 'cursor-pointer'
              }
              text-blue-600 focus:ring-2
              ${className}
            `}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            {...props}
          />
          
          {isFocused && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute inset-0 rounded border-2 border-blue-500 pointer-events-none"
            />
          )}
        </motion.div>
        
        {label && (
          <label 
            className={`
              text-sm font-medium cursor-pointer select-none
              ${disabled 
                ? 'text-gray-400 dark:text-gray-500 cursor-not-allowed' 
                : 'text-gray-700 dark:text-gray-300'
              }
            `}
            onClick={() => {
              if (!disabled && ref?.current) {
                ref.current.checked = !ref.current.checked;
              }
            }}
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
      </div>
      
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-red-600 dark:text-red-400"
        >
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

FormCheckbox.displayName = 'FormCheckbox';

export default FormCheckbox;
