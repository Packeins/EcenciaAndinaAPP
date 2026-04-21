import { useState, useEffect } from 'react';
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
import { Switch } from '@/components/ui/switch';
import { Plus, Pencil, Trash2, UserCog, KeyRound } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface Empleado {
  id: string;
  nombre: string;
  apellido: string;
  correo: string;
  nombre_usuario: string;
  esta_activo: boolean;
  created_at: string;
  roles?: { nombre_rol: string };
}

export default function Usuarios() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<Empleado[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Empleado | null>(null);

  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [userToToggle, setUserToToggle] = useState<Empleado | null>(null);

  useEffect(() => {
    fetchEmpleados();
  }, []);

  const fetchEmpleados = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/empleados', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Error fetching empleados:', error);
      toast.error('Error al cargar empleados');
    }
  };

  const handleCreate = () => {
    toast.info('Crear usuarios requiere agregar permisos al backend. (Paso pospuesto)');
    setIsCreateOpen(false);
  };

  const handleEdit = () => {
    toast.info('La edición de usuarios requiere agregar permisos al backend.');
    setIsEditOpen(false);
  };

  const handleDelete = (id: string) => {
    toast.info('Eliminar empleados en construcción.');
  };

  const handleResetPassword = async (id: string, nombre: string) => {
    try {
      const response = await fetch(`http://localhost:3001/api/empleados/${id}/reset-password`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const data = await response.json();
      if (response.ok) {
        toast.success(data.mensaje || `Enlace enviado a ${nombre}`);
      } else {
        toast.error(data.error || 'Error al enviar enlace de recuperación');
      }
    } catch (error) {
      console.error(error);
      toast.error('Error de conexión');
    }
  };

  const handleToggleClick = (user: Empleado) => {
    if (user.esta_activo) {
      // Pedir confirmación para desactivar
      setUserToToggle(user);
      setIsAlertOpen(true);
    } else {
      // Activar directamente
      confirmToggle(user.id, true);
    }
  };

  const confirmToggle = async (id: string, newState: boolean) => {
    try {
      const response = await fetch(`http://localhost:3001/api/empleados/${id}/estado`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ esta_activo: newState })
      });
      
      if (response.ok) {
        setUsers(users.map(u => u.id === id ? { ...u, esta_activo: newState } : u));
        
        const nombreEmpleado = users.find(u => u.id === id)?.nombre || 'El empleado';
        
        if (newState) {
          toast.success(`Acceso concedido: ${nombreEmpleado} puede ingresar al sistema nuevamente.`);
        } else {
          toast.success(`Acceso revocado: ${nombreEmpleado} ya no podrá iniciar sesión.`);
        }
      } else {
        toast.error('Error al cambiar el estado del empleado');
      }
    } catch (error) {
      console.error(error);
      toast.error('Error de conexión');
    } finally {
      setIsAlertOpen(false);
      setUserToToggle(null);
    }
  };

  const openEditDialog = (user: Empleado) => {
    setSelectedUser(user);
    setIsEditOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Empleados</h1>
          <p className="text-muted-foreground">Lista oficial de empleados (Datos de Supabase)</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Empleado
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <UserCog className="h-5 w-5" />
                Crear Empleado (Próximamente)
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <p className="text-sm text-muted-foreground">Esta función requiere que agregues la Llave Maestra (service_role) en tu archivo .env para poder crear la contraseña de este empleado. Lo habilitaremos luego.</p>
              <Button onClick={() => setIsCreateOpen(false)} className="w-full">
                Cerrar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Base de Datos: Empleados</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre Completo</TableHead>
                <TableHead>Usuario</TableHead>
                <TableHead>Correo</TableHead>
                <TableHead>Rol Asignado</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.nombre} {user.apellido}</TableCell>
                  <TableCell>{user.nombre_usuario}</TableCell>
                  <TableCell>{user.correo}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{user.roles?.nombre_rol || 'Sin rol'}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        disabled={currentUser?.id === user.id}
                        checked={user.esta_activo}
                        onCheckedChange={() => handleToggleClick(user)}
                      />
                      <Badge variant={user.esta_activo ? 'default' : 'secondary'}>
                        {user.esta_activo ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleResetPassword(user.id, user.nombre)}
                        title="Enviar enlace de recuperación de contraseña"
                      >
                        <KeyRound className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(user)}
                        title="Editar empleado"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={currentUser?.id === user.id}
                        onClick={() => handleDelete(user.id)}
                        className="text-destructive hover:text-destructive disabled:opacity-50"
                        title="Eliminar empleado"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {users.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                    Cargando datos desde tu base de datos Supabase...
                  </TableCell>
                </TableRow>
              )}
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
              Editar Empleado
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">La edición completa (como cambiar la contraseña de un usuario) también requiere la configuración adicional que decidimos posponer.</p>
            <Button onClick={() => setIsEditOpen(false)} className="w-full">Cerrar</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirmation Alert Dialog */}
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Desactivar empleado?</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Está seguro que desea desactivar a <strong>{userToToggle?.nombre} {userToToggle?.apellido}</strong>? 
              <br/><br/>
              Este empleado ya no podrá iniciar sesión en el sistema hasta que vuelva a ser activado.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setUserToToggle(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => userToToggle && confirmToggle(userToToggle.id, false)} 
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
