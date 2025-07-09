import { create } from "zustand";

interface SimilarSearchState {
  targetImg: File | null;
  setTargetImg: (img: File | null) => void;
  targetImageSearchKey: string | null;
  setTargetImageSearchKey: (key: string | null) => void;
}

export const useSimilarSearchStore = create<SimilarSearchState>((set) => ({
  targetImg: null,
  setTargetImg: (img) => set({ targetImg: img }),
  setTargetImageSearchKey: (targetImageSearchKey) => set({ targetImageSearchKey }),
  targetImageSearchKey: null,
}));
