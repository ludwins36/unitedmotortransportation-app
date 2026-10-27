// Definimos qué esperamos recibir de WordPress
export interface User {
  id: number;
  username: string;
  email: string;
  display_name: string;
  roles?: string[]; // Array de roles, ej: ['administrator', 'subscriber', 'driver']
  avatar_url?: string;
  phone?: string;
  company?: string;
}

export interface AuthResponse {
  token: string;
  user_email?: string;
  user_nicename?: string;
  user_display_name?: string;
  id?: number;
  user_id?: number;
}

export interface ApiError {
  code: string;
  message: string;
  data: {
    status: number;
  };
}
