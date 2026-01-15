import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Send, Pin, Calendar } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';

type Announcement = Tables<'announcements'>;

const announcementSchema = z.object({
  title: z.string().min(5, 'Tajuk mestilah sekurang-kurangnya 5 aksara').max(200),
  title_en: z.string().max(200).optional(),
  content: z.string().min(10, 'Kandungan mestilah sekurang-kurangnya 10 aksara').max(5000),
  content_en: z.string().max(5000).optional(),
  category: z.string().min(1, 'Kategori diperlukan'),
  priority: z.enum(['low', 'normal', 'high', 'urgent']),
  is_pinned: z.boolean().optional(),
  expires_at: z.string().optional(),
});

type AnnouncementFormData = z.infer<typeof announcementSchema>;

const categories = [
  { value: 'general', labelMs: 'Umum', labelEn: 'General' },
  { value: 'urgent', labelMs: 'Segera', labelEn: 'Urgent' },
  { value: 'event', labelMs: 'Acara', labelEn: 'Event' },
  { value: 'policy', labelMs: 'Polisi', labelEn: 'Policy' },
  { value: 'welfare', labelMs: 'Kebajikan', labelEn: 'Welfare' },
  { value: 'hr', labelMs: 'Sumber Manusia', labelEn: 'Human Resources' },
];

interface AnnouncementFormProps {
  announcement?: Announcement | null;
  onSuccess: () => void;
  onCancel?: () => void;
}

export function AnnouncementForm({ announcement, onSuccess, onCancel }: AnnouncementFormProps) {
  const { language } = useLanguage();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!announcement;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<AnnouncementFormData>({
    resolver: zodResolver(announcementSchema),
    defaultValues: {
      title: announcement?.title || '',
      title_en: announcement?.title_en || '',
      content: announcement?.content || '',
      content_en: announcement?.content_en || '',
      category: announcement?.category || 'general',
      priority: (announcement?.priority as any) || 'normal',
      is_pinned: announcement?.is_pinned || false,
      expires_at: announcement?.expires_at ? announcement.expires_at.split('T')[0] : '',
    },
  });

  const isPinned = watch('is_pinned');

  const onSubmit = async (data: AnnouncementFormData) => {
    if (!user) {
      toast({
        title: language === 'ms' ? 'Ralat' : 'Error',
        description: language === 'ms' ? 'Sila log masuk terlebih dahulu' : 'Please log in first',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        title: data.title,
        title_en: data.title_en || null,
        content: data.content,
        content_en: data.content_en || null,
        category: data.category,
        priority: data.priority,
        is_pinned: data.is_pinned || false,
        expires_at: data.expires_at ? new Date(data.expires_at).toISOString() : null,
        created_by: user.id,
        published_at: new Date().toISOString(),
      };

      if (isEditing && announcement) {
        const { error } = await supabase
          .from('announcements')
          .update(payload)
          .eq('id', announcement.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('announcements').insert(payload);
        if (error) throw error;
      }

      toast({
        title: language === 'ms' ? 'Berjaya!' : 'Success!',
        description: isEditing
          ? (language === 'ms' ? 'Pengumuman telah dikemaskini.' : 'Announcement has been updated.')
          : (language === 'ms' ? 'Pengumuman telah diterbitkan.' : 'Announcement has been published.'),
      });
      reset();
      onSuccess();
    } catch (error: any) {
      toast({
        title: language === 'ms' ? 'Ralat' : 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="w-5 h-5 text-primary" />
          {isEditing 
            ? (language === 'ms' ? 'Edit Pengumuman' : 'Edit Announcement')
            : (language === 'ms' ? 'Pengumuman Baru' : 'New Announcement')}
        </CardTitle>
        <CardDescription>
          {language === 'ms' 
            ? 'Isi borang di bawah untuk menerbitkan pengumuman kepada semua anggota.'
            : 'Fill in the form below to publish an announcement to all staff.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Title BM */}
          <div className="space-y-2">
            <Label htmlFor="title">{language === 'ms' ? 'Tajuk (BM)' : 'Title (BM)'} *</Label>
            <Input
              id="title"
              {...register('title')}
              placeholder={language === 'ms' ? 'Tajuk pengumuman dalam Bahasa Malaysia' : 'Announcement title in Malay'}
              maxLength={200}
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          {/* Title EN */}
          <div className="space-y-2">
            <Label htmlFor="title_en">{language === 'ms' ? 'Tajuk (EN)' : 'Title (EN)'}</Label>
            <Input
              id="title_en"
              {...register('title_en')}
              placeholder={language === 'ms' ? 'Tajuk dalam Bahasa Inggeris (pilihan)' : 'Title in English (optional)'}
              maxLength={200}
            />
          </div>

          {/* Category & Priority */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{language === 'ms' ? 'Kategori' : 'Category'} *</Label>
              <Select 
                defaultValue={announcement?.category || 'general'}
                onValueChange={(value) => setValue('category', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {language === 'ms' ? cat.labelMs : cat.labelEn}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{language === 'ms' ? 'Keutamaan' : 'Priority'}</Label>
              <Select 
                defaultValue={(announcement?.priority as any) || 'normal'}
                onValueChange={(value) => setValue('priority', value as any)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">{language === 'ms' ? 'Rendah' : 'Low'}</SelectItem>
                  <SelectItem value="normal">{language === 'ms' ? 'Biasa' : 'Normal'}</SelectItem>
                  <SelectItem value="high">{language === 'ms' ? 'Tinggi' : 'High'}</SelectItem>
                  <SelectItem value="urgent">{language === 'ms' ? 'Segera' : 'Urgent'}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Content BM */}
          <div className="space-y-2">
            <Label htmlFor="content">{language === 'ms' ? 'Kandungan (BM)' : 'Content (BM)'} *</Label>
            <Textarea
              id="content"
              {...register('content')}
              placeholder={language === 'ms' ? 'Tulis kandungan pengumuman...' : 'Write announcement content...'}
              rows={6}
              maxLength={5000}
            />
            {errors.content && (
              <p className="text-sm text-destructive">{errors.content.message}</p>
            )}
          </div>

          {/* Content EN */}
          <div className="space-y-2">
            <Label htmlFor="content_en">{language === 'ms' ? 'Kandungan (EN)' : 'Content (EN)'}</Label>
            <Textarea
              id="content_en"
              {...register('content_en')}
              placeholder={language === 'ms' ? 'Kandungan dalam Bahasa Inggeris (pilihan)' : 'Content in English (optional)'}
              rows={4}
              maxLength={5000}
            />
          </div>

          {/* Pin & Expiry */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-2">
                <Pin className="w-4 h-4 text-warning" />
                <Label htmlFor="is_pinned" className="cursor-pointer">
                  {language === 'ms' ? 'Pin Pengumuman' : 'Pin Announcement'}
                </Label>
              </div>
              <Switch
                id="is_pinned"
                checked={isPinned}
                onCheckedChange={(checked) => setValue('is_pinned', checked)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expires_at" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {language === 'ms' ? 'Tarikh Tamat' : 'Expiry Date'}
              </Label>
              <Input
                id="expires_at"
                type="date"
                {...register('expires_at')}
              />
            </div>
          </div>

          <div className="flex gap-3">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
                {language === 'ms' ? 'Batal' : 'Cancel'}
              </Button>
            )}
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting 
                ? (language === 'ms' ? 'Menyimpan...' : 'Saving...') 
                : isEditing
                  ? (language === 'ms' ? 'Kemaskini' : 'Update')
                  : (language === 'ms' ? 'Terbitkan' : 'Publish')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
