import { useSyncExternalStore } from 'react';
import { TipoAlmuerzo } from '@/types';
import { tiposAlmuerzo as initialTipos, platosFuertes as initialPlatos, sopas as initialSopas } from '@/data/mockData';

export interface TipoAlmuerzoItem {
  value: TipoAlmuerzo;
  label: string;
  precio: number;
}

interface MenuState {
  tipos: TipoAlmuerzoItem[];
  platos: string[];
  sopas: string[];
}

let state: MenuState = {
  tipos: [...initialTipos],
  platos: [...initialPlatos],
  sopas: [...initialSopas],
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
  setTipoPrecio: (value: TipoAlmuerzo, precio: number) => {
    state = {
      ...state,
      tipos: state.tipos.map((t) => (t.value === value ? { ...t, precio } : t)),
    };
    emit();
  },
  setTipoLabel: (value: TipoAlmuerzo, label: string) => {
    state = {
      ...state,
      tipos: state.tipos.map((t) => (t.value === value ? { ...t, label } : t)),
    };
    emit();
  },
  setPlato: (index: number, value: string) => {
    state = {
      ...state,
      platos: state.platos.map((p, i) => (i === index ? value : p)),
    };
    emit();
  },
  setSopa: (index: number, value: string) => {
    state = {
      ...state,
      sopas: state.sopas.map((s, i) => (i === index ? value : s)),
    };
    emit();
  },
  addPlato: (value: string) => {
    state = { ...state, platos: [...state.platos, value] };
    emit();
  },
  addSopa: (value: string) => {
    state = { ...state, sopas: [...state.sopas, value] };
    emit();
  },
  removePlato: (index: number) => {
    state = { ...state, platos: state.platos.filter((_, i) => i !== index) };
    emit();
  },
  removeSopa: (index: number) => {
    state = { ...state, sopas: state.sopas.filter((_, i) => i !== index) };
    emit();
  },
};

export function useMenu() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
