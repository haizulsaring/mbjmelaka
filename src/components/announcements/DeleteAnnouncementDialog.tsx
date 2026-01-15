import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
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
import { toast } from '@/hooks/use-toast';
import { Tables } from '@/integrations/supabase/types';

type Announcement = Tables<'announcements'>;

interface DeleteAnnouncementDialogProps {
  announcement: Announcement;
  onClose: () => void;
  onSuccess: () => void;
}

export function DeleteAnnouncementDialog({ announcement, onClose, onSuccess }: DeleteAnnouncementDialogProps) {
  const { language } = useLanguage();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('announcements')
        .delete()
        .eq('id', announcement.id);

      if (error) throw error;

      toast({
        title: language === 'ms' ? 'Berjaya' : 'Success',
        description: language === 'ms' ? 'Pengumuman telah dipadam.' : 'Announcement has been deleted.',
      });
      onSuccess();
    } catch (error: any) {
      toast({
        title: language === 'ms' ? 'Ralat' : 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
      onClose();
    }
  };

  return (
    <AlertDialog open onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {language === 'ms' ? 'Padam Pengumuman?' : 'Delete Announcement?'}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {language === 'ms' 
              ? `Adakah anda pasti mahu memadam pengumuman "${announcement.title}"? Tindakan ini tidak boleh dibatalkan.`
              : `Are you sure you want to delete the announcement "${announcement.title}"? This action cannot be undone.`}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>
            {language === 'ms' ? 'Batal' : 'Cancel'}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting 
              ? (language === 'ms' ? 'Memadam...' : 'Deleting...') 
              : (language === 'ms' ? 'Padam' : 'Delete')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
