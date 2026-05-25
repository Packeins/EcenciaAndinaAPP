import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { OrderFormFields, OrderFormState } from './OrderFormFields';
import { toast } from 'sonner';

interface EditOrderDialogProps {
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  order: any | null; // using any since the shape comes from the GET response
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
}

export function EditOrderDialog({ order, open, onOpenChange, onSave }: EditOrderDialogProps) {
  const [state, setState] = useState<OrderFormState>({
    items: [],
    observaciones: '',
  });

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (order && open) {
      setState({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        items: order.detalle_orden?.map((det: any) => ({
          id_producto: det.id_producto,
          nombre: det.productos?.nombre_producto || 'Desconocido',
          precio: det.precio_aplicado,
          cantidad: det.cantidad,
          sopa: det.opciones?.sopa || '',
          segundo: det.opciones?.segundo || '',
          id_categoria: 0, // Not strictly needed for deleting/adding locally
        })) || [],
        observaciones: order.observaciones || '',
      });
    }
  }, [order, open]);

  if (!order) return null;

  const isConvenio = order.clientes?.tipos_cliente?.nombre_tipo?.toLowerCase().includes('convenio');

  const handleSave = async () => {
    if (state.items.length === 0) {
      toast.error('Agregue al menos un producto al pedido');
      return;
    }

    setIsSaving(true);
    try {
      const response = await apiFetch(`/ordenes/${order.id_orden}`, {
        method: 'PUT',
        body: JSON.stringify({
          observaciones: state.observaciones,
          detalles: state.items.map(item => {
            const opciones: Record<string, string> = {};
            if (item.sopa) opciones.sopa = item.sopa;
            if (item.segundo) opciones.segundo = item.segundo;
            return {
              id_producto: item.id_producto,
              cantidad: item.cantidad,
              precio_aplicado: item.precio,
              opciones
            };
          })
        })
      });

      if (response.ok) {
        toast.success('Pedido actualizado correctamente');
        onSave(); // Refresh list
        onOpenChange(false);
      } else {
        const errorData = await response.json();
        toast.error(`Error al guardar: ${errorData.error}`);
      }
    } catch (err) {
      toast.error('Error de conexión con el servidor');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground">Editar Pedido</DialogTitle>
          <DialogDescription>
            Añade, elimina o modifica los productos del pedido de {order.clientes?.nombre} {order.clientes?.apellido}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Client Info */}
          <div className="rounded-lg bg-accent p-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label className="text-xs text-muted-foreground">Cliente</Label>
                <p className="font-medium text-foreground">{order.clientes?.nombre} {order.clientes?.apellido}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">App de Mensajería</Label>
                <p className="font-medium text-foreground">{order.clientes?.telefono || 'N/A'}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Tipo de Cliente</Label>
                <div className="mt-1">
                  <Badge variant="outline" className="w-fit bg-primary/5">
                    {order.clientes?.tipos_cliente?.nombre_tipo || 'Cliente'}
                  </Badge>
                </div>
              </div>
              {isConvenio && (
                <div>
                  <Label className="text-xs text-muted-foreground">Detalle Convenio</Label>
                  <p className="font-medium text-foreground">{order.clientes?.tipos_cliente?.nombre_tipo}</p>
                </div>
              )}
            </div>
          </div>

          <OrderFormFields state={state} onChange={setState} showProductos={true} />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
