export interface User {
  id: number;
  email: string;
  name: string;
  profile_pic_url?: string;
  auth_type: 'google'; // Add more auth types as needed
  auth_id?: string; // ID from the auth provider (e.g., Google ID)
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  user: User;
  token: string;
} 