import http from "./http";

export interface LoginRequest {
  username: string;
  password: string;
}

// 定义API返回的响应结构
export interface LoginResponseData {
  role: string;
  token: string;
}

// 定义axios封装后的响应结构
export interface LoginResponse {
  data: LoginResponseData;
  status: number;
  statusText: string;
  headers: any;
  config: any;
}

export function login(username: string, password: string) {
  return http.post<LoginRequest, LoginResponse>("/auth/login", {
    username,
    password,
  });
}
