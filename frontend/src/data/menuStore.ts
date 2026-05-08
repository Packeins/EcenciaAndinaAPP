import { useSyncExternalStore } from 'react';

interface MenuState {
  dailyMenu: {
    sopas: string[];
    segundos: string[];
    guarniciones: string[];
    image: string | null;
  };
}

let state: MenuState = {
  dailyMenu: {
    sopas: ['', ''], // Por defecto 2 opciones como pedía el usuario
    segundos: ['', ''],
    guarniciones: [''],
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
  
  setSopas: (sopas: string[]) => {
    state = {
      ...state,
      dailyMenu: { ...state.dailyMenu, sopas },
    };
    emit();
  },

  setSegundos: (segundos: string[]) => {
    state = {
      ...state,
      dailyMenu: { ...state.dailyMenu, segundos },
    };
    emit();
  },

  setGuarniciones: (guarniciones: string[]) => {
    state = {
      ...state,
      dailyMenu: { ...state.dailyMenu, guarniciones },
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
