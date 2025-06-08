import type { User } from './user';

export interface GoogleUser {
  id: number;
  google_id: string;
  email: string;
  name: string;
  profile_pic_url: string;
  created_at: string;
  updated_at: string;
}

export interface AuthGoogleResponse {
  user: User;
  token: string;
} 