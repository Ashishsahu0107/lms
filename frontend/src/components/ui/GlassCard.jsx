import React from 'react';
import { motion } from 'framer-motion';

const GlassCard = ({ 
  children, 
  className = '', 
  hover = true,
  delay = 0,
  ...props 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={hover ? { 
        y: -2, 
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)' 
      } : {}}
      className={`
        relative backdrop-blur-xl bg-white/80 dark:bg-gray-900/80
        border border-gray-200/50 dark:border-gray-700/50
        rounded-2xl shadow-lg
        transition-all duration-300 ease-out
        ${hover ? 'hover:shadow-2xl hover:bg-white/90 dark:hover:bg-gray-900/90' : ''}
        ${className}
      `}
      {...props}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent dark:from-white/5 rounded-2xl pointer-events-none" />
      {children}
    </motion.div>
  );
};

export default GlassCard;
