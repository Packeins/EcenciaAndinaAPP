import { useMemo, useState } from 'react';
import { OrderProduct, TipoAlmuerzo } from '@/types';
import { mockProducts, tiposAlmuerzo, platosFuertes, sopas } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, Minus, Trash2, Search } from 'lucide-react';

export interface OrderFormState {
  tipoAlmuerzo: TipoAlmuerzo;
  platoFuerte: string;
  sopa: string;
  cantidad: number;
  observaciones: string;
  productos: OrderProduct[];
}

interface OrderFormFieldsProps {
  state: OrderFormState;
  onChange: (next: OrderFormState) => void;
  showProductos: boolean;
}

export function OrderFormFields({ state, onChange, showProductos }: OrderFormFieldsProps) {
  const [search, setSearch] = useState('');

  const update = (patch: Partial<OrderFormState>) => onChange({ ...state, ...patch });

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return mockProducts;
    return mockProducts.filter(
      (p) => p.nombre.toLowerCase().includes(q) || p.categoria.toLowerCase().includes(q)
    );
  }, [search]);

  const handleAddProduct = (productId: string) => {
    const product = mockProducts.find((p) => p.id === productId);
    if (!product) return;
    const existing = state.productos.find((p) => p.productoId === product.id);
    if (existing) {
      update({
        productos: state.productos.map((p) =>
          p.productoId === product.id ? { ...p, cantidad: p.cantidad + 1 } : p
        ),
      });
    } else {
      update({
        productos: [
          ...state.productos,
          { productoId: product.id, nombre: product.nombre, cantidad: 1, precio: product.precio },
        ],
      });
    }
  };

  const handleRemoveProduct = (productId: string) => {
    update({ productos: state.productos.filter((p) => p.productoId !== productId) });
  };

  const totalProductos = state.productos.reduce((sum, p) => sum + p.precio * p.cantidad, 0);

  return (
    <div className="space-y-6">
      {/* Almuerzo */}
      <div className="space-y-3 rounded-lg border border-border p-4">
        <Label className="text-sm font-semibold text-foreground">Almuerzo</Label>
        <div className="grid gap-3 md:grid-cols-3">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Tipo</Label>
            <Select
              value={state.tipoAlmuerzo}
              onValueChange={(v: TipoAlmuerzo) => update({ tipoAlmuerzo: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {tiposAlmuerzo.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label} (${t.precio.toFixed(2)})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Plato Fuerte</Label>
            <Select value={state.platoFuerte} onValueChange={(v) => update({ platoFuerte: v })}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar" />
              </SelectTrigger>
              <SelectContent>
                {platosFuertes.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Sopa</Label>
            <Select value={state.sopa} onValueChange={(v) => update({ sopa: v })}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar" />
              </SelectTrigger>
              <SelectContent>
                {sopas.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Cantidad */}
      <div className="space-y-2">
        <Label>Cantidad de Almuerzos</Label>
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => update({ cantidad: Math.max(1, state.cantidad - 1) })}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <Input
            type="number"
            value={state.cantidad}
            onChange={(e) => update({ cantidad: Math.max(1, parseInt(e.target.value) || 1) })}
            className="w-20 text-center"
            min={1}
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => update({ cantidad: state.cantidad + 1 })}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Productos Adicionales con buscador */}
      {showProductos && (
        <div className="space-y-3">
          <Label>Productos Adicionales</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar producto…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
              autoFocus={false}
            />
          </div>
          <ScrollArea className="h-48 rounded-lg border border-border">
            <div className="divide-y divide-border">
              {filteredProducts.length === 0 ? (
                <p className="p-4 text-center text-sm text-muted-foreground">Sin resultados</p>
              ) : (
                filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between gap-2 p-2.5 hover:bg-accent/50"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">
                        {product.nombre}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {product.categoria} · ${product.precio.toFixed(2)}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddProduct(product.id)}
                      className="gap-1 shrink-0"
                    >
                      <Plus className="h-3 w-3" />
                      Agregar
                    </Button>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>

          {state.productos.length > 0 && (
            <div className="space-y-2 rounded-lg border border-border p-3">
              {state.productos.map((p) => (
                <div key={p.productoId} className="flex items-center justify-between">
                  <span className="text-foreground">
                    {p.cantidad}x {p.nombre}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">
                      ${(p.precio * p.cantidad).toFixed(2)}
                    </span>
                    <Button
                      type="button"
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
              <div className="flex justify-between border-t border-border pt-2 font-medium">
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
          value={state.observaciones}
          onChange={(e) => update({ observaciones: e.target.value })}
          rows={3}
        />
      </div>
    </div>
  );
}
