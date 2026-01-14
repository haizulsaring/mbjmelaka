import { cn } from '@/lib/utils';

type StatusType = 'pending' | 'in_progress' | 'resolved' | 'completed' | 'cancelled' | 'scheduled' | 'rejected' | 'overdue';

interface StatusBadgeProps {
  status: StatusType | string;
  className?: string;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  pending: { label: 'Tertunda', className: 'bg-warning/20 text-warning border-warning/30' },
  in_progress: { label: 'Dalam Proses', className: 'bg-primary/20 text-primary border-primary/30' },
  resolved: { label: 'Selesai', className: 'bg-success/20 text-success border-success/30' },
  completed: { label: 'Selesai', className: 'bg-success/20 text-success border-success/30' },
  cancelled: { label: 'Dibatalkan', className: 'bg-muted text-muted-foreground border-muted-foreground/30' },
  scheduled: { label: 'Dijadualkan', className: 'bg-primary/20 text-primary border-primary/30' },
  rejected: { label: 'Ditolak', className: 'bg-destructive/20 text-destructive border-destructive/30' },
  overdue: { label: 'Terlewat', className: 'bg-destructive/20 text-destructive border-destructive/30' },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] || { label: status, className: 'bg-muted text-muted-foreground' };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}
