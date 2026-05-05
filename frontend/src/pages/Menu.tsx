import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { menuStore, useMenu } from '@/data/menuStore';
import { 
  UtensilsCrossed, 
  Soup, 
  ChefHat, 
  Send, 
  CalendarDays,
  Image as ImageIcon
} from 'lucide-react';
import { toast } from 'sonner';
import { ImageUpload } from '@/components/ImageUpload';

export default function Menu() {
  const { dailyMenu } = useMenu();
  const [isSending, setIsSending] = useState(false);

  const handleSendMenu = async () => {
    if (!dailyMenu.opcion1.sopa || !dailyMenu.opcion1.segundo) {
      return toast.error('Al menos la Opción 1 debe estar completa');
    }
    
    setIsSending(true);
    // Simulación de envío a WhatsApp
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast.success('¡Menú del día enviado correctamente!', {
      description: 'Se notificará a los contactos de WhatsApp configurados.'
    });
    setIsSending(false);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
            Menú Diario
          </h1>
          <p className="text-muted-foreground text-lg">
            Ingresa los almuerzos de hoy y sube la foto del menú.
          </p>
        </div>
        <div className="bg-primary/10 px-4 py-2 rounded-2xl flex items-center gap-2 border border-primary/20 backdrop-blur-sm">
          <CalendarDays className="h-5 w-5 text-primary" />
          <span className="text-sm font-semibold text-primary capitalize">
            {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Opción 1 */}
          <Card className="border-border shadow-sm hover:shadow-md transition-shadow overflow-hidden group border-l-4 border-l-primary">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl flex items-center gap-3">
                <div className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-sm">1</div>
                Almuerzo Opción 1
              </CardTitle>
              <CardDescription className="text-base">Principal alternativa de sopa y plato fuerte</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-8 md:grid-cols-2 pt-2">
              <div className="space-y-3">
                <Label className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  <Soup className="h-4 w-4 text-primary" />
                  Sopa
                </Label>
                <Input 
                  placeholder="Ej: Crema de Zapallo" 
                  value={dailyMenu.opcion1.sopa}
                  onChange={(e) => menuStore.setDailyOption1({ sopa: e.target.value })}
                  className="h-12 bg-muted/30 focus:bg-background transition-all border-muted-foreground/20 focus:border-primary text-base"
                />
              </div>
              <div className="space-y-3">
                <Label className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  <ChefHat className="h-4 w-4 text-primary" />
                  Segundo (Plato Fuerte)
                </Label>
                <Input 
                  placeholder="Ej: Pollo al Horno" 
                  value={dailyMenu.opcion1.segundo}
                  onChange={(e) => menuStore.setDailyOption1({ segundo: e.target.value })}
                  className="h-12 bg-muted/30 focus:bg-background transition-all border-muted-foreground/20 focus:border-primary text-base"
                />
              </div>
            </CardContent>
          </Card>

          {/* Opción 2 */}
          <Card className="border-border shadow-sm hover:shadow-md transition-shadow overflow-hidden group border-l-4 border-l-secondary">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl flex items-center gap-3">
                <div className="bg-secondary text-secondary-foreground w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-sm">2</div>
                Almuerzo Opción 2
              </CardTitle>
              <CardDescription className="text-base">Segunda alternativa de sopa y plato fuerte</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-8 md:grid-cols-2 pt-2">
              <div className="space-y-3">
                <Label className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  <Soup className="h-4 w-4 text-secondary" />
                  Sopa
                </Label>
                <Input 
                  placeholder="Ej: Sopa de Pollo" 
                  value={dailyMenu.opcion2.sopa}
                  onChange={(e) => menuStore.setDailyOption2({ sopa: e.target.value })}
                  className="h-12 bg-muted/30 focus:bg-background transition-all border-muted-foreground/20 focus:border-secondary text-base"
                />
              </div>
              <div className="space-y-3">
                <Label className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  <ChefHat className="h-4 w-4 text-secondary" />
                  Segundo (Plato Fuerte)
                </Label>
                <Input 
                  placeholder="Ej: Carne Apanada" 
                  value={dailyMenu.opcion2.segundo}
                  onChange={(e) => menuStore.setDailyOption2({ segundo: e.target.value })}
                  className="h-12 bg-muted/30 focus:bg-background transition-all border-muted-foreground/20 focus:border-secondary text-base"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          {/* Imagen del Menú */}
          <Card className="border-border shadow-sm h-fit overflow-hidden">
            <CardHeader className="bg-muted/30 border-b">
              <CardTitle className="text-xl flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-primary" />
                Foto del Menú
              </CardTitle>
              <CardDescription>Sube la imagen del menú impreso</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <ImageUpload 
                value={dailyMenu.image}
                onChange={(val) => menuStore.setDailyImage(val)}
                className="min-h-[300px]"
              />
            </CardContent>
          </Card>

          <Button 
            size="lg" 
            className="w-full h-16 text-xl font-bold gap-4 shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all hover:-translate-y-1 active:translate-y-0.5 rounded-2xl"
            onClick={handleSendMenu}
            disabled={isSending}
          >
            {isSending ? (
              <div className="animate-spin rounded-full h-6 w-6 border-3 border-primary-foreground border-t-transparent" />
            ) : (
              <Send className="h-6 w-6" />
            )}
            {isSending ? 'Enviando...' : 'ENVIAR MENÚ'}
          </Button>
          
          <p className="text-center text-sm text-muted-foreground px-4">
            Al presionar enviar, el menú se compartirá con todos los contactos de WhatsApp registrados.
          </p>
        </div>
      </div>
    </div>
  );
}
