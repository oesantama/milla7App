/**
 * Utilidades de validación para formularios
 */

// Validar email
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validar teléfono (Colombia)
export const isValidPhone = (phone) => {
  const phoneRegex = /^(\+57)?[0-9]{10}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

// Validar NIT (Colombia)
export const isValidNIT = (nit) => {
  const nitRegex = /^[0-9]{9}-[0-9]$/;
  return nitRegex.test(nit);
};

// Validar URL
export const isValidURL = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Validar contraseña fuerte
export const isStrongPassword = (password) => {
  // Mínimo 8 caracteres, 1 mayúscula, 1 minúscula, 1 número
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return regex.test(password);
};

// Validar rango de edad
export const isValidAge = (age, min = 18, max = 100) => {
  const numAge = parseInt(age);
  return !isNaN(numAge) && numAge >= min && numAge <= max;
};

// Validar archivo
export const isValidFile = (file, maxSizeMB = 10, allowedTypes = []) => {
  const maxSize = maxSizeMB * 1024 * 1024;
  
  if (file.size > maxSize) {
    return { valid: false, error: `Archivo muy grande. Máximo ${maxSizeMB}MB` };
  }
  
  if (allowedTypes.length > 0) {
    const fileExt = '.' + file.name.split('.').pop().toLowerCase();
    if (!allowedTypes.includes(fileExt)) {
      return { valid: false, error: `Tipo no permitido. Solo: ${allowedTypes.join(', ')}` };
    }
  }
  
  return { valid: true };
};

// Validar campos requeridos
export const validateRequired = (fields, data) => {
  const errors = {};
  
  fields.forEach(field => {
    if (!data[field] || data[field].toString().trim() === '') {
      errors[field] = 'Este campo es requerido';
    }
  });
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// Validar formulario completo
export const validateForm = (data, rules) => {
  const errors = {};
  
  Object.keys(rules).forEach(field => {
    const value = data[field];
    const fieldRules = rules[field];
    
    // Required
    if (fieldRules.required && (!value || value.toString().trim() === '')) {
      errors[field] = fieldRules.requiredMessage || 'Campo requerido';
      return;
    }
    
    // Skip si está vacío y no es requerido
    if (!value) return;
    
    // Email
    if (fieldRules.email && !isValidEmail(value)) {
      errors[field] = 'Email inválido';
    }
    
    // Min length
    if (fieldRules.minLength && value.length < fieldRules.minLength) {
      errors[field] = `Mínimo ${fieldRules.minLength} caracteres`;
    }
    
    // Max length
    if (fieldRules.maxLength && value.length > fieldRules.maxLength) {
      errors[field] = `Máximo ${fieldRules.maxLength} caracteres`;
    }
    
    // Pattern
    if (fieldRules.pattern && !fieldRules.pattern.test(value)) {
      errors[field] = fieldRules.patternMessage || 'Formato inválido';
    }
    
    // Custom validation
    if (fieldRules.custom) {
      const customError = fieldRules.custom(value, data);
      if (customError) {
        errors[field] = customError;
      }
    }
  });
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// Ejemplo de uso:
/*
const rules = {
  email: {
    required: true,
    email: true,
  },
  password: {
    required: true,
    minLength: 8,
    custom: (value) => {
      if (!isStrongPassword(value)) {
        return 'Contraseña débil. Debe tener mayúsculas, minúsculas y números';
      }
    },
  },
  confirmPassword: {
    required: true,
    custom: (value, allData) => {
      if (value !== allData.password) {
        return 'Las contraseñas no coinciden';
      }
    },
  },
};

const { isValid, errors } = validateForm(formData, rules);
*/
