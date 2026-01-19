// User roles
export type UserRole = 'administrador' | 'caja';

// Order states
export type OrderState = 'reservado' | 'consumido';

// Client types
export type ClientType = 'convenio' | 'frecuente';

export interface User {
  id: string;
  nombre: string;
  email: string;
  rol: UserRole;
}

export interface Client {
  id: string;
  nombre: string;
  whatsapp: string;
  tipo: ClientType;
  convenioId?: string;
  maxAlmuerzos?: number;
  activo: boolean;
}

export interface Convenio {
  id: string;
  nombre: string;
  empresa: string;
  contacto: string;
  telefono: string;
  email: string;
  activo: boolean;
  colaboradores: string[];
  consumoMensual: number;
}

export interface Product {
  id: string;
  nombre: string;
  precio: number;
  categoria: string;
}

export interface OrderProduct {
  productoId: string;
  nombre: string;
  cantidad: number;
  precio: number;
}

export interface Order {
  id: string;
  clienteId: string;
  clienteNombre: string;
  whatsapp: string;
  tipoCliente: ClientType;
  convenioNombre?: string;
  almuerzo: string;
  cantidad: number;
  estado: OrderState;
  productos: OrderProduct[];
  observaciones: string;
  fecha: string;
  hora: string;
}

export interface Consumption {
  id: string;
  pedidoId: string;
  clienteId: string;
  convenioId?: string;
  cantidad: number;
  total: number;
  fecha: string;
}

export interface DashboardMetrics {
  almuerzosHoy: number;
  almuerzosMes: number;
  conveniosActivos: number;
  clientesFrecuentes: number;
}

export interface ChartData {
  name: string;
  value: number;
}
