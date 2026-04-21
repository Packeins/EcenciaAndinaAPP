import { useEffect, useState } from 'react';
import { Order } from '@/types';
import { buildAlmuerzoLabel } from '@/data/mockData';
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
import { ClientTypeBadge } from './ClientTypeBadge';
import { OrderFormFields, OrderFormState } from './OrderFormFields';
import { toast } from 'sonner';

interface EditOrderDialogProps {
  order: Order | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (order: Order) => void;
}

export function EditOrderDialog({ order, open, onOpenChange, onSave }: EditOrderDialogProps) {
  const [state, setState] = useState<OrderFormState>({
    tipoAlmuerzo: 'normal',
    platoFuerte: '',
    sopa: '',
    cantidad: 1,
    observaciones: '',
    productos: [],
  });

  useEffect(() => {
    if (order) {
      setState({
        tipoAlmuerzo: order.tipoAlmuerzo,
        platoFuerte: order.platoFuerte,
        sopa: order.sopa,
        cantidad: order.cantidad,
        observaciones: order.observaciones,
        productos: order.productos,
      });
    }
  }, [order]);

  if (!order) return null;

  const isConvenio = order.tipoCliente === 'convenio';

  const handleSave = () => {
    const updatedOrder: Order = {
      ...order,
      tipoAlmuerzo: state.tipoAlmuerzo,
      platoFuerte: state.platoFuerte,
      sopa: state.sopa,
      almuerzo: buildAlmuerzoLabel(state.tipoAlmuerzo, state.platoFuerte, state.sopa),
      cantidad: state.cantidad,
      observaciones: state.observaciones,
      productos: state.productos,
    };
    onSave(updatedOrder);
    toast.success('Pedido actualizado correctamente');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
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

          <OrderFormFields state={state} onChange={setState} showProductos={isConvenio} />
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
