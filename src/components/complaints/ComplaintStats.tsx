import { useLanguage } from '@/contexts/LanguageContext';
import { StatCard } from '@/components/ui/stat-card';
import { FileText, Clock, CheckCircle, XCircle, Lightbulb } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';

type Complaint = Tables<'complaints'>;

interface ComplaintStatsProps {
  complaints: Complaint[];
}

export function ComplaintStats({ complaints }: ComplaintStatsProps) {
  const { language } = useLanguage();

  const stats = {
    total: complaints.length,
    complaints: complaints.filter(c => c.type === 'complaint').length,
    suggestions: complaints.filter(c => c.type === 'suggestion').length,
    pending: complaints.filter(c => c.status === 'pending').length,
    inProgress: complaints.filter(c => c.status === 'in_progress').length,
    resolved: complaints.filter(c => c.status === 'resolved').length,
    rejected: complaints.filter(c => c.status === 'rejected').length,
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
      <StatCard
        title={language === 'ms' ? 'Jumlah' : 'Total'}
        value={stats.total}
        icon={FileText}
        variant="default"
      />
      <StatCard
        title={language === 'ms' ? 'Aduan' : 'Complaints'}
        value={stats.complaints}
        icon={FileText}
        variant="danger"
      />
      <StatCard
        title={language === 'ms' ? 'Cadangan' : 'Suggestions'}
        value={stats.suggestions}
        icon={Lightbulb}
        variant="warning"
      />
      <StatCard
        title={language === 'ms' ? 'Tertunda' : 'Pending'}
        value={stats.pending}
        icon={Clock}
        variant="warning"
      />
      <StatCard
        title={language === 'ms' ? 'Selesai' : 'Resolved'}
        value={stats.resolved}
        icon={CheckCircle}
        variant="success"
      />
    </div>
  );
}
