import { useSyncExternalStore } from 'react';

export interface DailyMenuOption {
  sopa: string;
  segundo: string;
}

interface MenuState {
  dailyMenu: {
    opcion1: DailyMenuOption;
    opcion2: DailyMenuOption;
    image: string | null;
  };
}

let state: MenuState = {
  dailyMenu: {
    opcion1: { sopa: '', segundo: '' },
    opcion2: { sopa: '', segundo: '' },
    image: null,
  },
};

const listeners = new Set<() => void>();

const emit = () => listeners.forEach((l) => l());

const subscribe = (cb: () => void) => {
  listeners.add(cb);
  return () => listeners.delete(cb);
};

const getSnapshot = () => state;

export const menuStore = {
  get: () => state,
  setDailyOption1: (option: Partial<DailyMenuOption>) => {
    state = {
      ...state,
      dailyMenu: {
        ...state.dailyMenu,
        opcion1: { ...state.dailyMenu.opcion1, ...option },
      },
    };
    emit();
  },
  setDailyOption2: (option: Partial<DailyMenuOption>) => {
    state = {
      ...state,
      dailyMenu: {
        ...state.dailyMenu,
        opcion2: { ...state.dailyMenu.opcion2, ...option },
      },
    };
    emit();
  },
  setDailyImage: (image: string | null) => {
    state = {
      ...state,
      dailyMenu: { ...state.dailyMenu, image },
    };
    emit();
  },
};

export function useMenu() {
  const currentState = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return {
    ...currentState,
    ...currentState.dailyMenu,
  };
}
