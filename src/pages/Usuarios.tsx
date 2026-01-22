import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Plus, Pencil, Trash2, UserCog } from 'lucide-react';
import { toast } from 'sonner';

interface CajaUser {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  activo: boolean;
  fechaCreacion: string;
}

const initialUsers: CajaUser[] = [
  {
    id: '1',
    nombre: 'María García',
    email: 'maria.garcia@ecencia.com',
    telefono: '3001234567',
    activo: true,
    fechaCreacion: '2024-01-15',
  },
  {
    id: '2',
    nombre: 'Carlos López',
    email: 'carlos.lopez@ecencia.com',
    telefono: '3009876543',
    activo: true,
    fechaCreacion: '2024-02-20',
  },
  {
    id: '3',
    nombre: 'Ana Martínez',
    email: 'ana.martinez@ecencia.com',
    telefono: '3005551234',
    activo: false,
    fechaCreacion: '2024-03-10',
  },
];

export default function Usuarios() {
  const [users, setUsers] = useState<CajaUser[]>(initialUsers);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<CajaUser | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    password: '',
    confirmPassword: '',
  });

  const resetForm = () => {
    setFormData({
      nombre: '',
      email: '',
      telefono: '',
      password: '',
      confirmPassword: '',
    });
  };

  const handleCreate = () => {
    if (!formData.nombre || !formData.email || !formData.password) {
      toast.error('Complete todos los campos requeridos');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }
    if (formData.password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    const newUser: CajaUser = {
      id: Date.now().toString(),
      nombre: formData.nombre,
      email: formData.email,
      telefono: formData.telefono,
      activo: true,
      fechaCreacion: new Date().toISOString().split('T')[0],
    };

    setUsers([...users, newUser]);
    setIsCreateOpen(false);
    resetForm();
    toast.success('Usuario de caja creado exitosamente');
  };

  const handleEdit = () => {
    if (!selectedUser) return;
    if (!formData.nombre || !formData.email) {
      toast.error('Complete todos los campos requeridos');
      return;
    }
    if (formData.password && formData.password !== formData.confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }
    if (formData.password && formData.password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setUsers(
      users.map((u) =>
        u.id === selectedUser.id
          ? { ...u, nombre: formData.nombre, email: formData.email, telefono: formData.telefono }
          : u
      )
    );
    setIsEditOpen(false);
    setSelectedUser(null);
    resetForm();
    toast.success('Usuario actualizado exitosamente');
  };

  const handleDelete = (id: string) => {
    setUsers(users.filter((u) => u.id !== id));
    toast.success('Usuario eliminado');
  };

  const handleToggleActive = (id: string) => {
    setUsers(
      users.map((u) =>
        u.id === id ? { ...u, activo: !u.activo } : u
      )
    );
    toast.success('Estado del usuario actualizado');
  };

  const openEditDialog = (user: CajaUser) => {
    setSelectedUser(user);
    setFormData({
      nombre: user.nombre,
      email: user.email,
      telefono: user.telefono,
      password: '',
      confirmPassword: '',
    });
    setIsEditOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Usuarios de Caja</h1>
          <p className="text-muted-foreground">Gestiona los perfiles de usuarios con rol de caja</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Usuario
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <UserCog className="h-5 w-5" />
                Crear Usuario de Caja
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre completo *</Label>
                <Input
                  id="nombre"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  placeholder="Nombre del usuario"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="correo@ejemplo.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefono">Teléfono</Label>
                <Input
                  id="telefono"
                  value={formData.telefono}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                  placeholder="3001234567"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña *</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Mínimo 6 caracteres"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar contraseña *</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="Repetir contraseña"
                />
              </div>
              <Button onClick={handleCreate} className="w-full">
                Crear Usuario
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Usuarios</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Correo</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Fecha creación</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.nombre}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.telefono || '-'}</TableCell>
                  <TableCell>{user.fechaCreacion}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={user.activo}
                        onCheckedChange={() => handleToggleActive(user.id)}
                      />
                      <Badge variant={user.activo ? 'default' : 'secondary'}>
                        {user.activo ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(user)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(user.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="h-5 w-5" />
              Editar Usuario
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-nombre">Nombre completo *</Label>
              <Input
                id="edit-nombre"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Correo electrónico *</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-telefono">Teléfono</Label>
              <Input
                id="edit-telefono"
                value={formData.telefono}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-password">Nueva contraseña (dejar vacío para mantener)</Label>
              <Input
                id="edit-password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Nueva contraseña"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-confirmPassword">Confirmar nueva contraseña</Label>
              <Input
                id="edit-confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                placeholder="Repetir contraseña"
              />
            </div>
            <Button onClick={handleEdit} className="w-full">
              Guardar Cambios
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
