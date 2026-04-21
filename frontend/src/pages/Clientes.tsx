import { useState } from 'react';
import { mockClients } from '@/data/mockData';
import { Client } from '@/types';
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Pencil, User, Phone, Search } from 'lucide-react';
import { toast } from 'sonner';

export default function Clientes() {
  const [clients, setClients] = useState<Client[]>(
    mockClients.filter((c) => c.tipo === 'frecuente')
  );
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    nombre: '',
    whatsapp: '',
    maxAlmuerzos: 5,
  });

  const filteredClients = clients.filter(
    (c) =>
      c.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.whatsapp.includes(searchTerm)
  );

  const handleOpenNew = () => {
    setEditingClient(null);
    setFormData({ nombre: '', whatsapp: '', maxAlmuerzos: 5 });
    setDialogOpen(true);
  };

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setFormData({
      nombre: client.nombre,
      whatsapp: client.whatsapp,
      maxAlmuerzos: client.maxAlmuerzos || 5,
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.nombre || !formData.whatsapp) {
      toast.error('Nombre y WhatsApp son requeridos');
      return;
    }

    if (editingClient) {
      setClients(
        clients.map((c) =>
          c.id === editingClient.id
            ? { ...c, ...formData }
            : c
        )
      );
      toast.success('Cliente actualizado correctamente');
    } else {
      const newClient: Client = {
        id: Date.now().toString(),
        nombre: formData.nombre,
        whatsapp: formData.whatsapp,
        tipo: 'frecuente',
        maxAlmuerzos: formData.maxAlmuerzos,
        activo: true,
      };
      setClients([...clients, newClient]);
      toast.success('Cliente registrado correctamente');
    }
    setDialogOpen(false);
  };

  const handleToggleActive = (id: string) => {
    setClients(
      clients.map((c) => (c.id === id ? { ...c, activo: !c.activo } : c))
    );
    toast.success('Estado del cliente actualizado');
  };

  const activeCount = clients.filter((c) => c.activo).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Clientes Frecuentes</h1>
          <p className="text-muted-foreground">
            Gestión de clientes frecuentes registrados
          </p>
        </div>
        <Button onClick={handleOpenNew} className="gap-2">
          <Plus className="h-4 w-4" />
          Nuevo Cliente
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-border">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{clients.length}</p>
                <p className="text-sm text-muted-foreground">Total Registrados</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                <User className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{activeCount}</p>
                <p className="text-sm text-muted-foreground">Clientes Activos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
                <User className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{clients.length - activeCount}</p>
                <p className="text-sm text-muted-foreground">Clientes Inactivos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Clients Table */}
      <Card className="border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-foreground">Lista de Clientes</CardTitle>
              <CardDescription>
                Administre los clientes frecuentes y sus límites
              </CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow className="bg-accent/50">
                  <TableHead>Cliente</TableHead>
                  <TableHead>WhatsApp</TableHead>
                  <TableHead className="text-center">Máx. Almuerzos</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No se encontraron clientes
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredClients.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent">
                            <User className="h-4 w-4 text-foreground" />
                          </div>
                          <span className="font-medium text-foreground">{client.nombre}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-foreground">
                          <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                          {client.whatsapp}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className="font-mono">
                          {client.maxAlmuerzos}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={client.activo ? 'default' : 'secondary'}>
                          {client.activo ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end items-center gap-2">
                          <Switch
                            checked={client.activo}
                            onCheckedChange={() => handleToggleActive(client.id)}
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(client)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Dialog for Create/Edit */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-foreground">
              {editingClient ? 'Editar Cliente' : 'Nuevo Cliente Frecuente'}
            </DialogTitle>
            <DialogDescription>
              {editingClient
                ? 'Modifique los datos del cliente'
                : 'Registre un nuevo cliente frecuente'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre Completo</Label>
              <Input
                id="nombre"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                placeholder="Nombre del cliente"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="whatsapp">Número de WhatsApp</Label>
              <Input
                id="whatsapp"
                value={formData.whatsapp}
                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                placeholder="+593 999999999"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxAlmuerzos">Máximo de Almuerzos por Día</Label>
              <Input
                id="maxAlmuerzos"
                type="number"
                min={1}
                max={10}
                value={formData.maxAlmuerzos}
                onChange={(e) =>
                  setFormData({ ...formData, maxAlmuerzos: parseInt(e.target.value) || 1 })
                }
              />
              <p className="text-xs text-muted-foreground">
                Cantidad máxima de almuerzos que puede solicitar por día
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>
              {editingClient ? 'Guardar Cambios' : 'Registrar Cliente'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
