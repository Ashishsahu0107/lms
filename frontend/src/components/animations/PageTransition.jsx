import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
    scale: 0.98
  },
  in: {
    opacity: 1,
    y: 0,
    scale: 1
  },
  out: {
    opacity: 0,
    y: -20,
    scale: 0.98
  }
};

const pageTransition = {
  type: 'tween',
  ease: 'anticipate',
  duration: 0.4
};

const PageTransition = ({ 
  children, 
  variant = 'default',
  className = '',
  ...props 
}) => {
  const variants = {
    default: pageVariants,
    slideUp: {
      initial: { opacity: 0, y: 50 },
      in: { opacity: 1, y: 0 },
      out: { opacity: 0, y: -50 }
    },
    slideDown: {
      initial: { opacity: 0, y: -50 },
      in: { opacity: 1, y: 0 },
      out: { opacity: 0, y: 50 }
    },
    slideLeft: {
      initial: { opacity: 0, x: 50 },
      in: { opacity: 1, x: 0 },
      out: { opacity: 0, x: -50 }
    },
    slideRight: {
      initial: { opacity: 0, x: -50 },
      in: { opacity: 1, x: 0 },
      out: { opacity: 0, x: 50 }
    },
    scale: {
      initial: { opacity: 0, scale: 0.8 },
      in: { opacity: 1, scale: 1 },
      out: { opacity: 0, scale: 0.8 }
    },
    fade: {
      initial: { opacity: 0 },
      in: { opacity: 1 },
      out: { opacity: 0 }
    }
  };

  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={variants[variant]}
      transition={pageTransition}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
};

// Stagger children animation
export const StaggerContainer = ({ 
  children, 
  staggerDelay = 0.1, 
  className = '',
  ...props 
}) => {
  const containerVariants = {
    initial: { opacity: 0 },
    in: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay
      }
    },
    out: { opacity: 0 }
  };

  const itemVariants = {
    initial: { opacity: 0, y: 20 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -20 }
  };

  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={containerVariants}
      className={className}
      {...props}
    >
      {React.Children.map(children, (child, index) => (
        <motion.div key={index} variants={itemVariants}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
};

// Animated list item
export const AnimatedListItem = ({ 
  children, 
  delay = 0, 
  className = '',
  ...props 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ 
        duration: 0.3, 
        delay,
        type: 'spring',
        stiffness: 400,
        damping: 30
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
};

// Layout animation for reordering
export const LayoutGroup = ({ children, className = '', ...props }) => {
  return (
    <motion.div
      layout
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;
