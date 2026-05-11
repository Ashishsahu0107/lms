import React from 'react';
import { motion } from 'framer-motion';

const GradientIconWrap = ({ 
  children, 
  size = 'md',
  gradient = 'primary',
  className = '',
  animate = true,
  ...props 
}) => {
  const sizeClasses = {
    sm: 'p-2 text-sm',
    md: 'p-3 text-base',
    lg: 'p-4 text-lg',
    xl: 'p-6 text-xl'
  };

  const gradientClasses = {
    primary: 'bg-gradient-to-br from-blue-500 to-purple-600',
    secondary: 'bg-gradient-to-br from-green-500 to-teal-600',
    danger: 'bg-gradient-to-br from-red-500 to-pink-600',
    warning: 'bg-gradient-to-br from-yellow-500 to-orange-600',
    info: 'bg-gradient-to-br from-cyan-500 to-blue-600',
    success: 'bg-gradient-to-br from-emerald-500 to-green-600'
  };

  return (
    <motion.div
      whileHover={animate ? { scale: 1.1, rotate: 5 } : {}}
      whileTap={animate ? { scale: 0.95 } : {}}
      className={`
        inline-flex items-center justify-center
        rounded-xl shadow-lg
        ${sizeClasses[size]}
        ${gradientClasses[gradient]}
        text-white
        transition-all duration-300 ease-out
        ${className}
      `}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default GradientIconWrap;
