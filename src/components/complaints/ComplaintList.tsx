import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { StatusBadge } from '@/components/ui/status-badge';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { ms, enUS } from 'date-fns/locale';
import { Search, FileText, Lightbulb, Eye, Filter } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';
import { ComplaintDetailDialog } from './ComplaintDetailDialog';

type Complaint = Tables<'complaints'>;

interface ComplaintListProps {
  complaints: Complaint[];
  isLoading: boolean;
  isAdmin: boolean;
  onRefresh: () => void;
}

const categories: Record<string, { ms: string; en: string }> = {
  welfare: { ms: 'Kebajikan', en: 'Welfare' },
  facilities: { ms: 'Kemudahan', en: 'Facilities' },
  hr: { ms: 'Sumber Manusia', en: 'Human Resources' },
  finance: { ms: 'Kewangan', en: 'Finance' },
  safety: { ms: 'Keselamatan', en: 'Safety' },
  others: { ms: 'Lain-lain', en: 'Others' },
};

const priorities: Record<string, { ms: string; en: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  low: { ms: 'Rendah', en: 'Low', variant: 'outline' },
  normal: { ms: 'Biasa', en: 'Normal', variant: 'secondary' },
  high: { ms: 'Tinggi', en: 'High', variant: 'default' },
  urgent: { ms: 'Segera', en: 'Urgent', variant: 'destructive' },
};

export function ComplaintList({ complaints, isLoading, isAdmin, onRefresh }: ComplaintListProps) {
  const { t, language } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);

  const filteredComplaints = complaints.filter((complaint) => {
    const matchesSearch = 
      complaint.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.reference_number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || complaint.status === statusFilter;
    const matchesType = typeFilter === 'all' || complaint.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusType = (status: string | null): 'pending' | 'inProgress' | 'completed' | 'cancelled' => {
    switch (status) {
      case 'pending': return 'pending';
      case 'in_progress': return 'inProgress';
      case 'resolved': return 'completed';
      case 'rejected': return 'cancelled';
      default: return 'pending';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{language === 'ms' ? 'Senarai Aduan' : 'Complaints List'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{language === 'ms' ? 'Senarai Aduan & Cadangan' : 'Complaints & Suggestions List'}</span>
            <Badge variant="secondary">{filteredComplaints.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={language === 'ms' ? 'Cari subjek atau no. rujukan...' : 'Search subject or reference no...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('common.all')}</SelectItem>
                <SelectItem value="complaint">{t('complaints.complaint')}</SelectItem>
                <SelectItem value="suggestion">{t('complaints.suggestion')}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('common.all')}</SelectItem>
                <SelectItem value="pending">{t('complaints.pending')}</SelectItem>
                <SelectItem value="in_progress">{t('complaints.inProgress')}</SelectItem>
                <SelectItem value="resolved">{t('complaints.resolved')}</SelectItem>
                <SelectItem value="rejected">{t('complaints.rejected')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          {filteredComplaints.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>{t('common.noData')}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('complaints.reference')}</TableHead>
                    <TableHead>{language === 'ms' ? 'Jenis' : 'Type'}</TableHead>
                    <TableHead>{t('complaints.subject')}</TableHead>
                    <TableHead>{t('complaints.category')}</TableHead>
                    <TableHead>{t('common.status')}</TableHead>
                    <TableHead>{language === 'ms' ? 'Keutamaan' : 'Priority'}</TableHead>
                    <TableHead>{t('common.date')}</TableHead>
                    <TableHead>{t('common.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredComplaints.map((complaint) => (
                    <TableRow key={complaint.id}>
                      <TableCell className="font-mono text-sm">
                        {complaint.reference_number}
                      </TableCell>
                      <TableCell>
                        {complaint.type === 'complaint' ? (
                          <div className="flex items-center gap-1.5">
                            <FileText className="w-4 h-4 text-destructive" />
                            <span className="text-sm">{t('complaints.complaint')}</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <Lightbulb className="w-4 h-4 text-warning" />
                            <span className="text-sm">{t('complaints.suggestion')}</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {complaint.subject}
                      </TableCell>
                      <TableCell>
                        {categories[complaint.category]?.[language] || complaint.category}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={getStatusType(complaint.status)} />
                      </TableCell>
                      <TableCell>
                        {complaint.priority && (
                          <Badge variant={priorities[complaint.priority]?.variant || 'secondary'}>
                            {priorities[complaint.priority]?.[language] || complaint.priority}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(complaint.created_at), 'dd MMM yyyy', {
                          locale: language === 'ms' ? ms : enUS,
                        })}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedComplaint(complaint)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedComplaint && (
        <ComplaintDetailDialog
          complaint={selectedComplaint}
          isAdmin={isAdmin}
          onClose={() => setSelectedComplaint(null)}
          onUpdate={onRefresh}
        />
      )}
    </>
  );
}
