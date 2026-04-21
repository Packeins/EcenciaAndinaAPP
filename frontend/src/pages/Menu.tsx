import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { menuStore, useMenu } from '@/data/menuStore';
import { UtensilsCrossed, Soup, ChefHat, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function Menu() {
  const { tipos, platos, sopas } = useMenu();
  const [newPlato, setNewPlato] = useState('');
  const [newSopa, setNewSopa] = useState('');

  const handleAddPlato = () => {
    if (!newPlato.trim()) return toast.error('Ingrese un nombre');
    menuStore.addPlato(newPlato.trim());
    setNewPlato('');
    toast.success('Plato fuerte agregado');
  };

  const handleAddSopa = () => {
    if (!newSopa.trim()) return toast.error('Ingrese un nombre');
    menuStore.addSopa(newSopa.trim());
    setNewSopa('');
    toast.success('Sopa agregada');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Menú Diario</h1>
        <p className="text-muted-foreground">
          Edita los tipos de almuerzo, platos fuertes y sopas disponibles
        </p>
      </div>

      {/* Tipos de almuerzo */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <UtensilsCrossed className="h-5 w-5 text-primary" />
            Tipos de Almuerzo
          </CardTitle>
          <CardDescription>Edita el nombre y precio de cada tipo</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {tipos.map((t) => (
            <div key={t.value} className="grid gap-3 md:grid-cols-[120px_1fr_160px] md:items-end">
              <div>
                <Label className="text-xs text-muted-foreground capitalize">{t.value}</Label>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Nombre</Label>
                <Input
                  value={t.label}
                  onChange={(e) => menuStore.setTipoLabel(t.value, e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Precio (USD)</Label>
                <Input
                  type="number"
                  step="0.01"
                  min={0}
                  value={t.precio}
                  onChange={(e) =>
                    menuStore.setTipoPrecio(t.value, parseFloat(e.target.value) || 0)
                  }
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Platos Fuertes */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <ChefHat className="h-5 w-5 text-primary" />
            Platos Fuertes
          </CardTitle>
          <CardDescription>Opciones de plato fuerte disponibles para hoy</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {platos.map((p, i) => (
            <div key={i} className="flex items-center gap-2">
              <Input value={p} onChange={(e) => menuStore.setPlato(i, e.target.value)} />
              <Button
                variant="ghost"
                size="icon"
                className="text-destructive shrink-0"
                onClick={() => menuStore.removePlato(i)}
                disabled={platos.length <= 1}
                title="Eliminar"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <div className="flex items-center gap-2 pt-2 border-t border-border">
            <Input
              placeholder="Nuevo plato fuerte..."
              value={newPlato}
              onChange={(e) => setNewPlato(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddPlato()}
            />
            <Button onClick={handleAddPlato} className="gap-1 shrink-0">
              <Plus className="h-4 w-4" />
              Agregar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Sopas */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Soup className="h-5 w-5 text-primary" />
            Sopas
          </CardTitle>
          <CardDescription>Opciones de sopa disponibles para hoy</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {sopas.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <Input value={s} onChange={(e) => menuStore.setSopa(i, e.target.value)} />
              <Button
                variant="ghost"
                size="icon"
                className="text-destructive shrink-0"
                onClick={() => menuStore.removeSopa(i)}
                disabled={sopas.length <= 1}
                title="Eliminar"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <div className="flex items-center gap-2 pt-2 border-t border-border">
            <Input
              placeholder="Nueva sopa..."
              value={newSopa}
              onChange={(e) => setNewSopa(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddSopa()}
            />
            <Button onClick={handleAddSopa} className="gap-1 shrink-0">
              <Plus className="h-4 w-4" />
              Agregar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
