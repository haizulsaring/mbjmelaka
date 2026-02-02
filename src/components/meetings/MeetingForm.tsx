import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { CalendarIcon, Upload, Loader2, X } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import type { Tables } from '@/integrations/supabase/types';

const meetingSchema = z.object({
  title: z.string().min(1, 'Tajuk diperlukan'),
  title_en: z.string().optional(),
  description: z.string().optional(),
  description_en: z.string().optional(),
  meeting_date: z.date({ required_error: 'Tarikh diperlukan' }),
  location: z.string().optional(),
  status: z.string().default('scheduled'),
});

type MeetingFormData = z.infer<typeof meetingSchema>;

interface MeetingFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  meeting?: Tables<'meetings'> | null;
  onSuccess: () => void;
}

export function MeetingForm({ open, onOpenChange, meeting, onSuccess }: MeetingFormProps) {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [minutesFile, setMinutesFile] = useState<File | null>(null);
  const [existingMinutesUrl, setExistingMinutesUrl] = useState<string | null>(meeting?.minutes_url || null);

  const form = useForm<MeetingFormData>({
    resolver: zodResolver(meetingSchema),
    defaultValues: {
      title: meeting?.title || '',
      title_en: meeting?.title_en || '',
      description: meeting?.description || '',
      description_en: meeting?.description_en || '',
      meeting_date: meeting?.meeting_date ? new Date(meeting.meeting_date) : undefined,
      location: meeting?.location || '',
      status: meeting?.status || 'scheduled',
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: t('meetings.fileTooLarge'),
          variant: 'destructive',
        });
        return;
      }
      setMinutesFile(file);
      setExistingMinutesUrl(null);
    }
  };

  const removeFile = () => {
    setMinutesFile(null);
    setExistingMinutesUrl(null);
  };

  const uploadMinutes = async (meetingId: string): Promise<string | null> => {
    if (!minutesFile) return existingMinutesUrl;

    setUploadingFile(true);
    try {
      const fileExt = minutesFile.name.split('.').pop();
      const fileName = `${meetingId}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('meeting-minutes')
        .upload(fileName, minutesFile);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('meeting-minutes')
        .getPublicUrl(fileName);

      return urlData.publicUrl;
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: t('meetings.uploadError'),
        variant: 'destructive',
      });
      return null;
    } finally {
      setUploadingFile(false);
    }
  };

  const onSubmit = async (data: MeetingFormData) => {
    if (!user) return;

    setIsSubmitting(true);
    try {
      let meetingId = meeting?.id;
      let minutesUrl = existingMinutesUrl;

      if (meeting) {
        // Update existing meeting
        const { error } = await supabase
          .from('meetings')
          .update({
            title: data.title,
            title_en: data.title_en || null,
            description: data.description || null,
            description_en: data.description_en || null,
            meeting_date: data.meeting_date.toISOString(),
            location: data.location || null,
            status: data.status,
          })
          .eq('id', meeting.id);

        if (error) throw error;
      } else {
        // Create new meeting
        const { data: newMeeting, error } = await supabase
          .from('meetings')
          .insert({
            title: data.title,
            title_en: data.title_en || null,
            description: data.description || null,
            description_en: data.description_en || null,
            meeting_date: data.meeting_date.toISOString(),
            location: data.location || null,
            status: data.status,
            created_by: user.id,
          })
          .select()
          .single();

        if (error) throw error;
        meetingId = newMeeting.id;
      }

      // Upload minutes if file selected
      if (minutesFile && meetingId) {
        minutesUrl = await uploadMinutes(meetingId);
        if (minutesUrl) {
          await supabase
            .from('meetings')
            .update({ minutes_url: minutesUrl })
            .eq('id', meetingId);
        }
      } else if (!existingMinutesUrl && meeting?.minutes_url) {
        // Remove minutes if cleared
        await supabase
          .from('meetings')
          .update({ minutes_url: null })
          .eq('id', meetingId);
      }

      toast({
        title: meeting ? t('meetings.updateSuccess') : t('meetings.createSuccess'),
      });
      
      onSuccess();
      onOpenChange(false);
      form.reset();
      setMinutesFile(null);
    } catch (error) {
      console.error('Submit error:', error);
      toast({
        title: t('meetings.saveError'),
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {meeting ? t('meetings.editMeeting') : t('meetings.addNew')}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('meetings.titleMs')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('meetings.titlePlaceholder')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="title_en"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('meetings.titleEn')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('meetings.titlePlaceholderEn')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('meetings.descriptionMs')}</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder={t('meetings.descriptionPlaceholder')} 
                        className="min-h-[100px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description_en"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('meetings.descriptionEn')}</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder={t('meetings.descriptionPlaceholderEn')} 
                        className="min-h-[100px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="meeting_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>{t('meetings.date')}</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              'w-full pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value ? (
                              format(field.value, 'PPP')
                            ) : (
                              <span>{t('meetings.selectDate')}</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('meetings.location')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('meetings.locationPlaceholder')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('common.status')}</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('meetings.selectStatus')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="scheduled">{t('meetings.scheduled')}</SelectItem>
                      <SelectItem value="completed">{t('meetings.completed')}</SelectItem>
                      <SelectItem value="cancelled">{t('meetings.cancelled')}</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Minutes Upload */}
            <div className="space-y-2">
              <FormLabel>{t('meetings.minutes')}</FormLabel>
              {(minutesFile || existingMinutesUrl) ? (
                <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                  <FileIcon className="w-5 h-5 text-primary" />
                  <span className="flex-1 text-sm truncate">
                    {minutesFile?.name || t('meetings.existingMinutes')}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={removeFile}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      {t('meetings.uploadMinutes')}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      PDF, DOC, DOCX (Max 10MB)
                    </p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                  />
                </label>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                {t('common.cancel')}
              </Button>
              <Button type="submit" disabled={isSubmitting || uploadingFile}>
                {(isSubmitting || uploadingFile) && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                {t('common.save')}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function FileIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}
