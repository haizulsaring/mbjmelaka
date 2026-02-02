import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
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

const decisionSchema = z.object({
  decision_number: z.string().min(1, 'Nombor keputusan diperlukan'),
  title: z.string().min(1, 'Tajuk diperlukan'),
  title_en: z.string().optional(),
  description: z.string().min(1, 'Keterangan diperlukan'),
  description_en: z.string().optional(),
  responsible_party: z.string().optional(),
  due_date: z.date().optional(),
  status: z.string().default('pending'),
});

type DecisionFormData = z.infer<typeof decisionSchema>;

interface DecisionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  decision?: Tables<'decisions'> | null;
  meetingId?: string;
  onSuccess: () => void;
}

export function DecisionForm({ open, onOpenChange, decision, meetingId, onSuccess }: DecisionFormProps) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<DecisionFormData>({
    resolver: zodResolver(decisionSchema),
    defaultValues: {
      decision_number: '',
      title: '',
      title_en: '',
      description: '',
      description_en: '',
      responsible_party: '',
      due_date: undefined,
      status: 'pending',
    },
  });

  useEffect(() => {
    if (decision) {
      form.reset({
        decision_number: decision.decision_number,
        title: decision.title,
        title_en: decision.title_en || '',
        description: decision.description,
        description_en: decision.description_en || '',
        responsible_party: decision.responsible_party || '',
        due_date: decision.due_date ? new Date(decision.due_date) : undefined,
        status: decision.status || 'pending',
      });
    } else {
      form.reset({
        decision_number: '',
        title: '',
        title_en: '',
        description: '',
        description_en: '',
        responsible_party: '',
        due_date: undefined,
        status: 'pending',
      });
    }
  }, [decision, form]);

  const onSubmit = async (data: DecisionFormData) => {
    setIsSubmitting(true);
    try {
      if (decision) {
        // Update existing decision
        const { error } = await supabase
          .from('decisions')
          .update({
            decision_number: data.decision_number,
            title: data.title,
            title_en: data.title_en || null,
            description: data.description,
            description_en: data.description_en || null,
            responsible_party: data.responsible_party || null,
            due_date: data.due_date?.toISOString().split('T')[0] || null,
            status: data.status,
          })
          .eq('id', decision.id);

        if (error) throw error;
      } else {
        // Create new decision
        const { error } = await supabase
          .from('decisions')
          .insert({
            decision_number: data.decision_number,
            title: data.title,
            title_en: data.title_en || null,
            description: data.description,
            description_en: data.description_en || null,
            responsible_party: data.responsible_party || null,
            due_date: data.due_date?.toISOString().split('T')[0] || null,
            status: data.status,
            meeting_id: meetingId || null,
          });

        if (error) throw error;
      }

      toast({
        title: decision ? t('decisions.updateSuccess') : t('decisions.createSuccess'),
      });
      
      onSuccess();
      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.error('Submit error:', error);
      toast({
        title: t('decisions.saveError'),
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
            {decision ? t('decisions.editDecision') : t('decisions.addNew')}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="decision_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('decisions.number')}</FormLabel>
                  <FormControl>
                    <Input placeholder="KPT-2024-001" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('decisions.titleMs')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('decisions.titlePlaceholder')} {...field} />
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
                    <FormLabel>{t('decisions.titleEn')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('decisions.titlePlaceholderEn')} {...field} />
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
                    <FormLabel>{t('decisions.descriptionMs')}</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder={t('decisions.descriptionPlaceholder')} 
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
                    <FormLabel>{t('decisions.descriptionEn')}</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder={t('decisions.descriptionPlaceholderEn')} 
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
                name="responsible_party"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('decisions.responsibleParty')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('decisions.responsiblePlaceholder')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="due_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>{t('decisions.dueDate')}</FormLabel>
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
                              <span>{t('decisions.selectDate')}</span>
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
                        <SelectValue placeholder={t('decisions.selectStatus')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="pending">{t('decisions.pending')}</SelectItem>
                      <SelectItem value="in_progress">{t('decisions.inProgress')}</SelectItem>
                      <SelectItem value="completed">{t('decisions.completed')}</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                {t('common.cancel')}
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {t('common.save')}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
