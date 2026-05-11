import React from 'react';
import { motion } from 'framer-motion';

const LoadingSkeleton = ({ 
  className = '', 
  variant = 'default',
  lines = 1,
  ...props 
}) => {
  const variants = {
    default: 'h-4 w-full',
    text: 'h-4 w-full',
    title: 'h-8 w-3/4',
    avatar: 'h-10 w-10 rounded-full',
    button: 'h-10 w-24 rounded-lg',
    card: 'h-32 w-full rounded-xl',
    image: 'h-48 w-full rounded-xl',
    circle: 'h-12 w-12 rounded-full',
    rectangle: 'h-20 w-full rounded-lg'
  };

  const baseClasses = variants[variant] || variants.default;

  return (
    <motion.div
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{ 
        duration: 1.5, 
        repeat: Infinity, 
        ease: "easeInOut" 
      }}
      className={`
        bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200
        dark:from-gray-700 dark:via-gray-600 dark:to-gray-700
        bg-[length:200%_100%]
        ${baseClasses}
        ${className}
      `}
      style={{
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s infinite'
      }}
      {...props}
    />
  );
};

const CardSkeleton = ({ className = '' }) => (
  <div className={`p-6 space-y-4 ${className}`}>
    <LoadingSkeleton variant="image" />
    <LoadingSkeleton variant="title" />
    <LoadingSkeleton lines={2} />
    <div className="flex justify-between items-center">
      <LoadingSkeleton variant="button" />
      <LoadingSkeleton variant="circle" />
    </div>
  </div>
);

const TableSkeleton = ({ rows = 5, columns = 4, className = '' }) => (
  <div className={`space-y-3 ${className}`}>
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex space-x-4">
        {Array.from({ length: columns }).map((_, j) => (
          <LoadingSkeleton 
            key={j} 
            variant="default" 
            className="flex-1" 
          />
        ))}
      </div>
    ))}
  </div>
);

const DashboardSkeleton = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <LoadingSkeleton variant="card" className="h-80" />
      <LoadingSkeleton variant="card" className="h-80" />
    </div>
  </div>
);

LoadingSkeleton.Card = CardSkeleton;
LoadingSkeleton.Table = TableSkeleton;
LoadingSkeleton.Dashboard = DashboardSkeleton;

export default LoadingSkeleton;
