import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { UserCog, KeyRound } from 'lucide-react';

export default function Perfil() {
  const { user, updateProfile } = useAuth();
  const [isSavingData, setIsSavingData] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    nombre_usuario: '',
  });

  const [passwordData, setPasswordData] = useState({
    password: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        nombre: user.nombre || '',
        apellido: user.apellido || '',
        nombre_usuario: user.nombre_usuario || '',
      });
    }
  }, [user]);

  const handleSaveData = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombre || !formData.apellido || !formData.nombre_usuario) {
      toast.error('Por favor complete todos los campos');
      return;
    }

    setIsSavingData(true);
    try {
      const response = await fetch('http://localhost:3001/api/empleados/perfil', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        const data = await response.json();
        updateProfile({
          nombre: formData.nombre,
          apellido: formData.apellido,
          nombre_usuario: formData.nombre_usuario
        });
        toast.success(data.mensaje || 'Perfil actualizado exitosamente');
      } else {
        const err = await response.json();
        toast.error(err.error || 'Error al actualizar el perfil');
      }
    } catch (error) {
      console.error(error);
      toast.error('Error de conexión');
    } finally {
      setIsSavingData(false);
    }
  };

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordData.password || !passwordData.confirmPassword) {
      toast.error('Por favor complete ambas contraseñas');
      return;
    }
    if (passwordData.password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    if (passwordData.password !== passwordData.confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    setIsSavingPassword(true);
    try {
      const response = await fetch('http://localhost:3001/api/empleados/perfil/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ password: passwordData.password })
      });
      
      if (response.ok) {
        toast.success('Contraseña actualizada correctamente');
        setPasswordData({ password: '', confirmPassword: '' });
      } else {
        const err = await response.json();
        toast.error(err.error || 'Error al actualizar la contraseña');
      }
    } catch (error) {
      console.error(error);
      toast.error('Error de conexión');
    } finally {
      setIsSavingPassword(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Mi Perfil</h1>
        <p className="text-muted-foreground">Administre su información personal y credenciales de acceso</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Datos Personales */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCog className="h-5 w-5" />
              Datos Personales
            </CardTitle>
            <CardDescription>Actualice su información básica de empleado</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveData} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre</Label>
                  <Input
                    id="nombre"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="apellido">Apellido</Label>
                  <Input
                    id="apellido"
                    value={formData.apellido}
                    onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="nombre_usuario">Nombre de Usuario (Login)</Label>
                <Input
                  id="nombre_usuario"
                  value={formData.nombre_usuario}
                  onChange={(e) => setFormData({ ...formData, nombre_usuario: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Correo Electrónico</Label>
                <Input
                  id="email"
                  value={user?.email || ''}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">El correo electrónico no puede modificarse ya que es su identificador único en el sistema.</p>
              </div>
              <Button type="submit" className="w-full" disabled={isSavingData}>
                {isSavingData ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Cambiar Contraseña */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <KeyRound className="h-5 w-5" />
              Seguridad
            </CardTitle>
            <CardDescription>Modifique su contraseña de acceso al sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSavePassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Nueva Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  value={passwordData.password}
                  onChange={(e) => setPasswordData({ ...passwordData, password: e.target.value })}
                  placeholder="Mínimo 6 caracteres"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  placeholder="Repita su nueva contraseña"
                />
              </div>
              <Button type="submit" variant="secondary" className="w-full" disabled={isSavingPassword}>
                {isSavingPassword ? 'Actualizando...' : 'Actualizar Contraseña'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
