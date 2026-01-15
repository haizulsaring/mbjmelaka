import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MainLayout } from '@/components/layout/MainLayout';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ComplaintForm } from '@/components/complaints/ComplaintForm';
import { ComplaintList } from '@/components/complaints/ComplaintList';
import { ComplaintStats } from '@/components/complaints/ComplaintStats';
import { Send, List } from 'lucide-react';

export default function Complaints() {
  const { t, language } = useLanguage();
  const { user, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('list');

  const { data: complaints = [], isLoading, refetch } = useQuery({
    queryKey: ['complaints', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('complaints')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const handleFormSuccess = () => {
    refetch();
    setActiveTab('list');
  };

  return (
    <MainLayout title={t('complaints.title')}>
      <div className="space-y-6">
        {/* Stats */}
        <ComplaintStats complaints={complaints} />

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="list" className="gap-2">
              <List className="w-4 h-4" />
              {language === 'ms' ? 'Senarai' : 'List'}
            </TabsTrigger>
            <TabsTrigger value="submit" className="gap-2">
              <Send className="w-4 h-4" />
              {language === 'ms' ? 'Hantar Baru' : 'Submit New'}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="mt-6">
            <ComplaintList
              complaints={complaints}
              isLoading={isLoading}
              isAdmin={isAdmin}
              onRefresh={refetch}
            />
          </TabsContent>

          <TabsContent value="submit" className="mt-6">
            <div className="max-w-2xl">
              <ComplaintForm onSuccess={handleFormSuccess} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
