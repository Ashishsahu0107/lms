import { apiGet, apiPost } from "./apiClient";

export async function login(payload) {
  const res = await apiPost("/auth/login", payload);
  if (res.token) {
    localStorage.setItem("token", res.token);
    localStorage.setItem("user", JSON.stringify(res.user));
  }
  return res;
}

export async function register(payload) {
  const res = await apiPost("/auth/register", payload);
  if (res.token) {
    localStorage.setItem("token", res.token);
    localStorage.setItem("user", JSON.stringify(res.user));
  }
  return res;
}

export async function getMe() {
  return apiGet("/auth/me");
}

export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

export function getStoredUser() {
  try {
    const token = localStorage.getItem("token");
    if (!token) return null;
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
}

export function getStoredToken() {
  return localStorage.getItem("token");
}

export async function sendOtp(email) {
  return apiPost("/auth/send-otp", { email });
}

export async function verifyOtp(email, otp) {
  return apiPost("/auth/verify-otp", { email, otp });
}

export async function forgotPassword(email) {
  return apiPost("/auth/forgot-password", { email });
}

export async function resetPassword(email, otp, newPassword) {
  return apiPost("/auth/reset-password", { email, otp, newPassword });
}