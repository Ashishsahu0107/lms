import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';

const FormInput = forwardRef(({
  label,
  type = 'text',
  placeholder,
  error,
  helper,
  required = false,
  disabled = false,
  leftIcon,
  rightIcon,
  className = '',
  containerClassName = '',
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = React.useState(false);
  const [isFocused, setIsFocused] = React.useState(false);

  const inputType = type === 'password' ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className={`space-y-1 ${containerClassName}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            {leftIcon}
          </div>
        )}
        
        <motion.input
          ref={ref}
          type={inputType}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            w-full px-4 py-2 rounded-lg border transition-all duration-200
            ${leftIcon ? 'pl-10' : 'pl-4'}
            ${rightIcon || type === 'password' ? 'pr-10' : 'pr-4'}
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
            ${className}
          `}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          whileFocus={{ scale: 1.01 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
          {...props}
        />
        
        {type === 'password' && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
        
        {rightIcon && type !== 'password' && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            {rightIcon}
          </div>
        )}
        
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

FormInput.displayName = 'FormInput';

export default FormInput;
