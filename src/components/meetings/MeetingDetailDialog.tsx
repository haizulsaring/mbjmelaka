import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ms, enUS } from 'date-fns/locale';
import { Calendar, MapPin, FileText, Users } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { DecisionList } from '../decisions/DecisionList';
import type { Tables } from '@/integrations/supabase/types';

interface MeetingDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  meeting: Tables<'meetings'> | null;
}

export function MeetingDetailDialog({ open, onOpenChange, meeting }: MeetingDetailDialogProps) {
  const { language, t } = useLanguage();
  const locale = language === 'ms' ? ms : enUS;

  const { data: decisions, isLoading: loadingDecisions } = useQuery({
    queryKey: ['meeting-decisions', meeting?.id],
    queryFn: async () => {
      if (!meeting?.id) return [];
      const { data, error } = await supabase
        .from('decisions')
        .select('*')
        .eq('meeting_id', meeting.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!meeting?.id,
  });

  if (!meeting) return null;

  const title = language === 'en' && meeting.title_en ? meeting.title_en : meeting.title;
  const description = language === 'en' && meeting.description_en ? meeting.description_en : meeting.description;

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-500">{t('meetings.completed')}</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">{t('meetings.cancelled')}</Badge>;
      default:
        return <Badge variant="secondary">{t('meetings.scheduled')}</Badge>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            {getStatusBadge(meeting.status)}
          </div>
          <DialogTitle className="text-xl">{title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Meeting Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>{format(new Date(meeting.meeting_date), 'PPPp', { locale })}</span>
            </div>
            
            {meeting.location && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>{meeting.location}</span>
              </div>
            )}

            {meeting.minutes_url && (
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                <a 
                  href={meeting.minutes_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  {t('meetings.viewMinutes')}
                </a>
              </div>
            )}
          </div>

          {description && (
            <div>
              <h4 className="font-medium mb-2">{t('meetings.description')}</h4>
              <p className="text-muted-foreground whitespace-pre-wrap">{description}</p>
            </div>
          )}

          <Separator />

          {/* Decisions Section */}
          <div>
            <h4 className="font-medium mb-4 flex items-center gap-2">
              <Users className="w-4 h-4" />
              {t('meetings.decisions')} ({decisions?.length || 0})
            </h4>
            
            {loadingDecisions ? (
              <div className="space-y-3">
                <Skeleton className="h-20" />
                <Skeleton className="h-20" />
              </div>
            ) : decisions && decisions.length > 0 ? (
              <DecisionList decisions={decisions} meetingId={meeting.id} />
            ) : (
              <p className="text-muted-foreground text-center py-6">
                {t('meetings.noDecisions')}
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
