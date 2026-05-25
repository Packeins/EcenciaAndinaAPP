import { useEffect, useState } from 'react';
import { Client } from '@/types';
import { apiFetch } from '@/lib/api';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Wallet, Package, TrendingUp, TrendingDown, Receipt, User, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WalletDialogProps {
  client: Client | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type HistorialEvent = {
  tipo: 'recarga' | 'consumo';
  fecha: string;
  producto: string;
  cantidad: number;
  monto_total?: number;
  precio_aplicado?: number;
  numero_factura?: string | null;
  registrado_por: string;
  referencia: string;
};

export function WalletDialog({ client, open, onOpenChange }: WalletDialogProps) {
  const [balances, setBalances] = useState<{ productos?: { nombre_producto: string }; cantidad_disponible: number }[]>([]);
  const [historial, setHistorial] = useState<HistorialEvent[]>([]);
  const [isLoadingBalances, setIsLoadingBalances] = useState(true);
  const [isLoadingHistorial, setIsLoadingHistorial] = useState(false);
  const [activeTab, setActiveTab] = useState<'saldos' | 'historial'>('saldos');

  useEffect(() => {
    if (open && client) {
      setActiveTab('saldos');
      fetchBalances();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, client]);

  useEffect(() => {
    if (activeTab === 'historial' && client && historial.length === 0) {
      fetchHistorial();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const fetchBalances = async () => {
    setIsLoadingBalances(true);
    try {
      const response = await apiFetch(`/clientes/${client?.id}/saldo`);
      if (response.ok) setBalances(await response.json());
    } catch (err) {
      toast.error('Error al cargar saldos');
    } finally {
      setIsLoadingBalances(false);
    }
  };

  const fetchHistorial = async () => {
    setIsLoadingHistorial(true);
    try {
      const response = await apiFetch(`/clientes/${client?.id}/historial`);
      if (response.ok) setHistorial(await response.json());
    } catch (err) {
      toast.error('Error al cargar historial');
    } finally {
      setIsLoadingHistorial(false);
    }
  };

  const formatFecha = (fechaStr: string) => {
    const fecha = new Date(fechaStr);
    return fecha.toLocaleDateString('es-EC', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-cafe">
            <Wallet className="h-5 w-5" />
            Monedero Virtual
          </DialogTitle>
          <DialogDescription>
            Gestiona los saldos prepago de {client?.nombre} {client?.apellido}.
          </DialogDescription>
        </DialogHeader>

        {/* Tabs */}
        <div className="flex gap-1 rounded-xl bg-muted/40 p-1">
          <button
            onClick={() => setActiveTab('saldos')}
            className={cn(
              'flex-1 rounded-lg py-2 text-sm font-semibold transition-all',
              activeTab === 'saldos'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Saldos Actuales
          </button>
          <button
            onClick={() => setActiveTab('historial')}
            className={cn(
              'flex-1 rounded-lg py-2 text-sm font-semibold transition-all',
              activeTab === 'historial'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Historial
          </button>
        </div>

        <div className="min-h-[220px]">
          {/* TAB: SALDOS */}
          {activeTab === 'saldos' && (
            <div className="space-y-3 py-2">
              <Label className="text-sm font-bold text-foreground">Saldos Disponibles</Label>
              {isLoadingBalances ? (
                <div className="flex items-center justify-center py-8">
                  <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                </div>
              ) : balances.length === 0 ? (
                <div className="text-sm text-muted-foreground p-4 border rounded-md bg-muted/20 text-center">
                  El cliente no tiene saldos disponibles.
                </div>
              ) : (
                <div className="grid gap-2">
                  {balances.map((b, i) => (
                    <div key={i} className="flex items-center justify-between p-3 border rounded-md bg-primary/5">
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-primary" />
                        <span className="font-semibold text-sm">{b.productos?.nombre_producto}</span>
                      </div>
                      <Badge variant="default" className="text-base font-black px-3 py-1">
                        {b.cantidad_disponible} und.
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: HISTORIAL */}
          {activeTab === 'historial' && (
            <div className="space-y-2 py-2">
              <Label className="text-sm font-bold text-foreground">
                Recargas y Consumos
              </Label>

              {isLoadingHistorial ? (
                <div className="flex items-center justify-center py-8">
                  <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                </div>
              ) : historial.length === 0 ? (
                <div className="text-sm text-muted-foreground p-4 border rounded-md bg-muted/20 text-center">
                  No hay movimientos registrados para este cliente.
                </div>
              ) : (
                <div className="relative max-h-[320px] overflow-y-auto pr-1 space-y-0">
                  {/* Línea vertical del timeline */}
                  <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-border" />

                  {historial.map((evento, i) => {
                    const esRecarga = evento.tipo === 'recarga';
                    return (
                      <div key={i} className="relative flex gap-3 pb-4 last:pb-0">
                        {/* Punto del timeline */}
                        <div className={cn(
                          'relative z-10 mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 shadow-sm',
                          esRecarga
                            ? 'bg-emerald-50 border-emerald-400 text-emerald-600'
                            : 'bg-orange-50 border-orange-400 text-orange-600'
                        )}>
                          {esRecarga
                            ? <TrendingUp className="h-4 w-4" />
                            : <TrendingDown className="h-4 w-4" />
                          }
                        </div>

                        {/* Contenido */}
                        <div className={cn(
                          'flex-1 rounded-lg border p-3 text-sm',
                          esRecarga ? 'bg-emerald-50/50 border-emerald-200' : 'bg-orange-50/50 border-orange-200'
                        )}>
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <span className={cn(
                                'text-xs font-bold uppercase tracking-wider',
                                esRecarga ? 'text-emerald-600' : 'text-orange-600'
                              )}>
                                {esRecarga ? '+ Recarga' : '− Consumo'}
                              </span>
                              <p className="font-semibold text-foreground leading-tight mt-0.5">
                                {evento.producto}
                              </p>
                              <p className="text-muted-foreground text-xs mt-1">
                                {evento.cantidad} {evento.cantidad === 1 ? 'unidad' : 'unidades'}
                              </p>
                            </div>
                            <div className="text-right shrink-0">
                              <Badge variant="outline" className={cn(
                                'font-black text-sm',
                                esRecarga ? 'border-emerald-400 text-emerald-700' : 'border-orange-400 text-orange-700'
                              )}>
                                {esRecarga ? '+' : '−'}{evento.cantidad}
                              </Badge>
                            </div>
                          </div>

                          {/* Factura (solo recargas) */}
                          {esRecarga && evento.numero_factura && (
                            <div className="flex items-center gap-1 mt-2 text-xs text-emerald-700 font-semibold bg-emerald-100 rounded px-2 py-1 w-fit">
                              <Receipt className="h-3 w-3" />
                              FAC: {evento.numero_factura}
                            </div>
                          )}

                          {/* Metadatos */}
                          <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatFecha(evento.fecha)}
                            </span>
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {evento.registrado_por}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cerrar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
