export const USER_ROLES = {
  ADMIN: 'Admin',
  DIA: 'DIA',
  DA: 'DA',
  EA: 'EA',
  FA: 'FA',
  IRRIGATOR: 'Irrigator',
  FARMER: 'Farmer',
  EXTERNAL_FARMER: 'ExternalFarmer'
};

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    CHANGE_PASSWORD: '/auth/change-password',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    PROFILE: '/auth/profile'
  }
};

export const VALIDATION_MESSAGES = {
  REQUIRED: 'This field is required',
  EMAIL_INVALID: 'Please enter a valid email address',
  PASSWORD_MIN_LENGTH: 'Password must be at least 6 characters',
  PASSWORDS_MATCH: 'Passwords must match',
  PHONE_INVALID: 'Please enter a valid phone number'
};