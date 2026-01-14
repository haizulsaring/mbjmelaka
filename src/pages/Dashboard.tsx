import { useEffect, useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { StatCard } from '@/components/ui/stat-card';
import { StatusBadge } from '@/components/ui/status-badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Users, MessageSquare, Calendar, FileCheck, Plus, ArrowRight, Megaphone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

export default function Dashboard() {
  const { t, language } = useLanguage();
  const { profile } = useAuth();
  const [stats, setStats] = useState({ staff: 0, complaints: 0, meetings: 0, decisions: 0 });
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [recentComplaints, setRecentComplaints] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    const [profilesRes, complaintsRes, meetingsRes, decisionsRes, announcementsRes, recentComplaintsRes] = await Promise.all([
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase.from('complaints').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('meetings').select('id', { count: 'exact', head: true }).eq('status', 'scheduled'),
      supabase.from('decisions').select('id', { count: 'exact', head: true }),
      supabase.from('announcements').select('*').order('created_at', { ascending: false }).limit(3),
      supabase.from('complaints').select('*').order('created_at', { ascending: false }).limit(5),
    ]);

    setStats({
      staff: profilesRes.count || 0,
      complaints: complaintsRes.count || 0,
      meetings: meetingsRes.count || 0,
      decisions: decisionsRes.count || 0,
    });
    setAnnouncements(announcementsRes.data || []);
    setRecentComplaints(recentComplaintsRes.data || []);
  };

  return (
    <MainLayout title={t('dashboard.title')}>
      <div className="space-y-6 animate-fade-in">
        {/* Welcome Banner */}
        <div className="header-gradient rounded-xl p-6 text-primary-foreground gold-accent-border">
          <h2 className="text-2xl font-bold mb-2">
            {language === 'ms' ? 'Selamat Datang' : 'Welcome'}, {profile?.full_name}!
          </h2>
          <p className="text-primary-foreground/80">
            {t('dashboard.welcome')} - JPJ Negeri Melaka
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title={t('dashboard.totalStaff')} value={stats.staff} icon={Users} variant="primary" />
          <StatCard title={t('dashboard.pendingComplaints')} value={stats.complaints} icon={MessageSquare} variant="warning" />
          <StatCard title={t('dashboard.upcomingMeetings')} value={stats.meetings} icon={Calendar} variant="success" />
          <StatCard title={t('dashboard.totalDecisions')} value={stats.decisions} icon={FileCheck} variant="default" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>{t('dashboard.quickActions')}</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3">
              <Button asChild variant="outline" className="h-auto py-4 flex-col gap-2">
                <Link to="/complaints">
                  <Plus className="w-5 h-5" />
                  <span>{t('complaints.submitNew')}</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-auto py-4 flex-col gap-2">
                <Link to="/announcements">
                  <Megaphone className="w-5 h-5" />
                  <span>{t('announcements.title')}</span>
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Recent Announcements */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{t('dashboard.recentAnnouncements')}</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/announcements"><ArrowRight className="w-4 h-4" /></Link>
              </Button>
            </CardHeader>
            <CardContent>
              {announcements.length === 0 ? (
                <p className="text-muted-foreground text-sm">{t('common.noData')}</p>
              ) : (
                <div className="space-y-3">
                  {announcements.map((a) => (
                    <div key={a.id} className="p-3 rounded-lg bg-muted/50">
                      <p className="font-medium text-sm">{language === 'ms' ? a.title : (a.title_en || a.title)}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(new Date(a.created_at), 'dd MMM yyyy')}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Complaints */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{t('dashboard.recentComplaints')}</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/complaints"><ArrowRight className="w-4 h-4" /></Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentComplaints.length === 0 ? (
              <p className="text-muted-foreground text-sm">{t('common.noData')}</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">{t('complaints.reference')}</th>
                      <th className="text-left py-2">{t('complaints.subject')}</th>
                      <th className="text-left py-2">{t('common.status')}</th>
                      <th className="text-left py-2">{t('common.date')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentComplaints.map((c) => (
                      <tr key={c.id} className="border-b last:border-0">
                        <td className="py-2 font-mono text-xs">{c.reference_number}</td>
                        <td className="py-2">{c.subject}</td>
                        <td className="py-2"><StatusBadge status={c.status} /></td>
                        <td className="py-2 text-muted-foreground">{format(new Date(c.created_at), 'dd/MM/yyyy')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
