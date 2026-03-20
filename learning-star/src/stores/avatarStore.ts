import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type AvatarId = 'cat' | 'dog' | 'unicorn' | 'rabbit' | 'fox' | 'bear' | 'penguin' | 'dragon' | 'owl' | 'frog';

interface AvatarState {
  selectedAvatar: AvatarId;
  setAvatar: (id: AvatarId) => void;
}

export const useAvatarStore = create<AvatarState>()(
  persist(
    (set) => ({
      selectedAvatar: 'cat',
      setAvatar: (id) => set({ selectedAvatar: id }),
    }),
    { name: 'avatar-selection' }
  )
);
