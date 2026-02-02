import { MainLayout } from '@/components/layout/MainLayout';
import { useLanguage } from '@/contexts/LanguageContext';
import { MeetingList } from '@/components/meetings/MeetingList';

export default function Meetings() {
  const { t } = useLanguage();
  
  return (
    <MainLayout title={t('meetings.title')}>
      <MeetingList />
    </MainLayout>
  );
}
