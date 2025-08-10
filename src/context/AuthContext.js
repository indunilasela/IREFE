import React, { createContext, useContext, useReducer, useEffect } from 'react';
import authService from '../services/authService';
import PublicApiService from '../services/publicApi';

const AuthContext = createContext();

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
        error: null
      };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null
      };
    case 'AUTH_ERROR':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload
      };
    case 'LOGOUT':
      return {
        ...initialState,
        isLoading: false
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: { ...state.user, ...action.payload }
      };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      if (token && storedUser) {
        try {
          const user = JSON.parse(storedUser);
          
          // Check if token is still valid
          if (user.role === 'PublicUser') {
            // For PublicUser, verify token with PublicApiService
            if (PublicApiService.isAuthenticated()) {
              dispatch({
                type: 'AUTH_SUCCESS',
                payload: { user, token }
              });
            } else {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              dispatch({ type: 'AUTH_ERROR', payload: null });
            }
          } else {
            // For admin users, verify with authService
            const profileUser = await authService.getProfile();
            dispatch({
              type: 'AUTH_SUCCESS',
              payload: { user: profileUser, token }
            });
          }
        } catch (error) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          dispatch({ type: 'AUTH_ERROR', payload: error.message });
        }
      } else {
        dispatch({ type: 'AUTH_ERROR', payload: null });
      }
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    try {
      dispatch({ type: 'AUTH_START' });
      
      let response;
      try {
        // Try PublicUser login first
        console.log('Attempting PublicUser login...');
        response = await PublicApiService.login(email, password);
        console.log('PublicUser login response:', response);
        
        if (response.success) {
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('user', JSON.stringify(response.data.user));
          
          dispatch({
            type: 'AUTH_SUCCESS',
            payload: {
              user: response.data.user,
              token: response.data.token
            }
          });

          return response;
        }
      } catch (publicError) {
        console.log('PublicUser login failed, trying admin login...', publicError.message);
        
        // If it's a rate limiting error, don't try admin login
        if (publicError.message.includes('Too many')) {
          throw publicError;
        }
        
        // Add a small delay before trying admin login to avoid rapid requests
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // If PublicUser login fails, try admin login
        try {
          console.log('Attempting admin login...');
          response = await authService.login(email, password);
          console.log('Admin login response:', response);
          
          localStorage.setItem('token', response.token);
          localStorage.setItem('user', JSON.stringify(response.user));
          
          dispatch({
            type: 'AUTH_SUCCESS',
            payload: {
              user: response.user,
              token: response.token
            }
          });

          return response;
        } catch (adminError) {
          console.error('Admin login error:', adminError);
          
          // If admin login also has rate limiting, throw that error
          if (adminError.message.includes('Too many')) {
            throw adminError;
          }
          
          // Both login attempts failed
          throw new Error('Invalid email or password');
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      dispatch({ type: 'AUTH_ERROR', payload: error.message });
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      dispatch({ type: 'AUTH_START' });
      const response = await authService.register(userData);
      dispatch({ type: 'CLEAR_ERROR' });
      return response;
    } catch (error) {
      dispatch({ type: 'AUTH_ERROR', payload: error.message });
      throw error;
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      await authService.changePassword(currentPassword, newPassword);
      dispatch({
        type: 'UPDATE_USER',
        payload: { isFirstLogin: false }
      });
    } catch (error) {
      dispatch({ type: 'AUTH_ERROR', payload: error.message });
      throw error;
    }
  };

  const forgotPassword = async (email) => {
    try {
      await authService.forgotPassword(email);
      dispatch({ type: 'CLEAR_ERROR' });
    } catch (error) {
      dispatch({ type: 'AUTH_ERROR', payload: error.message });
      throw error;
    }
  };

  const resetPassword = async (token, newPassword) => {
    try {
      await authService.resetPassword(token, newPassword);
      dispatch({ type: 'CLEAR_ERROR' });
    } catch (error) {
      dispatch({ type: 'AUTH_ERROR', payload: error.message });
      throw error;
    }
  };

  const logout = async () => {
    try {
      const user = state.user;
      if (user?.role === 'PublicUser') {
        // For PublicUser, just clear local storage
        PublicApiService.removeToken();
      } else {
        // For admin users, call logout API
        await authService.logout();
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      dispatch({ type: 'LOGOUT' });
    }
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value = {
    ...state,
    login,
    register,
    changePassword,
    forgotPassword,
    resetPassword,
    logout,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;