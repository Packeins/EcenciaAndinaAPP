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
        'capitalize',
        status === 'reservado'
          ? 'bg-amber-100 text-amber-800 hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400'
          : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400'
      )}
    >
      {status}
    </Badge>
  );
}
