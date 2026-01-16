import { useQuery } from '@tanstack/react-query';
import { MainLayout } from '@/components/layout/MainLayout';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserList } from '@/components/admin/UserList';
import { AdminStats } from '@/components/admin/AdminStats';
import { AuditLogList } from '@/components/admin/AuditLogList';
import { Users, ScrollText, Shield } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Database } from '@/integrations/supabase/types';

type AppRole = Database['public']['Enums']['app_role'];

interface UserWithRole {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  department: string | null;
  position: string | null;
  created_at: string;
  role: AppRole;
  role_id: string;
}

export default function Admin() {
  const { t, language } = useLanguage();
  const { user, isAdmin } = useAuth();

  const { data: users = [], isLoading, refetch } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      // Fetch profiles with their roles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('full_name');

      if (profilesError) throw profilesError;

      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*');

      if (rolesError) throw rolesError;

      // Combine profiles with roles
      const usersWithRoles: UserWithRole[] = profiles.map((profile) => {
        const userRole = roles.find((r) => r.user_id === profile.user_id);
        return {
          id: profile.id,
          user_id: profile.user_id,
          full_name: profile.full_name,
          email: profile.email,
          department: profile.department,
          position: profile.position,
          created_at: profile.created_at,
          role: userRole?.role || 'staff',
          role_id: userRole?.id || '',
        };
      });

      return usersWithRoles;
    },
    enabled: isAdmin,
  });

  if (!isAdmin) {
    return (
      <MainLayout title={t('admin.title')}>
        <Card>
          <CardContent className="p-8 text-center">
            <Shield className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">
              {language === 'ms' ? 'Akses Ditolak' : 'Access Denied'}
            </h2>
            <p className="text-muted-foreground">
              {language === 'ms'
                ? 'Anda tidak mempunyai kebenaran untuk mengakses halaman ini.'
                : 'You do not have permission to access this page.'}
            </p>
          </CardContent>
        </Card>
      </MainLayout>
    );
  }

  return (
    <MainLayout title={t('admin.title')}>
      <div className="space-y-6">
        {/* Stats */}
        <AdminStats users={users} />

        {/* Tabs */}
        <Tabs defaultValue="users">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="users" className="gap-2">
              <Users className="w-4 h-4" />
              {language === 'ms' ? 'Pengguna' : 'Users'}
            </TabsTrigger>
            <TabsTrigger value="audit" className="gap-2">
              <ScrollText className="w-4 h-4" />
              {language === 'ms' ? 'Log Audit' : 'Audit Log'}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="mt-6">
            <UserList
              users={users}
              isLoading={isLoading}
              onRefresh={refetch}
              currentUserId={user?.id}
            />
          </TabsContent>

          <TabsContent value="audit" className="mt-6">
            <AuditLogList />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
