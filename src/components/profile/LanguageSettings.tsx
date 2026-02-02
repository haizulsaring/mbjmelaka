import { useState } from 'react';
import { Globe, Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

export function LanguageSettings() {
  const { language, setLanguage, t } = useLanguage();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(language);

  const handleSave = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          preferred_language: selectedLanguage,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (error) throw error;

      setLanguage(selectedLanguage);
      toast.success(t('profile.languageUpdateSuccess'));
    } catch (error) {
      console.error('Error updating language preference:', error);
      toast.error(t('profile.updateError'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="w-5 h-5" />
          {t('profile.languageSettings')}
        </CardTitle>
        <CardDescription>{t('profile.languageSettingsDesc')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <RadioGroup
          value={selectedLanguage}
          onValueChange={(value) => setSelectedLanguage(value as 'ms' | 'en')}
          className="space-y-3"
        >
          <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer">
            <RadioGroupItem value="ms" id="ms" />
            <Label htmlFor="ms" className="flex-1 cursor-pointer">
              <div className="font-medium">Bahasa Melayu</div>
              <div className="text-sm text-muted-foreground">
                Gunakan Bahasa Melayu sebagai bahasa utama
              </div>
            </Label>
            <span className="text-2xl">🇲🇾</span>
          </div>
          
          <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer">
            <RadioGroupItem value="en" id="en" />
            <Label htmlFor="en" className="flex-1 cursor-pointer">
              <div className="font-medium">English</div>
              <div className="text-sm text-muted-foreground">
                Use English as the primary language
              </div>
            </Label>
            <span className="text-2xl">🇬🇧</span>
          </div>
        </RadioGroup>

        <Button 
          onClick={handleSave} 
          disabled={isLoading || selectedLanguage === language}
          className="w-full"
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {t('common.save')}
        </Button>
      </CardContent>
    </Card>
  );
}
