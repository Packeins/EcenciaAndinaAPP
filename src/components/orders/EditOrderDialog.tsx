import { useState } from 'react';
import { Order, Product } from '@/types';
import { mockProducts } from '@/data/mockData';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ClientTypeBadge } from './ClientTypeBadge';
import { Plus, Minus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface EditOrderDialogProps {
  order: Order | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (order: Order) => void;
}

export function EditOrderDialog({ order, open, onOpenChange, onSave }: EditOrderDialogProps) {
  const [cantidad, setCantidad] = useState(order?.cantidad || 1);
  const [observaciones, setObservaciones] = useState(order?.observaciones || '');
  const [productos, setProductos] = useState(order?.productos || []);

  if (!order) return null;

  const isConvenio = order.tipoCliente === 'convenio';

  const handleAddProduct = (product: Product) => {
    const existing = productos.find((p) => p.productoId === product.id);
    if (existing) {
      setProductos(
        productos.map((p) =>
          p.productoId === product.id ? { ...p, cantidad: p.cantidad + 1 } : p
        )
      );
    } else {
      setProductos([
        ...productos,
        {
          productoId: product.id,
          nombre: product.nombre,
          cantidad: 1,
          precio: product.precio,
        },
      ]);
    }
  };

  const handleRemoveProduct = (productId: string) => {
    setProductos(productos.filter((p) => p.productoId !== productId));
  };

  const handleSave = () => {
    const updatedOrder: Order = {
      ...order,
      cantidad,
      observaciones,
      productos,
    };
    onSave(updatedOrder);
    toast.success('Pedido actualizado correctamente');
    onOpenChange(false);
  };

  const totalProductos = productos.reduce((sum, p) => sum + p.precio * p.cantidad, 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-foreground">Editar Pedido</DialogTitle>
          <DialogDescription>
            Modifique los detalles del pedido de {order.clienteNombre}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Client Info */}
          <div className="rounded-lg bg-accent p-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label className="text-xs text-muted-foreground">Cliente</Label>
                <p className="font-medium text-foreground">{order.clienteNombre}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">WhatsApp</Label>
                <p className="font-medium text-foreground">{order.whatsapp}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Tipo de Cliente</Label>
                <div className="mt-1">
                  <ClientTypeBadge type={order.tipoCliente} />
                </div>
              </div>
              {order.convenioNombre && (
                <div>
                  <Label className="text-xs text-muted-foreground">Convenio</Label>
                  <p className="font-medium text-foreground">{order.convenioNombre}</p>
                </div>
              )}
            </div>
          </div>

          {/* Cantidad */}
          <div className="space-y-2">
            <Label>Cantidad de Almuerzos</Label>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCantidad(Math.max(1, cantidad - 1))}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                type="number"
                value={cantidad}
                onChange={(e) => setCantidad(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-20 text-center"
                min={1}
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCantidad(cantidad + 1)}
              >
                <Plus className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground">
                {order.almuerzo}
              </span>
            </div>
          </div>

          {/* Productos Adicionales - Solo Convenios */}
          {isConvenio && (
            <div className="space-y-3">
              <Label>Productos Adicionales</Label>
              <div className="flex flex-wrap gap-2">
                {mockProducts.map((product) => (
                  <Button
                    key={product.id}
                    variant="outline"
                    size="sm"
                    onClick={() => handleAddProduct(product)}
                    className="gap-1"
                  >
                    <Plus className="h-3 w-3" />
                    {product.nombre} (${product.precio.toFixed(2)})
                  </Button>
                ))}
              </div>
              {productos.length > 0 && (
                <div className="rounded-lg border border-border p-3 space-y-2">
                  {productos.map((p) => (
                    <div key={p.productoId} className="flex items-center justify-between">
                      <span className="text-foreground">
                        {p.cantidad}x {p.nombre}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">
                          ${(p.precio * p.cantidad).toFixed(2)}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-destructive"
                          onClick={() => handleRemoveProduct(p.productoId)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  <div className="border-t border-border pt-2 flex justify-between font-medium">
                    <span>Total Productos:</span>
                    <span>${totalProductos.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Observaciones */}
          <div className="space-y-2">
            <Label htmlFor="observaciones">Observaciones</Label>
            <Textarea
              id="observaciones"
              placeholder="Notas adicionales..."
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>Guardar Cambios</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
