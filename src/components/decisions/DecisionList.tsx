import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ms, enUS } from 'date-fns/locale';
import { Plus, Calendar, User, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { DecisionForm } from './DecisionForm';
import type { Tables } from '@/integrations/supabase/types';

interface DecisionListProps {
  decisions: Tables<'decisions'>[];
  meetingId?: string;
}

export function DecisionList({ decisions, meetingId }: DecisionListProps) {
  const { language, t } = useLanguage();
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const locale = language === 'ms' ? ms : enUS;

  const [formOpen, setFormOpen] = useState(false);
  const [selectedDecision, setSelectedDecision] = useState<Tables<'decisions'> | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [decisionToDelete, setDecisionToDelete] = useState<Tables<'decisions'> | null>(null);

  const canManage = isAdmin;

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-emerald-600 text-white hover:bg-emerald-700">{t('decisions.completed')}</Badge>;
      case 'in_progress':
        return <Badge className="bg-sky-600 text-white hover:bg-sky-700">{t('decisions.inProgress')}</Badge>;
      case 'overdue':
        return <Badge variant="destructive">{t('decisions.overdue')}</Badge>;
      default:
        return <Badge variant="outline">{t('decisions.pending')}</Badge>;
    }
  };

  const handleEdit = (decision: Tables<'decisions'>) => {
    setSelectedDecision(decision);
    setFormOpen(true);
  };

  const handleDelete = (decision: Tables<'decisions'>) => {
    setDecisionToDelete(decision);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!decisionToDelete) return;

    try {
      const { error } = await supabase
        .from('decisions')
        .delete()
        .eq('id', decisionToDelete.id);

      if (error) throw error;

      toast({ title: t('decisions.deleteSuccess') });
      queryClient.invalidateQueries({ queryKey: ['meeting-decisions', meetingId] });
      queryClient.invalidateQueries({ queryKey: ['decisions'] });
    } catch (error) {
      console.error('Delete error:', error);
      toast({ title: t('decisions.deleteError'), variant: 'destructive' });
    } finally {
      setDeleteDialogOpen(false);
      setDecisionToDelete(null);
    }
  };

  const handleFormSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['meeting-decisions', meetingId] });
    queryClient.invalidateQueries({ queryKey: ['decisions'] });
    setSelectedDecision(null);
  };

  return (
    <div className="space-y-4">
      {canManage && meetingId && (
        <Button 
          size="sm" 
          variant="outline"
          onClick={() => { setSelectedDecision(null); setFormOpen(true); }}
        >
          <Plus className="w-4 h-4 mr-2" />
          {t('decisions.addNew')}
        </Button>
      )}

      <div className="space-y-3">
        {decisions.map(decision => {
          const title = language === 'en' && decision.title_en ? decision.title_en : decision.title;
          const description = language === 'en' && decision.description_en ? decision.description_en : decision.description;
          const isOverdue = decision.due_date && new Date(decision.due_date) < new Date() && decision.status !== 'completed';

          return (
            <Card key={decision.id} className={isOverdue ? 'border-destructive' : ''}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-mono text-muted-foreground">
                        {decision.decision_number}
                      </span>
                      {getStatusBadge(isOverdue ? 'overdue' : decision.status)}
                    </div>
                    
                    <h4 className="font-medium mb-1">{title}</h4>
                    <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
                    
                    <div className="flex flex-wrap gap-4 mt-3 text-xs text-muted-foreground">
                      {decision.responsible_party && (
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          <span>{decision.responsible_party}</span>
                        </div>
                      )}
                      {decision.due_date && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{format(new Date(decision.due_date), 'PP', { locale })}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {canManage && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(decision)}>
                          <Edit className="w-4 h-4 mr-2" />
                          {t('common.edit')}
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDelete(decision)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          {t('common.delete')}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Decision Form Dialog */}
      <DecisionForm
        open={formOpen}
        onOpenChange={setFormOpen}
        decision={selectedDecision}
        meetingId={meetingId}
        onSuccess={handleFormSuccess}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('decisions.confirmDelete')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('decisions.deleteWarning')}
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
