import { Check, X } from 'lucide-react';

interface PasswordRequirementsProps {
  password: string;
}

export function PasswordRequirements({ password }: PasswordRequirementsProps) {
  const reqs = [
    { label: 'Al menos 8 caracteres', isValid: password.length >= 8 },
    { label: 'Una letra mayúscula', isValid: /[A-Z]/.test(password) },
    { label: 'Una letra minúscula', isValid: /[a-z]/.test(password) },
    { label: 'Un número', isValid: /[0-9]/.test(password) },
    { label: 'Un carácter especial (@, $, !, etc.)', isValid: /[^A-Za-z0-9]/.test(password) },
  ];

  if (!password) return null;

  return (
    <div className="mt-2 space-y-1 rounded-md border p-3 bg-muted/20">
      <p className="text-sm font-medium mb-2">La contraseña debe contener:</p>
      {reqs.map((req, i) => (
        <div key={i} className="flex items-center gap-2 text-xs">
          {req.isValid ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <X className="h-4 w-4 text-destructive" />
          )}
          <span className={req.isValid ? 'text-muted-foreground line-through' : 'text-destructive font-medium'}>
            {req.label}
          </span>
        </div>
      ))}
    </div>
  );
}
