import { create } from "zustand";

interface OnboardingState {
  firstName: string;
  selectedAnimes: string[];
  selectedMoods: string[];
  setFirstName: (name: string) => void;
  toggleAnime: (id: string) => void;
  toggleMood: (id: string) => void;
  reset: () => void;
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
  firstName: "",
  selectedAnimes: [],
  selectedMoods: [],
  setFirstName: (name: string) => set({ firstName: name }),
  toggleAnime: (id: string) =>
    set((state) => ({
      selectedAnimes: state.selectedAnimes.includes(id)
        ? state.selectedAnimes.filter((a) => a !== id)
        : [...state.selectedAnimes, id],
    })),
  toggleMood: (id: string) =>
    set((state) => ({
      selectedMoods: state.selectedMoods.includes(id)
        ? state.selectedMoods.filter((m) => m !== id)
        : [...state.selectedMoods, id],
    })),
  reset: () => set({ firstName: "", selectedAnimes: [], selectedMoods: [] }),
}));
