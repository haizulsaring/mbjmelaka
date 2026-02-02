import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { ProfileForm } from '@/components/profile/ProfileForm';
import { LanguageSettings } from '@/components/profile/LanguageSettings';
import { Loader2 } from 'lucide-react';

export default function Profile() {
  const { t } = useLanguage();
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/auth');
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return (
      <MainLayout title={t('nav.profile')}>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <MainLayout title={t('nav.profile')}>
      <div className="space-y-6">
        <ProfileHeader />
        
        <div className="grid gap-6 md:grid-cols-2">
          <ProfileForm onSuccess={() => window.location.reload()} />
          <LanguageSettings />
        </div>
      </div>
    </MainLayout>
  );
}
