import { Badge } from '@/components/ui/badge';
import { ClientType } from '@/types';
import { cn } from '@/lib/utils';
import { Building2, User } from 'lucide-react';

interface ClientTypeBadgeProps {
  type: ClientType;
}

export function ClientTypeBadge({ type }: ClientTypeBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(
        'gap-1',
        type === 'convenio'
          ? 'border-primary/50 text-primary'
          : 'border-secondary text-secondary-foreground',
      )}
    >
      {type === 'convenio' ? <Building2 className="h-3 w-3" /> : <User className="h-3 w-3" />}
      {type === 'convenio' ? 'Convenio' : 'Cliente'}
    </Badge>
  );
}
