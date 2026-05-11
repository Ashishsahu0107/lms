import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { GlassCard, SaaSButton } from '../ui';

const Form = ({
  children,
  onSubmit,
  initialValues = {},
  validationSchema = {},
  className = '',
  submitText = 'Submit',
  loading = false,
  disabled = false,
  resetOnSubmit = false,
  ...props
}) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validateField = useCallback((name, value) => {
    const rules = validationSchema[name];
    if (!rules) return '';

    for (const rule of rules) {
      if (rule.required && (!value || value.toString().trim() === '')) {
        return rule.message || `${name} is required`;
      }
      
      if (rule.minLength && value.length < rule.minLength) {
        return rule.message || `${name} must be at least ${rule.minLength} characters`;
      }
      
      if (rule.maxLength && value.length > rule.maxLength) {
        return rule.message || `${name} must be no more than ${rule.maxLength} characters`;
      }
      
      if (rule.pattern && !rule.pattern.test(value)) {
        return rule.message || `${name} is invalid`;
      }
      
      if (rule.custom && !rule.custom(value)) {
        return rule.message || `${name} is invalid`;
      }
    }

    return '';
  }, [validationSchema]);

  const validateForm = useCallback(() => {
    const newErrors = {};
    let isValid = true;

    Object.keys(validationSchema).forEach(name => {
      const error = validateField(name, values[name]);
      if (error) {
        newErrors[name] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [values, validationSchema, validateField]);

  const handleChange = useCallback((name, value) => {
    setValues(prev => ({ ...prev, [name]: value }));
    
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  }, [touched, validateField]);

  const handleBlur = useCallback((name) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, values[name]);
    setErrors(prev => ({ ...prev, [name]: error }));
  }, [values, validateField]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const isValid = validateForm();
    if (!isValid) return;

    try {
      await onSubmit(values);
      
      if (resetOnSubmit) {
        setValues(initialValues);
        setErrors({});
        setTouched({});
      }
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  const getFieldProps = useCallback((name) => ({
    value: values[name] || '',
    error: touched[name] ? errors[name] : '',
    onChange: (value) => handleChange(name, value),
    onBlur: () => handleBlur(name),
    required: validationSchema[name]?.some(rule => rule.required) || false
  }), [values, errors, touched, handleChange, handleBlur, validationSchema]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={className}
      {...props}
    >
      <GlassCard className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {typeof children === 'function' 
            ? children({ values, errors, getFieldProps })
            : children
          }
          
          <div className="flex gap-3 pt-4">
            <SaaSButton
              type="submit"
              variant="primary"
              loading={loading}
              disabled={disabled || loading}
              className="flex-1"
            >
              {submitText}
            </SaaSButton>
            
            {resetOnSubmit && (
              <SaaSButton
                type="button"
                variant="outline"
                onClick={resetForm}
                disabled={loading}
              >
                Reset
              </SaaSButton>
            )}
          </div>
        </form>
      </GlassCard>
    </motion.div>
  );
};

// Form validation helpers
Form.validation = {
  required: (message) => ({ required: true, message }),
  minLength: (min, message) => ({ minLength: min, message }),
  maxLength: (max, message) => ({ maxLength: max, message }),
  pattern: (regex, message) => ({ pattern: regex, message }),
  custom: (fn, message) => ({ custom: fn, message }),
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Please enter a valid email address'
  },
  password: {
    minLength: 8,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    message: 'Password must be at least 8 characters with uppercase, lowercase, and number'
  }
};

export default Form;
