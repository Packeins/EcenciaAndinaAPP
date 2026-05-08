import { Badge } from '@/components/ui/badge';
import { OrderState } from '@/types';
import { cn } from '@/lib/utils';

interface OrderStatusBadgeProps {
  status: OrderState;
}

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  return (
    <Badge
      className={cn(
        'capitalize font-bold px-3 py-1 border-none shadow-sm',
        status === 'reservado' && 'bg-oro text-white hover:bg-oro/90',
        status === 'consumido' && 'bg-primary text-white hover:bg-primary/90',
        status === 'cancelado' && 'bg-terracota text-white hover:bg-terracota/90',
      )}
    >
      {status}
    </Badge>
  );
}
