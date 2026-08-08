import api from "../utils/axios";

export const register = (data) =>
  api.post("/auth/register", data);

export const setPassword = (data) =>
  api.post("/auth/set-password", data);

export const login = (data) =>
  api.post("/auth/login", data);

export const forgotPassword = (data) =>
  api.post("/auth/forgot-password", data);

export const resetPassword = (data) =>
  api.post("/auth/reset-password", data);