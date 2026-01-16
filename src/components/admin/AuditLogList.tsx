import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollText, Search, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface AuditLog {
  id: string;
  user_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  old_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

const actionColors: Record<string, string> = {
  create: 'bg-success text-success-foreground',
  update: 'bg-warning text-warning-foreground',
  delete: 'bg-destructive text-destructive-foreground',
  login: 'bg-primary text-primary-foreground',
  logout: 'bg-muted text-muted-foreground',
};

export function AuditLogList() {
  const { language } = useLanguage();
  const [search, setSearch] = useState('');
  const [filterEntity, setFilterEntity] = useState<string>('all');

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['audit-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      return data as AuditLog[];
    },
  });

  const entityTypes = [...new Set(logs.map((log) => log.entity_type))];

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.entity_type.toLowerCase().includes(search.toLowerCase());
    const matchesEntity = filterEntity === 'all' || log.entity_type === filterEntity;
    return matchesSearch && matchesEntity;
  });

  const getActionLabel = (action: string) => {
    const labels: Record<string, { ms: string; en: string }> = {
      create: { ms: 'Cipta', en: 'Create' },
      update: { ms: 'Kemaskini', en: 'Update' },
      delete: { ms: 'Padam', en: 'Delete' },
      login: { ms: 'Log Masuk', en: 'Login' },
      logout: { ms: 'Log Keluar', en: 'Logout' },
    };
    return labels[action]?.[language] || action;
  };

  const getEntityLabel = (entity: string) => {
    const labels: Record<string, { ms: string; en: string }> = {
      complaints: { ms: 'Aduan', en: 'Complaints' },
      announcements: { ms: 'Pengumuman', en: 'Announcements' },
      meetings: { ms: 'Mesyuarat', en: 'Meetings' },
      decisions: { ms: 'Keputusan', en: 'Decisions' },
      profiles: { ms: 'Profil', en: 'Profiles' },
      user_roles: { ms: 'Peranan', en: 'Roles' },
    };
    return labels[entity]?.[language] || entity;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ScrollText className="w-5 h-5" />
          {language === 'ms' ? 'Log Audit' : 'Audit Log'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder={language === 'ms' ? 'Cari aktiviti...' : 'Search activity...'}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterEntity} onValueChange={setFilterEntity}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder={language === 'ms' ? 'Semua Entiti' : 'All Entities'} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{language === 'ms' ? 'Semua Entiti' : 'All Entities'}</SelectItem>
              {entityTypes.map((entity) => (
                <SelectItem key={entity} value={entity}>
                  {getEntityLabel(entity)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{language === 'ms' ? 'Masa' : 'Time'}</TableHead>
                <TableHead>{language === 'ms' ? 'Tindakan' : 'Action'}</TableHead>
                <TableHead>{language === 'ms' ? 'Entiti' : 'Entity'}</TableHead>
                <TableHead className="hidden md:table-cell">{language === 'ms' ? 'IP' : 'IP Address'}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                    {language === 'ms' ? 'Tiada log audit' : 'No audit logs'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">
                          {format(new Date(log.created_at), 'dd/MM/yyyy HH:mm')}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={actionColors[log.action] || 'bg-muted'}>
                        {getActionLabel(log.action)}
                      </Badge>
                    </TableCell>
                    <TableCell>{getEntityLabel(log.entity_type)}</TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">
                      {log.ip_address || '-'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <p className="text-sm text-muted-foreground">
          {language === 'ms'
            ? `Menunjukkan ${filteredLogs.length} log terkini`
            : `Showing ${filteredLogs.length} recent logs`}
        </p>
      </CardContent>
    </Card>
  );
}
