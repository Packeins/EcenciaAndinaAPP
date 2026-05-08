import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UtensilsCrossed, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { PasswordRequirements } from '@/components/auth/PasswordRequirements';
import { API_BASE_URL } from '@/lib/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && !window.location.hash.includes('type=recovery')) {
      navigate(user.rol === 'administrador' ? '/dashboard' : '/pedidos');
    }
  }, [user, navigate]);

  // Recovery mode state
  const [recoveryToken, setRecoveryToken] = useState<string | null>(null);
  const [recoveryUserName, setRecoveryUserName] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  const isPasswordValid = (pwd: string) => {
    return (
      pwd.length >= 8 &&
      /[A-Z]/.test(pwd) &&
      /[a-z]/.test(pwd) &&
      /[0-9]/.test(pwd) &&
      /[^A-Za-z0-9]/.test(pwd)
    );
  };

  useEffect(() => {
    // Detectar si venimos de un enlace de recuperación de Supabase
    const hash = window.location.hash;
    if (hash && hash.includes('type=recovery')) {
      // Parsear el hash como URLSearchParams
      const params = new URLSearchParams(hash.substring(1));
      const token = params.get('access_token');
      if (token) {
        setRecoveryToken(token);

        // Obtener el nombre del usuario con este token
        fetch(`${API_BASE_URL}/empleados/perfil`, {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then((res) => res.json())
          .then((data) => {
            if (data && data.nombre) {
              setRecoveryUserName(data.nombre);
            }
          })
          .catch((err) => console.error('Error fetching user profile:', err));
      }
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Por favor complete todos los campos');
      return;
    }

    const result = await login(email, password);
    if (result.success) {
      toast.success('Bienvenido al sistema');
      navigate(result.rol === 'administrador' ? '/dashboard' : '/pedidos');
    } else {
      toast.error(result.message || 'Credenciales inválidas');
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Password strength validation
    if (newPassword.length < 8) {
      toast.error('La contraseña debe tener al menos 8 caracteres');
      return;
    }
    if (!/[A-Z]/.test(newPassword)) {
      toast.error('La contraseña debe incluir al menos una letra mayúscula');
      return;
    }
    if (!/[a-z]/.test(newPassword)) {
      toast.error('La contraseña debe incluir al menos una letra minúscula');
      return;
    }
    if (!/[0-9]/.test(newPassword)) {
      toast.error('La contraseña debe incluir al menos un número');
      return;
    }
    if (!/[^A-Za-z0-9]/.test(newPassword)) {
      toast.error('La contraseña debe incluir al menos un carácter especial');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    setIsResetting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/empleados/perfil/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${recoveryToken}`,
        },
        body: JSON.stringify({ password: newPassword }),
      });

      if (response.ok) {
        toast.success('Contraseña actualizada exitosamente. Ya puede iniciar sesión.');
        setRecoveryToken(null);
        setNewPassword('');
        setConfirmPassword('');
        window.location.hash = ''; // Limpiar la url
      } else {
        const data = await response.json();
        toast.error(data.error || 'Error al restablecer la contraseña');
      }
    } catch (error) {
      console.error(error);
      toast.error('Error de conexión');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-3 pb-6 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-sm">
            <UtensilsCrossed className="h-8 w-8 text-primary-foreground" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold tracking-tight text-primary">
              {recoveryToken ? 'Restablecer Contraseña' : 'ECencia Andina'}
            </CardTitle>
            <CardDescription className="mt-1 text-sm">
              {recoveryToken
                ? recoveryUserName
                  ? `Bienvenido ${recoveryUserName}, a continuación podrá restablecer su contraseña`
                  : 'Por favor ingrese su nueva contraseña'
                : 'Sistema de Gestión de Almuerzos'}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {recoveryToken ? (
            <form onSubmit={handleResetSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">Nueva Contraseña</Label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="Escriba su nueva contraseña"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <PasswordRequirements password={newPassword} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Repita la nueva contraseña"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                {confirmPassword && (
                  <p
                    className={`mt-1.5 flex items-center gap-1 text-xs font-medium ${newPassword === confirmPassword ? 'text-green-500' : 'text-destructive'}`}
                  >
                    {newPassword === confirmPassword
                      ? '✓ Las contraseñas coinciden'
                      : '✗ Las contraseñas no coinciden'}
                  </p>
                )}
              </div>
              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={
                  isResetting ||
                  !newPassword ||
                  newPassword !== confirmPassword ||
                  !isPasswordValid(newPassword)
                }
              >
                {isResetting ? 'Actualizando...' : 'Guardar y Continuar'}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Usuario o Correo</Label>
                <Input
                  id="email"
                  type="text"
                  placeholder="Ingrese su nombre de usuario o correo"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Ingrese su contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <Button type="submit" className="w-full" size="lg">
                Iniciar Sesión
              </Button>
            </form>
          )}
          <p className="mt-4 text-center text-xs text-muted-foreground">
            {recoveryToken
              ? 'Asegúrese de usar una contraseña segura'
              : 'Ingrese sus credenciales oficiales para acceder al sistema.'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
