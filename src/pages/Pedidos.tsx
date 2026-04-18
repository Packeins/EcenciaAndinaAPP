import { useState } from 'react';
import { mockOrders } from '@/data/mockData';
import { Order, OrderState } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge';
import { ClientTypeBadge } from '@/components/orders/ClientTypeBadge';
import { EditOrderDialog } from '@/components/orders/EditOrderDialog';
import { NewOrderDialog } from '@/components/orders/NewOrderDialog';
import { Pencil, CheckCircle, Phone, Search, MessageCircle, Plus } from 'lucide-react';
import { toast } from 'sonner';

export default function Pedidos() {
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [filterEstado, setFilterEstado] = useState<string>('all');
  const [filterTipo, setFilterTipo] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newOrderOpen, setNewOrderOpen] = useState(false);

  const filteredOrders = orders.filter((order) => {
    const matchEstado = filterEstado === 'all' || order.estado === filterEstado;
    const matchTipo = filterTipo === 'all' || order.tipoCliente === filterTipo;
    const matchSearch =
      order.clienteNombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.whatsapp.includes(searchTerm);
    return matchEstado && matchTipo && matchSearch;
  });

  const handleEdit = (order: Order) => {
    setEditingOrder(order);
    setDialogOpen(true);
  };

  const handleSaveOrder = (updatedOrder: Order) => {
    setOrders(orders.map((o) => (o.id === updatedOrder.id ? updatedOrder : o)));
  };

  const handleCreateOrder = (newOrder: Order) => {
    setOrders([newOrder, ...orders]);
  };

  const handleMarkConsumed = (orderId: string) => {
    setOrders(
      orders.map((o) => (o.id === orderId ? { ...o, estado: 'consumido' as OrderState } : o))
    );
    toast.success('Pedido marcado como consumido');
  };

  const reservedCount = orders.filter((o) => o.estado === 'reservado').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Pedidos</h1>
          <p className="text-muted-foreground">
            Gestión de pedidos recibidos por WhatsApp
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-lg bg-primary/10 px-4 py-2">
            <MessageCircle className="h-5 w-5 text-primary" />
            <span className="font-medium text-foreground">
              {reservedCount} pedidos pendientes
            </span>
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
          <CardDescription>
            Filtre y gestione los pedidos del día
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="mb-6 flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
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
              </SelectContent>
            </Select>
            <Select value={filterTipo} onValueChange={setFilterTipo}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                <SelectItem value="convenio">Convenio</SelectItem>
                <SelectItem value="frecuente">Frecuente</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Orders Table */}
          <div className="rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow className="bg-accent/50">
                  <TableHead>Cliente</TableHead>
                  <TableHead>WhatsApp</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Almuerzo</TableHead>
                  <TableHead className="text-center">Cantidad</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No se encontraron pedidos
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-foreground">{order.clienteNombre}</p>
                          {order.convenioNombre && (
                            <p className="text-xs text-muted-foreground">{order.convenioNombre}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-foreground">
                          <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                          {order.whatsapp}
                        </div>
                      </TableCell>
                      <TableCell>
                        <ClientTypeBadge type={order.tipoCliente} />
                      </TableCell>
                      <TableCell className="text-foreground">{order.almuerzo}</TableCell>
                      <TableCell className="text-center font-medium text-foreground">
                        {order.cantidad}
                      </TableCell>
                      <TableCell>
                        <OrderStatusBadge status={order.estado} />
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(order)}
                            title="Editar pedido"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          {order.estado === 'reservado' && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleMarkConsumed(order.id)}
                              className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-100"
                              title="Marcar como consumido"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          )}
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
