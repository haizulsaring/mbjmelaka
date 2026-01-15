import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MainLayout } from '@/components/layout/MainLayout';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { AnnouncementForm } from '@/components/announcements/AnnouncementForm';
import { AnnouncementList } from '@/components/announcements/AnnouncementList';
import { DeleteAnnouncementDialog } from '@/components/announcements/DeleteAnnouncementDialog';
import { StatCard } from '@/components/ui/stat-card';
import { Megaphone, Plus, Pin, Calendar, AlertTriangle } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';

type Announcement = Tables<'announcements'>;

export default function Announcements() {
  const { t, language } = useLanguage();
  const { user, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('list');
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [deletingAnnouncement, setDeletingAnnouncement] = useState<Announcement | null>(null);
  const [showForm, setShowForm] = useState(false);

  const { data: announcements = [], isLoading, refetch } = useQuery({
    queryKey: ['announcements'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const handleFormSuccess = () => {
    refetch();
    setShowForm(false);
    setEditingAnnouncement(null);
    setActiveTab('list');
  };

  const handleEdit = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    setShowForm(true);
  };

  const handleDelete = (announcement: Announcement) => {
    setDeletingAnnouncement(announcement);
  };

  // Stats
  const now = new Date();
  const stats = {
    total: announcements.length,
    pinned: announcements.filter(a => a.is_pinned).length,
    urgent: announcements.filter(a => a.priority === 'urgent' || a.category === 'urgent').length,
    thisMonth: announcements.filter(a => {
      const date = new Date(a.created_at);
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }).length,
  };

  return (
    <MainLayout title={t('announcements.title')}>
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            title={language === 'ms' ? 'Jumlah' : 'Total'}
            value={stats.total}
            icon={Megaphone}
            variant="default"
          />
          <StatCard
            title={language === 'ms' ? 'Penting' : 'Pinned'}
            value={stats.pinned}
            icon={Pin}
            variant="warning"
          />
          <StatCard
            title={language === 'ms' ? 'Segera' : 'Urgent'}
            value={stats.urgent}
            icon={AlertTriangle}
            variant="danger"
          />
          <StatCard
            title={language === 'ms' ? 'Bulan Ini' : 'This Month'}
            value={stats.thisMonth}
            icon={Calendar}
            variant="success"
          />
        </div>

        {/* Admin: Add button */}
        {isAdmin && (
          <div className="flex justify-end">
            <Button onClick={() => { setEditingAnnouncement(null); setShowForm(true); }} className="gap-2">
              <Plus className="w-4 h-4" />
              {language === 'ms' ? 'Pengumuman Baru' : 'New Announcement'}
            </Button>
          </div>
        )}

        {/* List */}
        <AnnouncementList
          announcements={announcements}
          isLoading={isLoading}
          isAdmin={isAdmin}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        {/* Form Dialog */}
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <AnnouncementForm
              announcement={editingAnnouncement}
              onSuccess={handleFormSuccess}
              onCancel={() => setShowForm(false)}
            />
          </DialogContent>
        </Dialog>

        {/* Delete Dialog */}
        {deletingAnnouncement && (
          <DeleteAnnouncementDialog
            announcement={deletingAnnouncement}
            onClose={() => setDeletingAnnouncement(null)}
            onSuccess={() => {
              setDeletingAnnouncement(null);
              refetch();
            }}
          />
        )}
      </div>
    </MainLayout>
  );
}
