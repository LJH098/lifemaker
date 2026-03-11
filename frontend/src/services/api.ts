import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? (import.meta.env.DEV ? "http://localhost:8080/api" : "/api")
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("lifemaker-token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export function extractApiError(error: unknown) {
  if (axios.isAxiosError(error)) {
    return (error.response?.data as { message?: string } | undefined)?.message ?? "요청 처리에 실패했습니다.";
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "알 수 없는 오류가 발생했습니다.";
}
