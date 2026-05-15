import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import apiService from '../services/api';

const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  loading: true,
  error: null
};

const AUTH_ACTIONS = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  REGISTER_START: 'REGISTER_START',
  REGISTER_SUCCESS: 'REGISTER_SUCCESS',
  REGISTER_FAILURE: 'REGISTER_FAILURE',
  LOAD_USER_START: 'LOAD_USER_START',
  LOAD_USER_SUCCESS: 'LOAD_USER_SUCCESS',
  LOAD_USER_FAILURE: 'LOAD_USER_FAILURE',
  CLEAR_ERROR: 'CLEAR_ERROR',
  UPDATE_PROFILE: 'UPDATE_PROFILE',
  REFRESH_SUCCESS: 'REFRESH_SUCCESS'
};

const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
    case AUTH_ACTIONS.REGISTER_START:
    case AUTH_ACTIONS.LOAD_USER_START:
      return { ...state, loading: true, error: null };

    case AUTH_ACTIONS.LOGIN_SUCCESS:
    case AUTH_ACTIONS.REGISTER_SUCCESS:
    case AUTH_ACTIONS.LOAD_USER_SUCCESS:
      return {
        ...state,
        loading: false,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        error: null
      };

    case AUTH_ACTIONS.REFRESH_SUCCESS:
      return {
        ...state,
        loading: false,
        isAuthenticated: true,
        token: action.payload.token,
        error: null
      };

    case AUTH_ACTIONS.LOGIN_FAILURE:
    case AUTH_ACTIONS.REGISTER_FAILURE:
    case AUTH_ACTIONS.LOAD_USER_FAILURE:
      return { ...state, loading: false, isAuthenticated: false, user: null, token: null, error: action.payload };

    case AUTH_ACTIONS.LOGOUT:
      return { ...state, loading: false, isAuthenticated: false, user: null, token: null, error: null };

    case AUTH_ACTIONS.UPDATE_PROFILE:
      return { ...state, user: { ...state.user, ...action.payload } };

    case AUTH_ACTIONS.CLEAR_ERROR:
      return { ...state, error: null };

    default:
      return state;
  }
};

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const persistToken = useCallback((token) => {
    if (token) localStorage.setItem('token', token);
    else localStorage.removeItem('token');
  }, []);

  // Load user on app start: prefer access token, else let interceptor refresh
  useEffect(() => {
    const bootstrap = async () => {
      dispatch({ type: AUTH_ACTIONS.LOAD_USER_START });

      try {
        const token = localStorage.getItem('token');
        if (!token) {
          dispatch({ type: AUTH_ACTIONS.LOAD_USER_SUCCESS, payload: { user: null, token: null } });
          return;
        }

        const res = await apiService.auth.getMe();
        persistToken(token);

        dispatch({
          type: AUTH_ACTIONS.LOAD_USER_SUCCESS,
          payload: { user: res.data.data, token }
        });
      } catch (err) {
        // interceptor may have refreshed already; attempt once more by calling /me without assuming token
        try {
          const res2 = await apiService.auth.getMe();
          const newToken = localStorage.getItem('token');
          dispatch({
            type: AUTH_ACTIONS.LOAD_USER_SUCCESS,
            payload: { user: res2.data.data, token: newToken }
          });
        } catch {
          persistToken(null);
          dispatch({
            type: AUTH_ACTIONS.LOAD_USER_FAILURE,
            payload: err?.response?.data?.message || 'Failed to load user'
          });
        }
      }
    };

    bootstrap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (email, password) => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START });
    const response = await apiService.auth.login({ email, password });

    const token = response.data.data.token;
    persistToken(token);

    dispatch({
      type: AUTH_ACTIONS.LOGIN_SUCCESS,
      payload: { user: response.data.data, token }
    });

    return response.data.data;
  };

  const logout = () => {
    persistToken(null);
    dispatch({ type: AUTH_ACTIONS.LOGOUT });
  };

  const register = async (name, email, password) => {
    dispatch({ type: AUTH_ACTIONS.REGISTER_START });
    const response = await apiService.auth.register({ name, email, password });

    dispatch({
      type: AUTH_ACTIONS.REGISTER_SUCCESS,
      payload: { user: response.data.data, token: response.data.data?.token }
    });

    return response.data.data;
  };

  const updateProfile = async (profileData) => {
    dispatch({ type: AUTH_ACTIONS.UPDATE_PROFILE, payload: profileData });
    const res = await apiService.auth.updateProfile(profileData);

    dispatch({
      type: AUTH_ACTIONS.UPDATE_PROFILE,
      payload: res.data.data
    });

    return res.data.data;
  };

  const clearError = () => dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });

  return (
    <AuthContext.Provider
      value={{
        ...state,
        user: state.user,
        token: state.token,
        login,
        logout,
        register,
        updateProfile,
        clearError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
