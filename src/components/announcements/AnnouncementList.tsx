import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, Megaphone } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';
import { AnnouncementCard } from './AnnouncementCard';

type Announcement = Tables<'announcements'>;

interface AnnouncementListProps {
  announcements: Announcement[];
  isLoading: boolean;
  isAdmin: boolean;
  onEdit: (announcement: Announcement) => void;
  onDelete: (announcement: Announcement) => void;
}

const categories = [
  { value: 'all', labelMs: 'Semua', labelEn: 'All' },
  { value: 'general', labelMs: 'Umum', labelEn: 'General' },
  { value: 'urgent', labelMs: 'Segera', labelEn: 'Urgent' },
  { value: 'event', labelMs: 'Acara', labelEn: 'Event' },
  { value: 'policy', labelMs: 'Polisi', labelEn: 'Policy' },
  { value: 'welfare', labelMs: 'Kebajikan', labelEn: 'Welfare' },
  { value: 'hr', labelMs: 'Sumber Manusia', labelEn: 'Human Resources' },
];

export function AnnouncementList({ announcements, isLoading, isAdmin, onEdit, onDelete }: AnnouncementListProps) {
  const { t, language } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Filter and sort: pinned first, then by date
  const filteredAnnouncements = announcements
    .filter((announcement) => {
      const title = language === 'en' && announcement.title_en ? announcement.title_en : announcement.title;
      const matchesSearch = title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || announcement.category === categoryFilter;
      
      // Filter out expired announcements
      const isExpired = announcement.expires_at && new Date(announcement.expires_at) < new Date();
      
      return matchesSearch && matchesCategory && !isExpired;
    })
    .sort((a, b) => {
      // Pinned first
      if (a.is_pinned && !b.is_pinned) return -1;
      if (!a.is_pinned && b.is_pinned) return 1;
      // Then by date (newest first)
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  const pinnedCount = filteredAnnouncements.filter(a => a.is_pinned).length;

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-40 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={language === 'ms' ? 'Cari pengumuman...' : 'Search announcements...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <Filter className="w-4 h-4 mr-2" />
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
        <Badge variant="secondary" className="h-10 px-4 flex items-center gap-2">
          {filteredAnnouncements.length} {language === 'ms' ? 'pengumuman' : 'announcements'}
        </Badge>
      </div>

      {/* List */}
      {filteredAnnouncements.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Megaphone className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>{t('common.noData')}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAnnouncements.map((announcement) => (
            <AnnouncementCard
              key={announcement.id}
              announcement={announcement}
              isAdmin={isAdmin}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
