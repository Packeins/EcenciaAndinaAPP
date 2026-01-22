import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  ClipboardList,
  FileBarChart,
  Building2,
  Users,
  LogOut,
  UtensilsCrossed,
  UserCog,
  KeyRound,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  roles: ('administrador' | 'caja')[];
}

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    path: '/dashboard',
    icon: <LayoutDashboard className="h-5 w-5" />,
    roles: ['administrador'],
  },
  {
    label: 'Pedidos',
    path: '/pedidos',
    icon: <ClipboardList className="h-5 w-5" />,
    roles: ['caja', 'administrador'],
  },
  {
    label: 'Reportes',
    path: '/reportes',
    icon: <FileBarChart className="h-5 w-5" />,
    roles: ['administrador'],
  },
  {
    label: 'Convenios',
    path: '/convenios',
    icon: <Building2 className="h-5 w-5" />,
    roles: ['administrador'],
  },
  {
    label: 'Clientes Frecuentes',
    path: '/clientes',
    icon: <Users className="h-5 w-5" />,
    roles: ['administrador'],
  },
  {
    label: 'Usuarios Caja',
    path: '/usuarios',
    icon: <UserCog className="h-5 w-5" />,
    roles: ['administrador'],
  },
];

export function Sidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isRecoveryOpen, setIsRecoveryOpen] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');

  const filteredNavItems = navItems.filter(
    (item) => user && item.roles.includes(user.rol)
  );

  const handlePasswordRecovery = () => {
    if (!recoveryEmail) {
      toast.error('Ingrese un correo electrónico');
      return;
    }
    // Simulate sending recovery email
    toast.success(`Se ha enviado una nueva contraseña a ${recoveryEmail}`);
    setIsRecoveryOpen(false);
    setRecoveryEmail('');
  };

  return (
    <aside className="flex h-screen w-64 flex-col bg-card border-r border-border">
      {/* Logo */}
      <div className="flex items-center gap-3 border-b border-border px-6 py-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
          <UtensilsCrossed className="h-6 w-6 text-primary-foreground" />
        </div>
        <div>
          <h1 className="font-semibold text-foreground">ECencia Andina</h1>
          <p className="text-xs text-muted-foreground">Sistema de Almuerzos</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {filteredNavItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
              location.pathname === item.path
                ? 'bg-primary text-primary-foreground'
                : 'text-foreground hover:bg-accent'
            )}
          >
            {item.icon}
            {item.label}
          </Link>
        ))}
      </nav>

      {/* User Info & Logout */}
      <div className="border-t border-border p-4">
        <div className="mb-3 rounded-lg bg-accent px-3 py-2">
          <p className="text-sm font-medium text-foreground">{user?.nombre}</p>
          <p className="text-xs text-muted-foreground capitalize">{user?.rol}</p>
        </div>
        
        {/* Password Recovery - Only for Admin */}
        {user?.rol === 'administrador' && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 mb-2 text-muted-foreground hover:text-foreground"
            onClick={() => setIsRecoveryOpen(true)}
          >
            <KeyRound className="h-4 w-4" />
            Recuperar Contraseña
          </Button>
        )}
        
        <Button
          variant="outline"
          className="w-full justify-start gap-2"
          onClick={logout}
        >
          <LogOut className="h-4 w-4" />
          Cerrar Sesión
        </Button>
      </div>

      {/* Password Recovery Dialog */}
      <Dialog open={isRecoveryOpen} onOpenChange={setIsRecoveryOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <KeyRound className="h-5 w-5" />
              Recuperar Contraseña
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              Ingrese el correo electrónico de recuperación. Se enviará una nueva contraseña temporal.
            </p>
            <div className="space-y-2">
              <Label htmlFor="recovery-email">Correo de recuperación</Label>
              <Input
                id="recovery-email"
                type="email"
                value={recoveryEmail}
                onChange={(e) => setRecoveryEmail(e.target.value)}
                placeholder="correo@ejemplo.com"
              />
            </div>
            <Button onClick={handlePasswordRecovery} className="w-full">
              Enviar Nueva Contraseña
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </aside>
  );
}
