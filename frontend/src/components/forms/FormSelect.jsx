import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, AlertCircle } from 'lucide-react';

const FormSelect = forwardRef(({
  label,
  options = [],
  placeholder,
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
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <motion.select
          ref={ref}
          disabled={disabled}
          className={`
            w-full px-4 py-2 pr-10 rounded-lg border transition-all duration-200 appearance-none
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
            text-gray-900 dark:text-white
            ${className}
          `}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          whileFocus={{ scale: 1.01 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </motion.select>
        
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
            isFocused ? 'rotate-180' : ''
          }`} />
        </div>
        
        {error && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500">
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

FormSelect.displayName = 'FormSelect';

export default FormSelect;
