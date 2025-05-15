import http from "./http";

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: number;
    username: string;
    role: string;
  };
}

export function login(username: string, password: string) {
  return http.post<LoginRequest, LoginResponse>("/auth/login", {
    username,
    password,
  });
}
