import { useEffect, useState, useMemo } from 'react';
import { OrderProduct } from '@/types';
import { apiFetch } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, Minus, Trash2, ShoppingCart, Utensils } from 'lucide-react';
import { toast } from 'sonner';

export interface OrderItem {
  id_producto: string;
  nombre: string;
  precio: number;
  cantidad: number;
  sopa?: string;
  segundo?: string;
  id_categoria: number;
}

export interface OrderFormState {
  items: OrderItem[];
  observaciones: string;
}

interface OrderFormFieldsProps {
  state: OrderFormState;
  onChange: (next: OrderFormState) => void;
  showProductos?: boolean;
}

interface Category {
  id_categoria: number;
  nombre_categoria: string;
}

interface Product {
  id: string;
  nombre: string;
  precio: number;
  id_categoria: number;
  categoria_nombre: string;
}

export function OrderFormFields({ state, onChange }: OrderFormFieldsProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Local state for the item currently being configured
  const [currentCategory, setCurrentCategory] = useState<string>('');
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [currentSopa, setCurrentSopa] = useState('');
  const [currentSegundo, setCurrentSegundo] = useState('');
  const [currentCantidad, setCurrentCantidad] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, prodRes] = await Promise.all([
          apiFetch('/categorias'),
          apiFetch('/productos')
        ]);
        if (catRes.ok) setCategories(await catRes.json());
        if (prodRes.ok) setAllProducts(await prodRes.json());
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredProducts = useMemo(() => {
    return allProducts.filter(p => p.id_categoria.toString() === currentCategory);
  }, [allProducts, currentCategory]);

  const handleAddItem = () => {
    if (!currentProduct) {
      toast.error('Seleccione un producto');
      return;
    }

    const isAlmuerzo = currentProduct.categoria_nombre.toLowerCase().includes('almuerzo');
    const productNameLower = currentProduct.nombre.toLowerCase();
    const isCompleto = productNameLower.includes('completo');
    const isSinSopa = productNameLower.includes('sin sopa') || productNameLower.includes('solo segundo') || (productNameLower.includes('segundo') && !productNameLower.includes('sopa') && !isCompleto);
    const isSoloSopa = !isSinSopa && (productNameLower.includes('solo sopa') || (productNameLower.includes('sopa') && !productNameLower.includes('segundo') && !isCompleto));
    const requireSopa = isAlmuerzo && !isSinSopa;
    const requireSegundo = isAlmuerzo && !isSoloSopa;
    
    if (requireSopa && !currentSopa.trim()) {
      toast.error('Por favor especifique la sopa');
      return;
    }
    if (requireSegundo && !currentSegundo.trim()) {
      toast.error('Por favor especifique el segundo');
      return;
    }

    const newItem: OrderItem = {
      id_producto: currentProduct.id,
      nombre: currentProduct.nombre,
      precio: currentProduct.precio,
      cantidad: currentCantidad,
      id_categoria: currentProduct.id_categoria,
      ...(requireSopa ? { sopa: currentSopa } : {}),
      ...(requireSegundo ? { segundo: currentSegundo } : {})
    };

    onChange({
      ...state,
      items: [...state.items, newItem]
    });

    // Reset local form
    setCurrentCategory('');
    setCurrentProduct(null);
    setCurrentSopa('');
    setCurrentSegundo('');
    setCurrentCantidad(1);
    toast.success(`${newItem.nombre} agregado al pedido`);
  };

  const handleRemoveItem = (index: number) => {
    const newItems = [...state.items];
    newItems.splice(index, 1);
    onChange({ ...state, items: newItems });
  };

  const totalPedido = state.items.reduce((sum, item) => sum + item.precio * item.cantidad, 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Selector de Productos */}
      <Card className="border-border bg-muted/20 shadow-sm">
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Plus className="h-4 w-4 text-primary" />
            <span className="text-sm font-bold text-foreground uppercase tracking-wider">Agregar al Pedido</span>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Categoría</Label>
              <Select value={currentCategory} onValueChange={(v) => {
                setCurrentCategory(v);
                setCurrentProduct(null);
              }}>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Elija categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id_categoria} value={c.id_categoria.toString()}>
                      {c.nombre_categoria}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Producto</Label>
              <Select 
                value={currentProduct?.id?.toString() || ''} 
                onValueChange={(v) => setCurrentProduct(allProducts.find(p => p.id.toString() === v) || null)}
                disabled={!currentCategory}
              >
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Elija producto" />
                </SelectTrigger>
                <SelectContent>
                  {filteredProducts.map((p) => (
                    <SelectItem key={p.id} value={p.id.toString()}>{p.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {(() => {
            const isAlmuerzo = currentProduct?.categoria_nombre.toLowerCase().includes('almuerzo');
            const productNameLower = currentProduct?.nombre.toLowerCase() || '';
            const isCompleto = productNameLower.includes('completo');
            const isSinSopa = productNameLower.includes('sin sopa') || productNameLower.includes('solo segundo') || (productNameLower.includes('segundo') && !productNameLower.includes('sopa') && !isCompleto);
            const isSoloSopa = !isSinSopa && (productNameLower.includes('solo sopa') || (productNameLower.includes('sopa') && !productNameLower.includes('segundo') && !isCompleto));
            const showSopaField = isAlmuerzo && !isSinSopa;
            const showSegundoField = isAlmuerzo && !isSoloSopa;

            if (!isAlmuerzo || (!showSopaField && !showSegundoField)) return null;

            return (
              <div className={`grid gap-4 ${showSopaField && showSegundoField ? 'md:grid-cols-2' : 'md:grid-cols-1'} p-4 bg-primary/5 rounded-xl border border-primary/10 animate-in slide-in-from-top-2 duration-300`}>
                {showSopaField && (
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">¿Qué sopa desea?</Label>
                    <Input 
                      placeholder="Ej: Crema de Zapallo" 
                      value={currentSopa} 
                      onChange={e => setCurrentSopa(e.target.value)}
                      className="bg-background"
                    />
                  </div>
                )}
                {showSegundoField && (
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">¿Qué segundo desea?</Label>
                    <Input 
                      placeholder="Ej: Pollo al Horno" 
                      value={currentSegundo} 
                      onChange={e => setCurrentSegundo(e.target.value)}
                      className="bg-background"
                    />
                  </div>
                )}
              </div>
            );
          })()}

          <div className="flex items-end justify-between gap-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Cantidad</Label>
              <div className="flex items-center gap-2">
                <Button 
                  type="button"
                  variant="outline" 
                  size="icon" 
                  className="h-9 w-9 bg-background"
                  onClick={() => setCurrentCantidad(Math.max(1, currentCantidad - 1))}
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <span className="w-10 text-center font-bold">{currentCantidad}</span>
                <Button 
                  type="button"
                  variant="outline" 
                  size="icon" 
                  className="h-9 w-9 bg-background"
                  onClick={() => setCurrentCantidad(currentCantidad + 1)}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </div>

            <Button type="button" onClick={handleAddItem} className="gap-2 px-6 shadow-md shadow-primary/20">
              <Plus className="h-4 w-4" />
              Agregar Producto
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Carrito / Lista de Pedido */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 px-1">
          <ShoppingCart className="h-5 w-5 text-primary" />
          <h3 className="font-bold text-foreground">Productos en este Pedido</h3>
        </div>

        {state.items.length === 0 ? (
          <div className="h-32 flex flex-col items-center justify-center border-2 border-dashed rounded-xl text-muted-foreground bg-muted/5">
            <Utensils className="h-8 w-8 mb-2 opacity-20" />
            <p className="text-sm">No hay productos agregados</p>
          </div>
        ) : (
          <ScrollArea className="max-h-[300px] rounded-xl border border-border bg-background shadow-inner">
            <div className="divide-y divide-border">
              {state.items.map((item, index) => (
                <div key={index} className="p-4 hover:bg-muted/30 transition-colors group">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-primary">{item.cantidad}x</span>
                        <p className="font-semibold text-foreground truncate">{item.nombre}</p>
                      </div>
                      {(item.sopa || item.segundo) && (
                        <div className="mt-1 flex flex-wrap gap-2">
                          {item.sopa && <span className="text-xs font-medium bg-accent/60 px-2.5 py-0.5 rounded-full text-foreground border">Sopa: {item.sopa}</span>}
                          {item.segundo && <span className="text-xs font-medium bg-accent/60 px-2.5 py-0.5 rounded-full text-foreground border">Segundo: {item.segundo}</span>}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      <span className="font-bold text-foreground">${(item.precio * item.cantidad).toFixed(2)}</span>
                      <Button 
                        type="button"
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleRemoveItem(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}

        {state.items.length > 0 && (
          <div className="bg-primary/10 p-4 rounded-xl flex items-center justify-between border border-primary/20">
            <span className="font-bold text-primary">TOTAL DEL PEDIDO:</span>
            <span className="text-2xl font-black text-primary">${totalPedido.toFixed(2)}</span>
          </div>
        )}
      </div>

      {/* Observaciones */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold flex items-center gap-2">
          Observaciones Generales
        </Label>
        <Textarea
          placeholder="Ej: Sin cebolla, entregar en recepción, etc..."
          value={state.observaciones}
          onChange={(e) => onChange({ ...state, observaciones: e.target.value })}
          className="min-h-[100px] resize-none border-muted-foreground/20"
        />
      </div>
    </div>
  );
}
