import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Mail, Shield } from 'lucide-react';

export function ProfileHeader() {
  const { profile, roles } = useAuth();
  const { t } = useLanguage();

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'chairman':
        return 'default';
      case 'committee':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
      <CardContent className="pt-6">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
            <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
              {profile?.full_name ? getInitials(profile.full_name) : 'U'}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 text-center sm:text-left space-y-2">
            <h2 className="text-2xl font-bold">{profile?.full_name || t('common.noData')}</h2>
            
            <div className="flex items-center justify-center sm:justify-start gap-2 text-muted-foreground">
              <Mail className="h-4 w-4" />
              <span>{profile?.email}</span>
            </div>
            
            {profile?.position && (
              <p className="text-muted-foreground">{profile.position}</p>
            )}
            
            {profile?.department && (
              <p className="text-sm text-muted-foreground">{profile.department}</p>
            )}
          </div>

          <div className="flex flex-col items-center sm:items-end gap-2">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{t('admin.roles')}</span>
            </div>
            <div className="flex flex-wrap gap-2 justify-center sm:justify-end">
              {roles.map((role) => (
                <Badge key={role} variant={getRoleBadgeVariant(role)}>
                  {t(`role.${role}`)}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
