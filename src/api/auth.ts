
import { api } from "@/lib/apiClient";

interface RegisterData {
  name: string;
  email: string;
  password: string;
}

interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
    role: string;
    bio?: string;
    githubUrl?: string;
    linkedinUrl?: string;
    location?: string;
  };
  token?: string;
}

export async function registerUser(data: RegisterData): Promise<AuthResponse> {
  try {
    const response = await api.register(data.name, data.email, data.password);
    return response;
  } catch (error: any) {
    console.error("Registration error:", error);
    return {
      success: false,
      message: error.message || "Failed to register user",
    };
  }
}

export async function loginUser(data: LoginData): Promise<AuthResponse> {
  try {
    const response = await api.login(data.email, data.password);
    return response;
  } catch (error: any) {
    console.error("Login error:", error);
    return {
      success: false,
      message: error.message || "Login failed",
    };
  }
}

export async function verifyToken(token: string): Promise<boolean> {
  try {
    const response = await api.getCurrentUser();
    return response.success;
  } catch (error) {
    return false;
  }
}
