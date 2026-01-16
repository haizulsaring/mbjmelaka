import { useLanguage } from '@/contexts/LanguageContext';
import { StatCard } from '@/components/ui/stat-card';
import { Users, Shield, UserCog, Crown } from 'lucide-react';
import { Database } from '@/integrations/supabase/types';

type AppRole = Database['public']['Enums']['app_role'];

interface UserWithRole {
  role: AppRole;
}

interface AdminStatsProps {
  users: UserWithRole[];
}

export function AdminStats({ users }: AdminStatsProps) {
  const { language } = useLanguage();

  const totalUsers = users.length;
  const chairmanCount = users.filter((u) => u.role === 'chairman').length;
  const committeeCount = users.filter((u) => u.role === 'committee').length;
  const staffCount = users.filter((u) => u.role === 'staff').length;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title={language === 'ms' ? 'Jumlah Pengguna' : 'Total Users'}
        value={totalUsers}
        icon={Users}
        variant="primary"
      />
      <StatCard
        title={language === 'ms' ? 'Pengerusi' : 'Chairman'}
        value={chairmanCount}
        icon={Crown}
        variant="warning"
      />
      <StatCard
        title={language === 'ms' ? 'Jawatankuasa' : 'Committee'}
        value={committeeCount}
        icon={Shield}
        variant="success"
      />
      <StatCard
        title={language === 'ms' ? 'Anggota' : 'Staff'}
        value={staffCount}
        icon={UserCog}
        variant="default"
      />
    </div>
  );
}
