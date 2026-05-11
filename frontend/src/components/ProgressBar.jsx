import React from 'react';
import { motion } from 'framer-motion';

const ProgressBar = ({ 
  value = 0,
  max = 100,
  size = 'md',
  variant = 'default',
  showLabel = true,
  showPercentage = true,
  animated = true,
  color = 'primary',
  className = '',
  ...props 
}) => {
  const percentage = Math.min((value / max) * 100, 100);

  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
    xl: 'h-4'
  };

  const colorClasses = {
    primary: 'bg-gradient-to-r from-blue-500 to-purple-600',
    success: 'bg-gradient-to-r from-green-500 to-emerald-600',
    warning: 'bg-gradient-to-r from-yellow-500 to-orange-600',
    danger: 'bg-gradient-to-r from-red-500 to-pink-600',
    info: 'bg-gradient-to-r from-cyan-500 to-blue-600'
  };

  const variantClasses = {
    default: 'bg-gray-200 dark:bg-gray-700',
    rounded: 'bg-gray-200 dark:bg-gray-700 rounded-full',
    flat: 'bg-gray-100 dark:bg-gray-800'
  };

  return (
    <div className={`w-full ${className}`} {...props}>
      {showLabel && (
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Progress
          </span>
          {showPercentage && (
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {percentage.toFixed(1)}%
            </span>
          )}
        </div>
      )}
      
      <div className={`
        relative overflow-hidden
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${variant === 'rounded' ? 'rounded-full' : 'rounded-lg'}
      `}>
        <motion.div
          initial={animated ? { width: 0 } : { width: `${percentage}%` }}
          animate={{ width: `${percentage}%` }}
          transition={{ 
            duration: animated ? 1.5 : 0, 
            ease: "easeOut",
            delay: animated ? 0.2 : 0
          }}
          className={`
            h-full
            ${colorClasses[color]}
            ${variant === 'rounded' ? 'rounded-full' : 'rounded-lg'}
            relative overflow-hidden
          `}
        >
          {/* Animated shine effect */}
          {animated && (
            <motion.div
              initial={{ x: -100 }}
              animate={{ x: 200 }}
              transition={{ 
                duration: 2, 
                repeat: Infinity, 
                ease: "linear",
                repeatDelay: 1
              }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            />
          )}
        </motion.div>
      </div>
    </div>
  );
};

// Circular Progress Component
const CircularProgress = ({ 
  value = 0,
  max = 100,
  size = 120,
  strokeWidth = 8,
  color = 'primary',
  showLabel = true,
  animated = true,
  className = '',
  ...props 
}) => {
  const percentage = Math.min((value / max) * 100, 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const colorClasses = {
    primary: 'stroke-blue-500',
    success: 'stroke-green-500',
    warning: 'stroke-yellow-500',
    danger: 'stroke-red-500',
    info: 'stroke-cyan-500'
  };

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`} {...props}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-gray-200 dark:text-gray-700"
        />
        
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className={colorClasses[color]}
          strokeDasharray={circumference}
          initial={animated ? { strokeDashoffset: circumference } : { strokeDashoffset }}
          animate={{ strokeDashoffset }}
          transition={{ 
            duration: animated ? 1.5 : 0, 
            ease: "easeOut",
            delay: animated ? 0.2 : 0
          }}
          strokeLinecap="round"
        />
      </svg>
      
      {showLabel && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-gray-900 dark:text-white">
            {Math.round(percentage)}%
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Complete
          </span>
        </div>
      )}
    </div>
  );
};

// Step Progress Component
const StepProgress = ({ 
  steps = [],
  currentStep = 0,
  orientation = 'horizontal',
  className = '',
  ...props 
}) => {
  const isVertical = orientation === 'vertical';

  return (
    <div className={`
      ${isVertical ? 'flex flex-col space-y-4' : 'flex items-center space-x-4'}
      ${className}
    `} {...props}>
      {steps.map((step, index) => {
        const isActive = index === currentStep;
        const isCompleted = index < currentStep;
        const isPending = index > currentStep;

        return (
          <div
            key={index}
            className={`
              ${isVertical ? 'flex items-start space-x-3' : 'flex flex-col items-center'}
              ${!isVertical && index !== steps.length - 1 ? 'flex-1' : ''}
            `}
          >
            <div className="flex items-center">
              {/* Step circle */}
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3 }}
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium
                  transition-colors duration-300
                  ${isCompleted ? 'bg-green-500 text-white' : ''}
                  ${isActive ? 'bg-blue-500 text-white' : ''}
                  ${isPending ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400' : ''}
                `}
              >
                {isCompleted ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  index + 1
                )}
              </motion.div>

              {/* Connector line */}
              {!isVertical && index < steps.length - 1 && (
                <div className="flex-1 h-0.5 bg-gray-200 dark:bg-gray-700 mx-4">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: isCompleted ? '100%' : '0%' }}
                    transition={{ duration: 0.5 }}
                    className="h-full bg-green-500"
                  />
                </div>
              )}
            </div>

            {/* Step content */}
            <div className={isVertical ? 'flex-1' : 'mt-2 text-center'}>
              <h4 className={`text-sm font-medium ${
                isActive ? 'text-blue-600 dark:text-blue-400' : 
                isCompleted ? 'text-green-600 dark:text-green-400' : 
                'text-gray-500 dark:text-gray-400'
              }`}>
                {step.title}
              </h4>
              {step.description && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {step.description}
                </p>
              )}
            </div>

            {/* Vertical connector */}
            {isVertical && index < steps.length - 1 && (
              <div className="ml-5 w-0.5 h-8 bg-gray-200 dark:bg-gray-700">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: isCompleted ? '100%' : '0%' }}
                  transition={{ duration: 0.5 }}
                  className="w-full bg-green-500"
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

ProgressBar.Circular = CircularProgress;
ProgressBar.Step = StepProgress;

export { ProgressBar };
export default ProgressBar;
