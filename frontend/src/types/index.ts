// User roles
export type UserRole = 'administrador' | 'caja';

// Order states
export type OrderState = 'reservado' | 'consumido';

// Client types
export type ClientType = 'convenio' | 'cliente';

// Lunch types
export type TipoAlmuerzo = 'normal' | 'vip' | 'ejecutivo';

export interface User {
  id: string;
  nombre: string;
  apellido?: string;
  nombre_usuario?: string;
  email: string;
  rol: UserRole;
}

export interface Client {
  id: string;
  cedula: string;
  nombre: string;
  apellido: string;
  telefono: string;
  activo: boolean;
  id_tipo_cliente?: number;
  tipo_nombre?: string;
}

export interface Convenio {
  id: string;
  ruc: string;
  nombre_empresa: string;
  representante: string;
  telefono: string;
  email: string;
  fecha_inicio: string;
  fecha_caducidad: string;
  activo: boolean;
  totalColaboradores: number;
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
  tipoAlmuerzo: TipoAlmuerzo;
  platoFuerte: string;
  sopa: string;
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
