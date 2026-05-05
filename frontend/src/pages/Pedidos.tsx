import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Order, OrderState } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge';
import { Badge } from '@/components/ui/badge';
import { EditOrderDialog } from '@/components/orders/EditOrderDialog';
import { NewOrderDialog } from '@/components/orders/NewOrderDialog';
import { Pencil, CheckCircle, Phone, Search, MessageCircle, Plus, User, XCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function Pedidos() {
  const { user } = useAuth();
  const isAdmin = user?.rol === 'administrador';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterEstado, setFilterEstado] = useState<string>('all');
  const [filterTipo, setFilterTipo] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [editingOrder, setEditingOrder] = useState<any | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newOrderOpen, setNewOrderOpen] = useState(false);

  const fetchOrders = async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    try {
      const response = await apiFetch('/ordenes');
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      } else {
        toast.error('Error al cargar pedidos');
      }
    } catch (err) {
      toast.error('Error de conexión');
    } finally {
      if (showLoading) setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = orders.filter((order) => {
    const estadoNombre = order.estados_orden?.nombre_estado?.toLowerCase() || 'reservado';
    const matchEstado = filterEstado === 'all' || estadoNombre === filterEstado;
    const tipoClienteReal = order.clientes?.tipos_cliente?.nombre_tipo?.toLowerCase().includes('convenio') ? 'convenio' : 'cliente';
    const matchTipo = filterTipo === 'all' || tipoClienteReal === filterTipo;
    const matchSearch =
      (order.clientes?.nombre + ' ' + order.clientes?.apellido).toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.clientes?.telefono || '').includes(searchTerm);
    return matchEstado && matchTipo && matchSearch;
  });

  const sortedOrders = [...filteredOrders].sort((a, b) => {
    const aIsReservado = a.id_estado === 1 || !a.id_estado;
    const bIsReservado = b.id_estado === 1 || !b.id_estado;

    // Los reservados siempre van primero
    if (aIsReservado && !bIsReservado) return -1;
    if (!aIsReservado && bIsReservado) return 1;

    // Si tienen la misma prioridad, el más reciente va primero
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleEdit = (order: any) => {
    setEditingOrder(order);
    setDialogOpen(true);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSaveOrder = (updatedOrder: any) => {
    // Implement full save logic later, for now just refresh
    fetchOrders();
    setDialogOpen(false);
  };

  const handleCreateOrder = () => {
    fetchOrders(); // Refresh table after creating
  };

  const handleUpdateStatus = async (orderId: string, newStatusId: number, statusName: string) => {
    // Actualización optimista (inmediata en la UI)
    setOrders((prev) =>
      prev.map((o) => (o.id_orden === orderId ? { ...o, id_estado: newStatusId } : o))
    );

    try {
      const response = await apiFetch(`/ordenes/${orderId}/estado`, {
        method: 'PUT',
        body: JSON.stringify({ id_estado: newStatusId })
      });
      if (response.ok) {
        toast.success(`Pedido marcado como ${statusName}`);
        // Refrescar en segundo plano sin mostrar el "Cargando..."
        fetchOrders(false);
      } else {
        toast.error('Error al actualizar el estado');
        fetchOrders(false); // Revertir si falló
      }
    } catch (err) {
      toast.error('Error de conexión');
      fetchOrders(false); // Revertir si falló
    }
  };

  const reservedCount = orders.filter((o) => o.estados_orden?.nombre_estado?.toLowerCase() === 'reservado').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Pedidos</h1>
          <p className="text-muted-foreground">Gestión de pedidos recibidos por WhatsApp</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-lg bg-primary/10 px-4 py-2">
            <MessageCircle className="h-5 w-5 text-primary" />
            <span className="font-medium text-foreground">{reservedCount} pedidos pendientes</span>
          </div>
          <Button onClick={() => setNewOrderOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Nuevo Pedido
          </Button>
        </div>
      </div>

      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Lista de Pedidos</CardTitle>
          <CardDescription>Filtre y gestione los pedidos del día</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="mb-6 flex flex-wrap gap-4">
            <div className="min-w-[200px] flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre o WhatsApp..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterEstado} onValueChange={setFilterEstado}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="reservado">Reservado</SelectItem>
                <SelectItem value="consumido">Consumido</SelectItem>
                <SelectItem value="cancelado">Cancelado</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterTipo} onValueChange={setFilterTipo}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                <SelectItem value="convenio">Convenio</SelectItem>
                <SelectItem value="cliente">Cliente</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Orders Table */}
          <div className="rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow className="bg-accent/50">
                  <TableHead>Cliente</TableHead>
                  <TableHead>Tipo de Cliente</TableHead>
                  <TableHead>Detalle de Pedido</TableHead>
                  <TableHead className="text-center">Total Productos</TableHead>
                  <TableHead className="text-center">Total ($)</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                      Cargando pedidos...
                    </TableCell>
                  </TableRow>
                ) : sortedOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                      No se encontraron pedidos
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedOrders.map((order) => (
                    <TableRow key={order.id_orden}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-foreground">{order.clientes?.nombre} {order.clientes?.apellido}</p>
                          {['manual', 'sistema'].some(word => order.origenes_pedido?.nombre_origen?.toLowerCase().includes(word)) && (
                            <div className="flex items-center gap-1 mt-1 text-xs font-medium text-foreground bg-accent/60 rounded-full px-2 py-0.5 w-fit">
                              <User className="h-3.5 w-3.5" />
                              Creado por: <span className="font-bold">{order.creador_nombre}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <Badge variant="outline" className="w-fit bg-primary/5">
                            {order.clientes?.tipos_cliente?.nombre_tipo || 'Cliente'}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-foreground">
                        {order.detalle_orden && order.detalle_orden.length > 0 ? (
                          <div className="space-y-1">
                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                            {order.detalle_orden.map((det: any) => (
                              <div key={det.id_detalle} className="text-sm">
                                <span className="font-medium">
                                  {det.cantidad}x {det.productos?.nombre_producto} <span className="text-muted-foreground font-normal ml-1">(${(det.precio_aplicado || 0).toFixed(2)})</span>
                                </span>
                                {det.opciones && Object.keys(det.opciones).length > 0 && (
                                  <span className="text-xs text-muted-foreground block">
                                    ({Object.entries(det.opciones).map(([k, v]) => `${k.charAt(0).toUpperCase() + k.slice(1)}: ${v}`).join(', ')})
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : 'Sin detalles'}
                        {order.observaciones && (
                          <div className="mt-2 text-xs p-2 bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 rounded-md">
                            <span className="font-bold">Nota:</span> {order.observaciones}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-center font-medium text-foreground">
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {order.detalle_orden?.reduce((sum: number, d: any) => sum + d.cantidad, 0) || 0}
                      </TableCell>
                      <TableCell className="text-center font-bold text-emerald-600 dark:text-emerald-500">
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        ${(order.detalle_orden?.reduce((sum: number, d: any) => sum + (d.cantidad * (d.precio_aplicado || 0)), 0) || 0).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Select 
                            value={order.id_estado ? order.id_estado.toString() : '1'} 
                            disabled={!isAdmin && (order.id_estado === 2 || order.id_estado === 3)}
                            onValueChange={(val) => {
                              const newStatusId = parseInt(val);
                              let statusName = 'reservado';
                              if (newStatusId === 2) statusName = 'consumido';
                              if (newStatusId === 3) statusName = 'cancelado';
                              
                              if (newStatusId === 3) {
                                if (confirm('¿Está seguro que desea cancelar este pedido?')) {
                                  handleUpdateStatus(order.id_orden, newStatusId, statusName);
                                }
                              } else {
                                handleUpdateStatus(order.id_orden, newStatusId, statusName);
                              }
                            }}
                          >
                            <SelectTrigger className={`w-[140px] h-8 text-xs font-bold bg-transparent border-border hover:bg-accent ${
                              (!order.id_estado || order.id_estado === 1) ? 'text-amber-600 dark:text-amber-500' :
                              order.id_estado === 2 ? 'text-emerald-600 dark:text-emerald-500' :
                              'text-red-600 dark:text-red-500'
                            } disabled:opacity-90 disabled:cursor-not-allowed`}>
                              <SelectValue placeholder="Estado" />
                            </SelectTrigger>
                            <SelectContent className="bg-popover text-popover-foreground">
                              <SelectItem value="1" className="font-medium text-amber-600 dark:text-amber-400">Reservado</SelectItem>
                              <SelectItem value="2" className="font-medium text-emerald-600 dark:text-emerald-400">Consumido</SelectItem>
                              <SelectItem value="3" className="font-medium text-red-600 dark:text-red-400">Cancelado</SelectItem>
                            </SelectContent>
                          </Select>
                          
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-primary"
                            disabled={!isAdmin && (order.id_estado === 2 || order.id_estado === 3)}
                            onClick={() => handleEdit(order)}
                            title="Editar pedido"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <EditOrderDialog
        order={editingOrder}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSave={handleSaveOrder}
      />

      <NewOrderDialog
        open={newOrderOpen}
        onOpenChange={setNewOrderOpen}
        onCreate={handleCreateOrder}
      />
    </div>
  );
}
