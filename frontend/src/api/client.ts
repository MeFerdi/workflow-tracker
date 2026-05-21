import axios from "axios";

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
  withCredentials: false,
});

export default client;

export function getApiErrorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    const detail = error.response?.data?.detail;

    if (typeof detail === "string") {
      return detail;
    }

    if (Array.isArray(detail)) {
      return detail
        .map((item) => item?.msg)
        .filter((message): message is string => typeof message === "string")
        .join(" ");
    }

    if (error.code === "ECONNABORTED") {
      return "The request timed out. Please try again.";
    }
  }

  return "Something went wrong. Please try again.";
}
