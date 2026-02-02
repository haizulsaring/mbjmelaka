import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, FileCheck } from 'lucide-react';
import { format } from 'date-fns';
import { ms, enUS } from 'date-fns/locale';
import { MainLayout } from '@/components/layout/MainLayout';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, User } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

export default function Decisions() {
  const { language, t } = useLanguage();
  const locale = language === 'ms' ? ms : enUS;
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const { data: decisions, isLoading } = useQuery({
    queryKey: ['decisions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('decisions')
        .select('*, meetings(title, title_en)')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const getStatusBadge = (status: string | null, isOverdue: boolean) => {
    if (isOverdue) {
      return <Badge variant="destructive">{t('decisions.overdue')}</Badge>;
    }
    switch (status) {
      case 'completed':
        return <Badge className="bg-emerald-600 text-white hover:bg-emerald-700">{t('decisions.completed')}</Badge>;
      case 'in_progress':
        return <Badge className="bg-sky-600 text-white hover:bg-sky-700">{t('decisions.inProgress')}</Badge>;
      default:
        return <Badge variant="outline">{t('decisions.pending')}</Badge>;
    }
  };

  const filteredDecisions = decisions?.filter(decision => {
    const matchesSearch = searchQuery === '' || 
      decision.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      decision.title_en?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      decision.decision_number.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || decision.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  }) || [];

  return (
    <MainLayout title={t('decisions.title')}>
      <div className="space-y-6">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={t('common.search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t('common.status')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('common.all')}</SelectItem>
              <SelectItem value="pending">{t('decisions.pending')}</SelectItem>
              <SelectItem value="in_progress">{t('decisions.inProgress')}</SelectItem>
              <SelectItem value="completed">{t('decisions.completed')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Decisions List */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-32" />)}
          </div>
        ) : filteredDecisions.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <FileCheck className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">{t('common.noData')}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredDecisions.map(decision => {
              const title = language === 'en' && decision.title_en ? decision.title_en : decision.title;
              const description = language === 'en' && decision.description_en ? decision.description_en : decision.description;
              const isOverdue = decision.due_date && new Date(decision.due_date) < new Date() && decision.status !== 'completed';
              const meetingTitle = decision.meetings 
                ? (language === 'en' && decision.meetings.title_en ? decision.meetings.title_en : decision.meetings.title)
                : null;

              return (
                <Card key={decision.id} className={isOverdue ? 'border-destructive' : ''}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-mono text-muted-foreground">
                            {decision.decision_number}
                          </span>
                          {getStatusBadge(decision.status, !!isOverdue)}
                        </div>
                        <CardTitle className="text-lg">{title}</CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {description}
                    </p>
                    
                    <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
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
                      {meetingTitle && (
                        <div className="flex items-center gap-1">
                          <FileCheck className="w-3 h-3" />
                          <span>{meetingTitle}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
