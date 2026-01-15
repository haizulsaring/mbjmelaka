import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { ms, enUS } from 'date-fns/locale';
import { Pin, Calendar, Edit, Trash2, Megaphone, AlertTriangle, PartyPopper, FileText } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';

type Announcement = Tables<'announcements'>;

interface AnnouncementCardProps {
  announcement: Announcement;
  isAdmin: boolean;
  onEdit?: (announcement: Announcement) => void;
  onDelete?: (announcement: Announcement) => void;
}

const categoryIcons: Record<string, React.ReactNode> = {
  general: <Megaphone className="w-4 h-4" />,
  urgent: <AlertTriangle className="w-4 h-4" />,
  event: <PartyPopper className="w-4 h-4" />,
  policy: <FileText className="w-4 h-4" />,
  welfare: <Megaphone className="w-4 h-4" />,
  hr: <Megaphone className="w-4 h-4" />,
};

const categoryColors: Record<string, string> = {
  general: 'bg-secondary text-secondary-foreground',
  urgent: 'bg-destructive text-destructive-foreground',
  event: 'bg-primary text-primary-foreground',
  policy: 'bg-muted text-muted-foreground',
  welfare: 'bg-accent text-accent-foreground',
  hr: 'bg-secondary text-secondary-foreground',
};

const categories: Record<string, { ms: string; en: string }> = {
  general: { ms: 'Umum', en: 'General' },
  urgent: { ms: 'Segera', en: 'Urgent' },
  event: { ms: 'Acara', en: 'Event' },
  policy: { ms: 'Polisi', en: 'Policy' },
  welfare: { ms: 'Kebajikan', en: 'Welfare' },
  hr: { ms: 'Sumber Manusia', en: 'Human Resources' },
};

const priorities: Record<string, { ms: string; en: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  low: { ms: 'Rendah', en: 'Low', variant: 'outline' },
  normal: { ms: 'Biasa', en: 'Normal', variant: 'secondary' },
  high: { ms: 'Tinggi', en: 'High', variant: 'default' },
  urgent: { ms: 'Segera', en: 'Urgent', variant: 'destructive' },
};

export function AnnouncementCard({ announcement, isAdmin, onEdit, onDelete }: AnnouncementCardProps) {
  const { language } = useLanguage();

  const title = language === 'en' && announcement.title_en ? announcement.title_en : announcement.title;
  const content = language === 'en' && announcement.content_en ? announcement.content_en : announcement.content;

  return (
    <Card className={`transition-all hover:shadow-md ${announcement.is_pinned ? 'border-warning/50 bg-warning/5' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              {announcement.is_pinned && (
                <Badge variant="outline" className="gap-1 border-warning text-warning">
                  <Pin className="w-3 h-3" />
                  {language === 'ms' ? 'Penting' : 'Pinned'}
                </Badge>
              )}
              <Badge className={categoryColors[announcement.category] || categoryColors.general}>
                {categoryIcons[announcement.category]}
                <span className="ml-1">{categories[announcement.category]?.[language] || announcement.category}</span>
              </Badge>
              {announcement.priority && announcement.priority !== 'normal' && (
                <Badge variant={priorities[announcement.priority]?.variant || 'secondary'}>
                  {priorities[announcement.priority]?.[language] || announcement.priority}
                </Badge>
              )}
            </div>
            <CardTitle className="text-lg leading-tight">{title}</CardTitle>
          </div>
          
          {isAdmin && (
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" onClick={() => onEdit?.(announcement)}>
                <Edit className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => onDelete?.(announcement)}>
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed mb-4">
          {content}
        </p>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {format(new Date(announcement.published_at || announcement.created_at), 'dd MMM yyyy, HH:mm', {
              locale: language === 'ms' ? ms : enUS,
            })}
          </span>
          {announcement.expires_at && (
            <span className="flex items-center gap-1 text-warning">
              {language === 'ms' ? 'Tamat:' : 'Expires:'}{' '}
              {format(new Date(announcement.expires_at), 'dd MMM yyyy', {
                locale: language === 'ms' ? ms : enUS,
              })}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
