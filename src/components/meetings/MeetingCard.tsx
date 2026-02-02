import { Calendar, MapPin, FileText, Users, MoreVertical, Eye, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { ms, enUS } from 'date-fns/locale';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Tables } from '@/integrations/supabase/types';

interface MeetingCardProps {
  meeting: Tables<'meetings'>;
  onView: (meeting: Tables<'meetings'>) => void;
  onEdit: (meeting: Tables<'meetings'>) => void;
  onDelete: (meeting: Tables<'meetings'>) => void;
  canManage: boolean;
}

export function MeetingCard({ meeting, onView, onEdit, onDelete, canManage }: MeetingCardProps) {
  const { language, t } = useLanguage();
  const locale = language === 'ms' ? ms : enUS;

  const title = language === 'en' && meeting.title_en ? meeting.title_en : meeting.title;
  const description = language === 'en' && meeting.description_en ? meeting.description_en : meeting.description;

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-emerald-600 text-white hover:bg-emerald-700">{t('meetings.completed')}</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">{t('meetings.cancelled')}</Badge>;
      default:
        return <Badge variant="secondary">{t('meetings.scheduled')}</Badge>;
    }
  };

  const isPast = new Date(meeting.meeting_date) < new Date();

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {getStatusBadge(meeting.status)}
              {isPast && meeting.status !== 'completed' && (
                <Badge variant="outline" className="text-orange-600 border-orange-600">
                  {t('meetings.past')}
                </Badge>
              )}
            </div>
            <h3 className="font-semibold text-lg line-clamp-2">{title}</h3>
          </div>
          {canManage && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onView(meeting)}>
                  <Eye className="w-4 h-4 mr-2" />
                  {t('common.view')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEdit(meeting)}>
                  <Edit className="w-4 h-4 mr-2" />
                  {t('common.edit')}
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => onDelete(meeting)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  {t('common.delete')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {description && (
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{description}</p>
        )}
        
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>{format(new Date(meeting.meeting_date), 'PPP, p', { locale })}</span>
          </div>
          
          {meeting.location && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span>{meeting.location}</span>
            </div>
          )}
          
          {meeting.minutes_url && (
            <div className="flex items-center gap-2 text-primary">
              <FileText className="w-4 h-4" />
              <a 
                href={meeting.minutes_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:underline"
              >
                {t('meetings.viewMinutes')}
              </a>
            </div>
          )}
        </div>

        <div className="mt-4 pt-4 border-t">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full"
            onClick={() => onView(meeting)}
          >
            <Users className="w-4 h-4 mr-2" />
            {t('meetings.viewDecisions')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
