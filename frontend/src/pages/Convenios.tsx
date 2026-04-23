import { useState, useEffect } from 'react';
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
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Plus, Pencil, Users, Building2, Mail, Phone, CalendarDays, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { apiFetch } from '@/lib/api';

export default function Convenios() {
  const [convenios, setConvenios] = useState<Convenio[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingConvenio, setEditingConvenio] = useState<Convenio | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Confirmación para toggle activo/inactivo
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [convenioToToggle, setConvenioToToggle] = useState<Convenio | null>(null);

  const [formData, setFormData] = useState({
    ruc: '',
    nombre_empresa: '',
    representante: '',
    telefono: '',
    email: '',
    fecha_inicio: '',
    fecha_caducidad: '',
  });

  // --- CARGAR CONVENIOS DESDE EL BACKEND ---
  useEffect(() => {
    fetchConvenios();
  }, []);

  const fetchConvenios = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiFetch('http://localhost:3001/api/convenios');
      const data = await response.json();

      if (response.ok) {
        setConvenios(data);
      } else {
        setError(data.error || 'Error al obtener convenios');
        toast.error(data.error || 'Error al cargar convenios');
      }
    } catch (err) {
      console.error('Error fetching convenios:', err);
      setError('Error de conexión con el servidor');
      toast.error('Error de conexión con el servidor');
    } finally {
      setIsLoading(false);
    }
  };

  // --- FORMULARIO: ABRIR NUEVO ---
  const handleOpenNew = () => {
    setEditingConvenio(null);
    setFormData({
      ruc: '',
      nombre_empresa: '',
      representante: '',
      telefono: '',
      email: '',
      fecha_inicio: '',
      fecha_caducidad: '',
    });
    setDialogOpen(true);
  };

  // --- FORMULARIO: ABRIR EDICIÓN ---
  const handleEdit = (convenio: Convenio) => {
    setEditingConvenio(convenio);
    setFormData({
      ruc: convenio.ruc,
      nombre_empresa: convenio.nombre_empresa,
      representante: convenio.representante,
      telefono: convenio.telefono,
      email: convenio.email,
      fecha_inicio: convenio.fecha_inicio,
      fecha_caducidad: convenio.fecha_caducidad,
    });
    setDialogOpen(true);
  };

  // --- GUARDAR (CREAR O ACTUALIZAR) ---
  const handleSave = async () => {
    if (
      !formData.ruc ||
      !formData.nombre_empresa ||
      !formData.fecha_inicio ||
      !formData.fecha_caducidad
    ) {
      toast.error('RUC, empresa, fecha inicio y fecha caducidad son requeridos');
      return;
    }

    setIsSaving(true);
    try {
      if (editingConvenio) {
        // ACTUALIZAR
        const response = await apiFetch(
          `http://localhost:3001/api/convenios/${editingConvenio.id}`,
          {
            method: 'PUT',
            body: JSON.stringify(formData),
          },
        );
        const data = await response.json();

        if (response.ok) {
          setConvenios(convenios.map((c) => (c.id === editingConvenio.id ? data : c)));
          toast.success('Convenio actualizado correctamente');
          setDialogOpen(false);
        } else {
          toast.error(data.error || 'Error al actualizar el convenio');
        }
      } else {
        // CREAR
        const response = await apiFetch('http://localhost:3001/api/convenios', {
          method: 'POST',
          body: JSON.stringify(formData),
        });
        const data = await response.json();

        if (response.ok) {
          setConvenios([data, ...convenios]);
          toast.success('Convenio creado correctamente');
          setDialogOpen(false);
        } else {
          toast.error(data.error || 'Error al crear el convenio');
        }
      }
    } catch (err) {
      console.error('Error guardando convenio:', err);
      toast.error('Error de conexión con el servidor');
    } finally {
      setIsSaving(false);
    }
  };

  // --- TOGGLE ACTIVO/INACTIVO ---
  const handleToggleClick = (convenio: Convenio) => {
    if (convenio.activo) {
      // Pedir confirmación para desactivar
      setConvenioToToggle(convenio);
      setIsAlertOpen(true);
    } else {
      // Activar directamente
      confirmToggle(convenio.id, true);
    }
  };

  const confirmToggle = async (id: string, newState: boolean) => {
    try {
      const response = await apiFetch(`http://localhost:3001/api/convenios/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ activo: newState }),
      });

      if (response.ok) {
        const data = await response.json();
        setConvenios(convenios.map((c) => (c.id === id ? data : c)));

        const nombre = convenios.find((c) => c.id === id)?.nombre_empresa || 'El convenio';
        toast.success(newState ? `${nombre} ha sido activado.` : `${nombre} ha sido desactivado.`);
      } else {
        const data = await response.json();
        toast.error(data.error || 'Error al cambiar el estado');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error de conexión');
    } finally {
      setIsAlertOpen(false);
      setConvenioToToggle(null);
    }
  };

  // --- Helpers ---
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '—';
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('es-EC', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const isExpired = (fechaCaducidad: string) => {
    if (!fechaCaducidad) return false;
    return new Date(fechaCaducidad + 'T23:59:59') < new Date();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Convenios</h1>
          <p className="text-muted-foreground">Gestión de convenios empresariales</p>
        </div>
        <Button onClick={handleOpenNew} className="gap-2">
          <Plus className="h-4 w-4" />
          Nuevo Convenio
        </Button>
      </div>

      {/* Convenios Grid */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="animate-pulse text-muted-foreground">Cargando convenios...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16">
          <p className="font-semibold text-destructive">Ocurrió un error</p>
          <p className="text-sm text-muted-foreground">{error}</p>
          <Button variant="outline" size="sm" onClick={fetchConvenios} className="mt-2">
            Reintentar
          </Button>
        </div>
      ) : convenios.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground">
          <Building2 className="h-12 w-12 opacity-30" />
          <p>No hay convenios registrados.</p>
          <Button variant="outline" size="sm" onClick={handleOpenNew}>
            Crear el primero
          </Button>
        </div>
      ) : (
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
                      <CardTitle className="text-lg text-foreground">
                        {convenio.nombre_empresa}
                      </CardTitle>
                      <CardDescription>RUC: {convenio.ruc}</CardDescription>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge variant={convenio.activo ? 'default' : 'secondary'}>
                      {convenio.activo ? 'Activo' : 'Inactivo'}
                    </Badge>
                    {isExpired(convenio.fecha_caducidad) && (
                      <Badge variant="destructive" className="text-xs">
                        Vencido
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span className="text-foreground">{convenio.representante || '—'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <span className="text-foreground">{convenio.telefono || '—'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span className="text-foreground">{convenio.email || '—'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <CalendarDays className="h-4 w-4" />
                    <span className="text-xs text-foreground">
                      {formatDate(convenio.fecha_inicio)} — {formatDate(convenio.fecha_caducidad)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-lg bg-accent p-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Colaboradores</p>
                    <p className="font-semibold text-foreground">{convenio.totalColaboradores}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Consumo Mensual</p>
                    <p className="font-semibold text-foreground">
                      ${convenio.consumoMensual.toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-border pt-2">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={convenio.activo}
                      onCheckedChange={() => handleToggleClick(convenio)}
                    />
                    <span className="text-sm text-muted-foreground">
                      {convenio.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(convenio)}>
                    <Pencil className="mr-1 h-4 w-4" />
                    Editar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

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
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="ruc">RUC *</Label>
                <Input
                  id="ruc"
                  value={formData.ruc}
                  onChange={(e) => setFormData({ ...formData, ruc: e.target.value })}
                  placeholder="Ej: 1790012345001"
                  maxLength={13}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nombre_empresa">Empresa *</Label>
                <Input
                  id="nombre_empresa"
                  value={formData.nombre_empresa}
                  onChange={(e) => setFormData({ ...formData, nombre_empresa: e.target.value })}
                  placeholder="Nombre de la empresa"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="representante">Representante / Contacto</Label>
              <Input
                id="representante"
                value={formData.representante}
                onChange={(e) => setFormData({ ...formData, representante: e.target.value })}
                placeholder="Nombre del representante"
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
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="fecha_inicio">Fecha Inicio *</Label>
                <Input
                  id="fecha_inicio"
                  type="date"
                  value={formData.fecha_inicio}
                  onChange={(e) => setFormData({ ...formData, fecha_inicio: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fecha_caducidad">Fecha Caducidad *</Label>
                <Input
                  id="fecha_caducidad"
                  type="date"
                  value={formData.fecha_caducidad}
                  onChange={(e) => setFormData({ ...formData, fecha_caducidad: e.target.value })}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving
                ? editingConvenio
                  ? 'Guardando...'
                  : 'Creando...'
                : editingConvenio
                  ? 'Guardar Cambios'
                  : 'Crear Convenio'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmación para desactivar */}
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Desactivar convenio?</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Está seguro que desea desactivar el convenio con{' '}
              <strong>{convenioToToggle?.nombre_empresa}</strong>?
              <br />
              <br />
              El convenio quedará inactivo hasta que se reactive manualmente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setConvenioToToggle(null)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => convenioToToggle && confirmToggle(convenioToToggle.id, false)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Sí, desactivar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
