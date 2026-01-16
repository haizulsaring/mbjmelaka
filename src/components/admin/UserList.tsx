import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
import { Users, Search, Shield, UserCog } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
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

interface UserListProps {
  users: UserWithRole[];
  isLoading: boolean;
  onRefresh: () => void;
  currentUserId: string | undefined;
}

const roleColors: Record<AppRole, string> = {
  chairman: 'bg-primary text-primary-foreground',
  committee: 'bg-success text-success-foreground',
  staff: 'bg-muted text-muted-foreground',
};

export function UserList({ users, isLoading, onRefresh, currentUserId }: UserListProps) {
  const { language } = useLanguage();
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<UserWithRole | null>(null);
  const [newRole, setNewRole] = useState<AppRole>('staff');
  const [isUpdating, setIsUpdating] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.full_name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase()) ||
      (user.department?.toLowerCase().includes(search.toLowerCase()) ?? false);
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const handleRoleChange = (user: UserWithRole, role: AppRole) => {
    setSelectedUser(user);
    setNewRole(role);
    setShowConfirmDialog(true);
  };

  const confirmRoleChange = async () => {
    if (!selectedUser) return;

    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('user_roles')
        .update({ role: newRole })
        .eq('id', selectedUser.role_id);

      if (error) throw error;

      toast.success(
        language === 'ms'
          ? `Peranan ${selectedUser.full_name} berjaya dikemaskini`
          : `${selectedUser.full_name}'s role updated successfully`
      );
      onRefresh();
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error(
        language === 'ms'
          ? 'Gagal mengemaskini peranan'
          : 'Failed to update role'
      );
    } finally {
      setIsUpdating(false);
      setShowConfirmDialog(false);
      setSelectedUser(null);
    }
  };

  const getRoleLabel = (role: AppRole) => {
    const labels: Record<AppRole, { ms: string; en: string }> = {
      chairman: { ms: 'Pengerusi', en: 'Chairman' },
      committee: { ms: 'Jawatankuasa', en: 'Committee' },
      staff: { ms: 'Anggota', en: 'Staff' },
    };
    return labels[role][language];
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
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            {language === 'ms' ? 'Senarai Pengguna' : 'User List'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder={language === 'ms' ? 'Cari pengguna...' : 'Search users...'}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterRole} onValueChange={setFilterRole}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder={language === 'ms' ? 'Semua Peranan' : 'All Roles'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{language === 'ms' ? 'Semua Peranan' : 'All Roles'}</SelectItem>
                <SelectItem value="chairman">{getRoleLabel('chairman')}</SelectItem>
                <SelectItem value="committee">{getRoleLabel('committee')}</SelectItem>
                <SelectItem value="staff">{getRoleLabel('staff')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{language === 'ms' ? 'Nama' : 'Name'}</TableHead>
                  <TableHead>{language === 'ms' ? 'Emel' : 'Email'}</TableHead>
                  <TableHead className="hidden md:table-cell">{language === 'ms' ? 'Jabatan' : 'Department'}</TableHead>
                  <TableHead>{language === 'ms' ? 'Peranan' : 'Role'}</TableHead>
                  <TableHead className="hidden lg:table-cell">{language === 'ms' ? 'Tarikh Daftar' : 'Registered'}</TableHead>
                  <TableHead>{language === 'ms' ? 'Tindakan' : 'Actions'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      {language === 'ms' ? 'Tiada pengguna dijumpai' : 'No users found'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.full_name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        {user.department || '-'}
                      </TableCell>
                      <TableCell>
                        <Badge className={roleColors[user.role]}>
                          {getRoleLabel(user.role)}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {format(new Date(user.created_at), 'dd/MM/yyyy')}
                      </TableCell>
                      <TableCell>
                        {user.user_id !== currentUserId && (
                          <Select
                            value={user.role}
                            onValueChange={(value) => handleRoleChange(user, value as AppRole)}
                          >
                            <SelectTrigger className="w-[130px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="chairman">{getRoleLabel('chairman')}</SelectItem>
                              <SelectItem value="committee">{getRoleLabel('committee')}</SelectItem>
                              <SelectItem value="staff">{getRoleLabel('staff')}</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                        {user.user_id === currentUserId && (
                          <span className="text-sm text-muted-foreground">
                            {language === 'ms' ? '(Anda)' : '(You)'}
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <p className="text-sm text-muted-foreground">
            {language === 'ms'
              ? `Menunjukkan ${filteredUsers.length} daripada ${users.length} pengguna`
              : `Showing ${filteredUsers.length} of ${users.length} users`}
          </p>
        </CardContent>
      </Card>

      {/* Confirm Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              {language === 'ms' ? 'Tukar Peranan Pengguna' : 'Change User Role'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {language === 'ms'
                ? `Adakah anda pasti untuk menukar peranan ${selectedUser?.full_name} kepada ${getRoleLabel(newRole)}?`
                : `Are you sure you want to change ${selectedUser?.full_name}'s role to ${getRoleLabel(newRole)}?`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isUpdating}>
              {language === 'ms' ? 'Batal' : 'Cancel'}
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmRoleChange} disabled={isUpdating}>
              {isUpdating
                ? language === 'ms'
                  ? 'Mengemaskini...'
                  : 'Updating...'
                : language === 'ms'
                ? 'Sahkan'
                : 'Confirm'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
