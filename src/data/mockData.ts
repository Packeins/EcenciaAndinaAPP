import { Order, Client, Convenio, Product, User, DashboardMetrics, ChartData } from '@/types';

export const mockUsers: User[] = [
  { id: '1', nombre: 'Admin Usuario', email: 'admin@ecencia.com', rol: 'administrador' },
  { id: '2', nombre: 'Cajero Principal', email: 'caja@ecencia.com', rol: 'caja' },
];

export const mockConvenios: Convenio[] = [
  {
    id: '1',
    nombre: 'Convenio TechCorp',
    empresa: 'TechCorp S.A.',
    contacto: 'María González',
    telefono: '+593 987654321',
    email: 'convenios@techcorp.com',
    activo: true,
    colaboradores: ['Carlos Pérez', 'Ana Martínez', 'Luis Fernández', 'Patricia Ruiz'],
    consumoMensual: 1250.00,
  },
  {
    id: '2',
    nombre: 'Convenio BancoNacional',
    empresa: 'Banco Nacional del Ecuador',
    contacto: 'Roberto Sánchez',
    telefono: '+593 912345678',
    email: 'rrhh@banconacional.ec',
    activo: true,
    colaboradores: ['Diana López', 'Eduardo Castro', 'Fernanda Vega'],
    consumoMensual: 890.50,
  },
  {
    id: '3',
    nombre: 'Convenio Seguros Unidos',
    empresa: 'Seguros Unidos CIA. LTDA.',
    contacto: 'Carmen Herrera',
    telefono: '+593 998877665',
    email: 'admin@segurosunidos.com',
    activo: false,
    colaboradores: ['Gabriel Mora'],
    consumoMensual: 0,
  },
];

export const mockClients: Client[] = [
  { id: '1', nombre: 'Carlos Pérez', whatsapp: '+593987654321', tipo: 'convenio', convenioId: '1', activo: true },
  { id: '2', nombre: 'Ana Martínez', whatsapp: '+593987654322', tipo: 'convenio', convenioId: '1', activo: true },
  { id: '3', nombre: 'Diana López', whatsapp: '+593912345678', tipo: 'convenio', convenioId: '2', activo: true },
  { id: '4', nombre: 'Juan Rodríguez', whatsapp: '+593998765432', tipo: 'frecuente', maxAlmuerzos: 5, activo: true },
  { id: '5', nombre: 'Laura Gómez', whatsapp: '+593976543210', tipo: 'frecuente', maxAlmuerzos: 3, activo: true },
  { id: '6', nombre: 'Pedro Morales', whatsapp: '+593965432109', tipo: 'frecuente', maxAlmuerzos: 4, activo: false },
];

export const mockProducts: Product[] = [
  { id: '1', nombre: 'Bebida Gaseosa', precio: 1.50, categoria: 'Bebidas' },
  { id: '2', nombre: 'Jugo Natural', precio: 2.00, categoria: 'Bebidas' },
  { id: '3', nombre: 'Postre del Día', precio: 2.50, categoria: 'Postres' },
  { id: '4', nombre: 'Café Americano', precio: 1.25, categoria: 'Bebidas' },
  { id: '5', nombre: 'Snack Saludable', precio: 1.75, categoria: 'Snacks' },
];

export const mockOrders: Order[] = [
  {
    id: '1',
    clienteId: '1',
    clienteNombre: 'Carlos Pérez',
    whatsapp: '+593987654321',
    tipoCliente: 'convenio',
    convenioNombre: 'TechCorp S.A.',
    almuerzo: 'Almuerzo Ejecutivo',
    cantidad: 1,
    estado: 'reservado',
    productos: [{ productoId: '2', nombre: 'Jugo Natural', cantidad: 1, precio: 2.00 }],
    observaciones: 'Sin cebolla',
    fecha: '2026-01-19',
    hora: '12:30',
  },
  {
    id: '2',
    clienteId: '2',
    clienteNombre: 'Ana Martínez',
    whatsapp: '+593987654322',
    tipoCliente: 'convenio',
    convenioNombre: 'TechCorp S.A.',
    almuerzo: 'Almuerzo Especial',
    cantidad: 2,
    estado: 'reservado',
    productos: [],
    observaciones: '',
    fecha: '2026-01-19',
    hora: '12:45',
  },
  {
    id: '3',
    clienteId: '4',
    clienteNombre: 'Juan Rodríguez',
    whatsapp: '+593998765432',
    tipoCliente: 'frecuente',
    almuerzo: 'Almuerzo del Día',
    cantidad: 1,
    estado: 'consumido',
    productos: [],
    observaciones: 'Vegetariano',
    fecha: '2026-01-19',
    hora: '13:00',
  },
  {
    id: '4',
    clienteId: '3',
    clienteNombre: 'Diana López',
    whatsapp: '+593912345678',
    tipoCliente: 'convenio',
    convenioNombre: 'Banco Nacional del Ecuador',
    almuerzo: 'Almuerzo Ejecutivo',
    cantidad: 1,
    estado: 'reservado',
    productos: [
      { productoId: '1', nombre: 'Bebida Gaseosa', cantidad: 1, precio: 1.50 },
      { productoId: '3', nombre: 'Postre del Día', cantidad: 1, precio: 2.50 },
    ],
    observaciones: '',
    fecha: '2026-01-19',
    hora: '12:15',
  },
  {
    id: '5',
    clienteId: '5',
    clienteNombre: 'Laura Gómez',
    whatsapp: '+593976543210',
    tipoCliente: 'frecuente',
    almuerzo: 'Almuerzo Económico',
    cantidad: 1,
    estado: 'reservado',
    productos: [],
    observaciones: 'Extra arroz',
    fecha: '2026-01-19',
    hora: '13:15',
  },
];

export const mockDashboardMetrics: DashboardMetrics = {
  almuerzosHoy: 47,
  almuerzosMes: 856,
  conveniosActivos: 2,
  clientesFrecuentes: 23,
};

export const mockConsumosPorDia: ChartData[] = [
  { name: 'Lun', value: 42 },
  { name: 'Mar', value: 38 },
  { name: 'Mié', value: 45 },
  { name: 'Jue', value: 51 },
  { name: 'Vie', value: 47 },
  { name: 'Sáb', value: 12 },
  { name: 'Dom', value: 0 },
];

export const mockConsumosPorConvenio: ChartData[] = [
  { name: 'TechCorp S.A.', value: 320 },
  { name: 'Banco Nacional', value: 245 },
  { name: 'Clientes Frecuentes', value: 180 },
  { name: 'Otros', value: 111 },
];
