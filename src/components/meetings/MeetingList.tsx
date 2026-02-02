import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Calendar, Search } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { MeetingCard } from './MeetingCard';
import { MeetingForm } from './MeetingForm';
import { MeetingDetailDialog } from './MeetingDetailDialog';
import type { Tables } from '@/integrations/supabase/types';

export function MeetingList() {
  const { t } = useLanguage();
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<Tables<'meetings'> | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [meetingToDelete, setMeetingToDelete] = useState<Tables<'meetings'> | null>(null);

  const canManage = isAdmin;

  const { data: meetings, isLoading } = useQuery({
    queryKey: ['meetings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('meetings')
        .select('*')
        .order('meeting_date', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const now = new Date();
  const upcomingMeetings = meetings?.filter(m => new Date(m.meeting_date) >= now) || [];
  const pastMeetings = meetings?.filter(m => new Date(m.meeting_date) < now) || [];

  const filterMeetings = (list: Tables<'meetings'>[]) => {
    if (!searchQuery) return list;
    const query = searchQuery.toLowerCase();
    return list.filter(m => 
      m.title.toLowerCase().includes(query) ||
      m.title_en?.toLowerCase().includes(query) ||
      m.location?.toLowerCase().includes(query)
    );
  };

  const handleView = (meeting: Tables<'meetings'>) => {
    setSelectedMeeting(meeting);
    setDetailDialogOpen(true);
  };

  const handleEdit = (meeting: Tables<'meetings'>) => {
    setSelectedMeeting(meeting);
    setFormOpen(true);
  };

  const handleDelete = (meeting: Tables<'meetings'>) => {
    setMeetingToDelete(meeting);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!meetingToDelete) return;

    try {
      const { error } = await supabase
        .from('meetings')
        .delete()
        .eq('id', meetingToDelete.id);

      if (error) throw error;

      toast({ title: t('meetings.deleteSuccess') });
      queryClient.invalidateQueries({ queryKey: ['meetings'] });
    } catch (error) {
      console.error('Delete error:', error);
      toast({ title: t('meetings.deleteError'), variant: 'destructive' });
    } finally {
      setDeleteDialogOpen(false);
      setMeetingToDelete(null);
    }
  };

  const handleFormSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['meetings'] });
    setSelectedMeeting(null);
  };

  const renderMeetingGrid = (list: Tables<'meetings'>[]) => {
    const filtered = filterMeetings(list);
    
    if (isLoading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      );
    }

    if (filtered.length === 0) {
      return (
        <div className="text-center py-12">
          <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">{t('common.noData')}</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(meeting => (
          <MeetingCard
            key={meeting.id}
            meeting={meeting}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
            canManage={canManage}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={t('common.search')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        {canManage && (
          <Button onClick={() => { setSelectedMeeting(null); setFormOpen(true); }}>
            <Plus className="w-4 h-4 mr-2" />
            {t('meetings.addNew')}
          </Button>
        )}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList>
          <TabsTrigger value="upcoming">
            {t('meetings.upcoming')} ({upcomingMeetings.length})
          </TabsTrigger>
          <TabsTrigger value="past">
            {t('meetings.past')} ({pastMeetings.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="mt-6">
          {renderMeetingGrid(upcomingMeetings)}
        </TabsContent>

        <TabsContent value="past" className="mt-6">
          {renderMeetingGrid(pastMeetings)}
        </TabsContent>
      </Tabs>

      {/* Meeting Form Dialog */}
      <MeetingForm
        open={formOpen}
        onOpenChange={setFormOpen}
        meeting={selectedMeeting}
        onSuccess={handleFormSuccess}
      />

      {/* Meeting Detail Dialog */}
      <MeetingDetailDialog
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        meeting={selectedMeeting}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('meetings.confirmDelete')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('meetings.deleteWarning')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">
              {t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
