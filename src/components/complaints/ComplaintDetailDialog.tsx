import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StatusBadge } from '@/components/ui/status-badge';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ms, enUS } from 'date-fns/locale';
import { FileText, Lightbulb, Calendar, Tag, Hash, MessageSquare } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';

type Complaint = Tables<'complaints'>;

interface ComplaintDetailDialogProps {
  complaint: Complaint;
  isAdmin: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

const categories: Record<string, { ms: string; en: string }> = {
  welfare: { ms: 'Kebajikan', en: 'Welfare' },
  facilities: { ms: 'Kemudahan', en: 'Facilities' },
  hr: { ms: 'Sumber Manusia', en: 'Human Resources' },
  finance: { ms: 'Kewangan', en: 'Finance' },
  safety: { ms: 'Keselamatan', en: 'Safety' },
  others: { ms: 'Lain-lain', en: 'Others' },
};

export function ComplaintDetailDialog({ complaint, isAdmin, onClose, onUpdate }: ComplaintDetailDialogProps) {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);
  const [status, setStatus] = useState(complaint.status || 'pending');
  const [resolution, setResolution] = useState(complaint.resolution || '');

  const getStatusType = (status: string | null): 'pending' | 'inProgress' | 'completed' | 'cancelled' => {
    switch (status) {
      case 'pending': return 'pending';
      case 'in_progress': return 'inProgress';
      case 'resolved': return 'completed';
      case 'rejected': return 'cancelled';
      default: return 'pending';
    }
  };

  const handleUpdateStatus = async () => {
    if (!user) return;

    setIsUpdating(true);
    try {
      const updateData: any = { status };
      
      if (status === 'resolved' || status === 'rejected') {
        updateData.resolution = resolution;
        updateData.resolved_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('complaints')
        .update(updateData)
        .eq('id', complaint.id);

      if (error) throw error;

      toast({
        title: language === 'ms' ? 'Berjaya' : 'Success',
        description: language === 'ms' ? 'Status telah dikemaskini' : 'Status has been updated',
      });
      onUpdate();
      onClose();
    } catch (error: any) {
      toast({
        title: language === 'ms' ? 'Ralat' : 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {complaint.type === 'complaint' ? (
              <FileText className="w-5 h-5 text-destructive" />
            ) : (
              <Lightbulb className="w-5 h-5 text-warning" />
            )}
            {complaint.type === 'complaint' ? t('complaints.complaint') : t('complaints.suggestion')}
          </DialogTitle>
          <DialogDescription className="font-mono">
            {complaint.reference_number}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status & Meta */}
          <div className="flex flex-wrap items-center gap-3">
            <StatusBadge status={getStatusType(complaint.status)} />
            <Badge variant="outline" className="gap-1">
              <Tag className="w-3 h-3" />
              {categories[complaint.category]?.[language] || complaint.category}
            </Badge>
            <Badge variant="secondary" className="gap-1">
              <Calendar className="w-3 h-3" />
              {format(new Date(complaint.created_at), 'dd MMM yyyy, HH:mm', {
                locale: language === 'ms' ? ms : enUS,
              })}
            </Badge>
          </div>

          <Separator />

          {/* Subject */}
          <div>
            <Label className="text-muted-foreground text-xs uppercase tracking-wider">
              {t('complaints.subject')}
            </Label>
            <p className="mt-1 font-medium">{complaint.subject}</p>
          </div>

          {/* Description */}
          <div>
            <Label className="text-muted-foreground text-xs uppercase tracking-wider">
              {t('complaints.description')}
            </Label>
            <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed">
              {complaint.description}
            </p>
          </div>

          {/* Resolution (if exists) */}
          {complaint.resolution && (
            <>
              <Separator />
              <div>
                <Label className="text-muted-foreground text-xs uppercase tracking-wider flex items-center gap-1">
                  <MessageSquare className="w-3 h-3" />
                  {language === 'ms' ? 'Maklum Balas / Penyelesaian' : 'Response / Resolution'}
                </Label>
                <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed bg-muted p-3 rounded-lg">
                  {complaint.resolution}
                </p>
                {complaint.resolved_at && (
                  <p className="text-xs text-muted-foreground mt-2">
                    {language === 'ms' ? 'Diselesaikan pada' : 'Resolved on'}{' '}
                    {format(new Date(complaint.resolved_at), 'dd MMM yyyy, HH:mm', {
                      locale: language === 'ms' ? ms : enUS,
                    })}
                  </p>
                )}
              </div>
            </>
          )}

          {/* Admin Actions */}
          {isAdmin && complaint.status !== 'resolved' && complaint.status !== 'rejected' && (
            <>
              <Separator />
              <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                <h4 className="font-semibold text-sm">
                  {language === 'ms' ? 'Tindakan Jawatankuasa' : 'Committee Actions'}
                </h4>

                <div className="space-y-2">
                  <Label>{t('common.status')}</Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">{t('complaints.pending')}</SelectItem>
                      <SelectItem value="in_progress">{t('complaints.inProgress')}</SelectItem>
                      <SelectItem value="resolved">{t('complaints.resolved')}</SelectItem>
                      <SelectItem value="rejected">{t('complaints.rejected')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {(status === 'resolved' || status === 'rejected') && (
                  <div className="space-y-2">
                    <Label>
                      {language === 'ms' ? 'Maklum Balas / Penyelesaian' : 'Response / Resolution'} *
                    </Label>
                    <Textarea
                      value={resolution}
                      onChange={(e) => setResolution(e.target.value)}
                      placeholder={language === 'ms' 
                        ? 'Nyatakan maklum balas atau tindakan yang diambil...'
                        : 'State the response or action taken...'}
                      rows={4}
                    />
                  </div>
                )}

                <Button
                  onClick={handleUpdateStatus}
                  disabled={isUpdating || ((status === 'resolved' || status === 'rejected') && !resolution.trim())}
                  className="w-full"
                >
                  {isUpdating 
                    ? (language === 'ms' ? 'Mengemaskini...' : 'Updating...')
                    : (language === 'ms' ? 'Kemaskini Status' : 'Update Status')}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
