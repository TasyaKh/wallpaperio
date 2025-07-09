import { create } from "zustand";

interface SimilarSearchState {
  targetImageSearchKey: string | null;
  setTargetImageSearchKey: (key: string | null) => void;
}

export const useSimilarSearchStore = create<SimilarSearchState>((set) => ({
  setTargetImageSearchKey: (targetImageSearchKey) => set({ targetImageSearchKey }),
  targetImageSearchKey: null,
}));
