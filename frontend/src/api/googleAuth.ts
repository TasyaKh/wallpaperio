import api from "./axios";
import type { AuthGoogleResponse } from "../models/authGoogle";

export const googleAuthApi = {
  getGoogleAuthUrl: async () => {
    const response = await api.get<{ auth_url: string }>("/auth/google");
    return response.data.auth_url;
  },

  makeGoogleCollback: async (
    code: string,
    state: string
  ): Promise<AuthGoogleResponse> => {
    const response = await api.get<AuthGoogleResponse>(`/auth/google/callback?code=${code}&state=${state}`);
    return response.data;
  },
};
