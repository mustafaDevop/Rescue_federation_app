import axios from "axios";
import { baseURL } from "../constants/API";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ApiErrorBus } from "./errorBus";


export interface AuthResponse {
  user: {
    googleAuth: any;
    _id: string;
    fullName: string;
    email: string;
    phoneNumber: string;
    expoPushToken: string | null;
    lastLogin: string;
    createdAt: string;
    updatedAt: string;
  };
  tokens: {
    access: {
      token: string;
      expires: string;
    };
    refresh: {
      token: string;
      expires: string;
    };
  };
}


const API = axios.create({
  baseURL: baseURL.API,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Attach token from AsyncStorage on every request
API.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ============ STANDARDIZED ERROR HANDLING ============ //
export type ApiErrorCode = number | "NETWORK_ERROR" | "TIMEOUT" | "UNKNOWN";

export class ApiError extends Error {
  code: ApiErrorCode;
  status?: number;
  details?: any;
  constructor(
    message: string,
    code: ApiErrorCode,
    status?: number,
    details?: any
  ) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

const extractServerMessage = (data: any): string | undefined => {
  if (!data) return undefined;
  if (typeof data === "string") return data;
  return (
    data.message ||
    data.error ||
    (Array.isArray(data.errors) && data.errors[0]?.message) ||
    (typeof data.errors === "object" &&
      (Object.values(data.errors)[0] as any)) ||
    undefined
  );
};

const normalizeAxiosError = (error: any): ApiError => {
  if (axios.isCancel(error)) {
    return new ApiError("Request cancelled", "UNKNOWN");
  }

  if (error?.code === "ECONNABORTED") {
    return new ApiError("Request timed out", "TIMEOUT");
  }

  const response = error?.response;
  if (!response) {
    return new ApiError(
      "Network error. Check your internet connection.",
      "NETWORK_ERROR"
    );
  }

  const { status, data } = response;
  const serverMessage = extractServerMessage(data);

  switch (status) {
    case 400:
    case 422:
      return new ApiError(
        serverMessage || "Bad request. Please check the input.",
        400,
        status,
        data
      );
    case 404:
      return new ApiError(
        serverMessage || "Resource not found.",
        404,
        status,
        data
      );
    case 500:
      return new ApiError(
        serverMessage || "Server error. Please try again.",
        500,
        status,
        data
      );
    default:
      return new ApiError(
        serverMessage || "Unexpected error occurred.",
        status || "UNKNOWN",
        status,
        data
      );
  }
};

API.interceptors.response.use(
  (response) => response,
  (error) => {
    const normalized = normalizeAxiosError(error);
    ApiErrorBus.emit(normalized);
    return Promise.reject(normalized);
  }
);

export const isApiError = (err: unknown): err is ApiError =>
  err instanceof ApiError;
export const getErrorMessage = (
  err: unknown,
  fallback = "Something went wrong. Please try again."
): string => {
  if (err instanceof ApiError) return err.message;
  if (err && typeof err === "object" && (err as any).message)
    return (err as any).message as string;
  return fallback;
};

// Helper to store token after login/register
const handleAuthSuccess = async (res: any): Promise<AuthResponse> => {
  const authData = res.data as AuthResponse;
  await AsyncStorage.setItem("token", authData.tokens.access.token);
    await AsyncStorage.setItem('userId', authData.user._id);
  return authData;
};

//register

export const registerCustomer = async (data: any) => {
  const res = await API.post("/v1.0/auth/register/customer", {
    ...data,
  });
  return handleAuthSuccess(res);
};

export const registerAdmin = async (data: any) => {
  const res = await API.post("/v1.0/auth/register/admin", {
    ...data,
  });
  return handleAuthSuccess(res);
};

export const loginCustomer = async (data: any) => {

  const res = await API.post("/v1.0/auth/login/customer", {
    ...data,
  });
  return handleAuthSuccess(res);
};

export const loginAdmin = async (data: any) => {
  const res = await API.post("/v1.0/auth/login/admin", {
    ...data,
  });
  return handleAuthSuccess(res);
};


// ============ REQUEST API FUNCTIONS ============ //

// Create new service request
export const createRequest = async (data: {
  name: string;
  serviceType: string;
  location: string;
  time: string;
}) => {
  const res = await API.post("/v1.0/request", data);

  return res.data;
};

// Get all requests for logged-in user
export const getUserRequests = async () => {
  const res = await API.get("/v1.0/request");
  return res.data.data.requests;
};

// Filter requests with query parameters
export const getFilteredRequests = async (filters: {
  status?: string;
  serviceType?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: string;
}) => {
  const res = await API.get("/v1.0/request/filter", { params: filters });

  return res.data;
};

// Update request status
export const updateRequestStatus = async (requestId: string, status: string) => {
  const res = await API.patch(`/v1.0/request/${requestId}/status`, { status });
  return res.data;
};