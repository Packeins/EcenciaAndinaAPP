import { useEffect, useState } from 'react';
import { ClientType, Order } from '@/types';
import { mockClients, mockConvenios, buildAlmuerzoLabel, platosFuertes, sopas } from '@/data/mockData';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { OrderFormFields, OrderFormState } from './OrderFormFields';
import { toast } from 'sonner';

interface NewOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (order: Order) => void;
}

type ClientMode = 'existing' | 'new';

export function NewOrderDialog({ open, onOpenChange, onCreate }: NewOrderDialogProps) {
  const [clientMode, setClientMode] = useState<ClientMode>('existing');
  const [clienteId, setClienteId] = useState<string>('');
  const [nombre, setNombre] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [tipoCliente, setTipoCliente] = useState<ClientType>('frecuente');
  const [convenioId, setConvenioId] = useState<string>('');

  const [state, setState] = useState<OrderFormState>({
    tipoAlmuerzo: 'normal',
    platoFuerte: platosFuertes[0],
    sopa: sopas[0],
    cantidad: 1,
    observaciones: '',
    productos: [],
  });

  useEffect(() => {
    if (open) {
      setClientMode('existing');
      setClienteId('');
      setNombre('');
      setWhatsapp('');
      setTipoCliente('frecuente');
      setConvenioId('');
      setState({
        tipoAlmuerzo: 'normal',
        platoFuerte: platosFuertes[0],
        sopa: sopas[0],
        cantidad: 1,
        observaciones: '',
        productos: [],
      });
    }
  }, [open]);

  const selectedClient = mockClients.find((c) => c.id === clienteId);
  const effectiveTipoCliente: ClientType =
    clientMode === 'existing' ? selectedClient?.tipo ?? 'frecuente' : tipoCliente;
  const showProductos = effectiveTipoCliente === 'convenio';

  const handleCreate = () => {
    let finalNombre = '';
    let finalWhatsapp = '';
    let finalClienteId = '';
    let finalConvenioNombre: string | undefined;

    if (clientMode === 'existing') {
      if (!selectedClient) {
        toast.error('Seleccione un cliente');
        return;
      }
      finalNombre = selectedClient.nombre;
      finalWhatsapp = selectedClient.whatsapp;
      finalClienteId = selectedClient.id;
      if (selectedClient.tipo === 'convenio' && selectedClient.convenioId) {
        finalConvenioNombre = mockConvenios.find((c) => c.id === selectedClient.convenioId)?.empresa;
      }
    } else {
      if (!nombre.trim() || !whatsapp.trim()) {
        toast.error('Complete nombre y WhatsApp del cliente');
        return;
      }
      finalNombre = nombre.trim();
      finalWhatsapp = whatsapp.trim();
      finalClienteId = `new-${Date.now()}`;
      if (tipoCliente === 'convenio') {
        if (!convenioId) {
          toast.error('Seleccione un convenio');
          return;
        }
        finalConvenioNombre = mockConvenios.find((c) => c.id === convenioId)?.empresa;
      }
    }

    if (!state.platoFuerte || !state.sopa) {
      toast.error('Seleccione plato fuerte y sopa');
      return;
    }
    if (state.cantidad < 1) {
      toast.error('La cantidad debe ser al menos 1');
      return;
    }

    const now = new Date();
    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      clienteId: finalClienteId,
      clienteNombre: finalNombre,
      whatsapp: finalWhatsapp,
      tipoCliente: effectiveTipoCliente,
      convenioNombre: finalConvenioNombre,
      almuerzo: buildAlmuerzoLabel(state.tipoAlmuerzo, state.platoFuerte, state.sopa),
      tipoAlmuerzo: state.tipoAlmuerzo,
      platoFuerte: state.platoFuerte,
      sopa: state.sopa,
      cantidad: state.cantidad,
      estado: 'reservado',
      productos: state.productos,
      observaciones: state.observaciones,
      fecha: now.toISOString().slice(0, 10),
      hora: now.toTimeString().slice(0, 5),
    };

    onCreate(newOrder);
    toast.success('Pedido creado correctamente');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground">Nuevo Pedido</DialogTitle>
          <DialogDescription>Registre un pedido manualmente</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Cliente */}
          <div className="space-y-3 rounded-lg border border-border p-4">
            <Label className="text-sm font-semibold text-foreground">Cliente</Label>
            <RadioGroup
              value={clientMode}
              onValueChange={(v: ClientMode) => setClientMode(v)}
              className="flex gap-6"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="existing" id="mode-existing" />
                <Label htmlFor="mode-existing" className="cursor-pointer">
                  Existente
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="new" id="mode-new" />
                <Label htmlFor="mode-new" className="cursor-pointer">
                  Nuevo
                </Label>
              </div>
            </RadioGroup>

            {clientMode === 'existing' ? (
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Seleccionar Cliente</Label>
                <Select value={clienteId} onValueChange={setClienteId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Buscar cliente…" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockClients
                      .filter((c) => c.activo)
                      .map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.nombre} — {c.whatsapp} ({c.tipo})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Nombre</Label>
                  <Input value={nombre} onChange={(e) => setNombre(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">WhatsApp</Label>
                  <Input
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="+593..."
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Tipo</Label>
                  <Select
                    value={tipoCliente}
                    onValueChange={(v: ClientType) => setTipoCliente(v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="frecuente">Frecuente</SelectItem>
                      <SelectItem value="convenio">Convenio</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {tipoCliente === 'convenio' && (
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Convenio</Label>
                    <Select value={convenioId} onValueChange={setConvenioId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockConvenios
                          .filter((c) => c.activo)
                          .map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                              {c.empresa}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            )}
          </div>

          <OrderFormFields state={state} onChange={setState} showProductos={showProductos} />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleCreate}>Crear Pedido</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
