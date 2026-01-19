import { useState } from 'react';
import { mockConvenios } from '@/data/mockData';
import { Convenio } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Pencil, Users, Building2, Mail, Phone } from 'lucide-react';
import { toast } from 'sonner';

export default function Convenios() {
  const [convenios, setConvenios] = useState<Convenio[]>(mockConvenios);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingConvenio, setEditingConvenio] = useState<Convenio | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    empresa: '',
    contacto: '',
    telefono: '',
    email: '',
  });

  const handleOpenNew = () => {
    setEditingConvenio(null);
    setFormData({ nombre: '', empresa: '', contacto: '', telefono: '', email: '' });
    setDialogOpen(true);
  };

  const handleEdit = (convenio: Convenio) => {
    setEditingConvenio(convenio);
    setFormData({
      nombre: convenio.nombre,
      empresa: convenio.empresa,
      contacto: convenio.contacto,
      telefono: convenio.telefono,
      email: convenio.email,
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.nombre || !formData.empresa) {
      toast.error('Nombre y empresa son requeridos');
      return;
    }

    if (editingConvenio) {
      setConvenios(
        convenios.map((c) =>
          c.id === editingConvenio.id ? { ...c, ...formData } : c
        )
      );
      toast.success('Convenio actualizado correctamente');
    } else {
      const newConvenio: Convenio = {
        id: Date.now().toString(),
        ...formData,
        activo: true,
        colaboradores: [],
        consumoMensual: 0,
      };
      setConvenios([...convenios, newConvenio]);
      toast.success('Convenio creado correctamente');
    }
    setDialogOpen(false);
  };

  const handleToggleActive = (id: string) => {
    setConvenios(
      convenios.map((c) => (c.id === id ? { ...c, activo: !c.activo } : c))
    );
    toast.success('Estado del convenio actualizado');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Convenios</h1>
          <p className="text-muted-foreground">
            Gestión de convenios empresariales
          </p>
        </div>
        <Button onClick={handleOpenNew} className="gap-2">
          <Plus className="h-4 w-4" />
          Nuevo Convenio
        </Button>
      </div>

      {/* Convenios Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {convenios.map((convenio) => (
          <Card key={convenio.id} className="border-border">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg text-foreground">{convenio.nombre}</CardTitle>
                    <CardDescription>{convenio.empresa}</CardDescription>
                  </div>
                </div>
                <Badge variant={convenio.activo ? 'default' : 'secondary'}>
                  {convenio.activo ? 'Activo' : 'Inactivo'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span className="text-foreground">{convenio.contacto}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <span className="text-foreground">{convenio.telefono}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span className="text-foreground">{convenio.email}</span>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-lg bg-accent p-3">
                <div>
                  <p className="text-xs text-muted-foreground">Colaboradores</p>
                  <p className="font-semibold text-foreground">{convenio.colaboradores.length}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Consumo Mensual</p>
                  <p className="font-semibold text-foreground">${convenio.consumoMensual.toFixed(2)}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-border">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={convenio.activo}
                    onCheckedChange={() => handleToggleActive(convenio.id)}
                  />
                  <span className="text-sm text-muted-foreground">
                    {convenio.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
                <Button variant="ghost" size="sm" onClick={() => handleEdit(convenio)}>
                  <Pencil className="h-4 w-4 mr-1" />
                  Editar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Dialog for Create/Edit */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-foreground">
              {editingConvenio ? 'Editar Convenio' : 'Nuevo Convenio'}
            </DialogTitle>
            <DialogDescription>
              {editingConvenio
                ? 'Modifique los datos del convenio'
                : 'Complete los datos del nuevo convenio empresarial'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre del Convenio</Label>
              <Input
                id="nombre"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                placeholder="Ej: Convenio TechCorp"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="empresa">Empresa</Label>
              <Input
                id="empresa"
                value={formData.empresa}
                onChange={(e) => setFormData({ ...formData, empresa: e.target.value })}
                placeholder="Nombre de la empresa"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contacto">Persona de Contacto</Label>
              <Input
                id="contacto"
                value={formData.contacto}
                onChange={(e) => setFormData({ ...formData, contacto: e.target.value })}
                placeholder="Nombre del contacto"
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="telefono">Teléfono</Label>
                <Input
                  id="telefono"
                  value={formData.telefono}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                  placeholder="+593 999999999"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="correo@empresa.com"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>
              {editingConvenio ? 'Guardar Cambios' : 'Crear Convenio'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
