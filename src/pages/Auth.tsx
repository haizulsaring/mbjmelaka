import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Globe, AlertCircle } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const loginSchema = z.object({
  email: z.string().trim().email('Sila masukkan emel yang sah').max(255),
  password: z.string().min(6, 'Kata laluan mestilah sekurang-kurangnya 6 aksara').max(100),
});

const registerSchema = z.object({
  fullName: z.string().trim().min(2, 'Nama mestilah sekurang-kurangnya 2 aksara').max(100),
  email: z.string().trim().email('Sila masukkan emel yang sah').max(255),
  password: z.string().min(6, 'Kata laluan mestilah sekurang-kurangnya 6 aksara').max(100),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Kata laluan tidak sepadan',
  path: ['confirmPassword'],
});

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signIn, signUp, user } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const navigate = useNavigate();

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { fullName: '', email: '', password: '', confirmPassword: '' },
  });

  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const handleLogin = async (data: LoginFormData) => {
    setIsSubmitting(true);
    setError(null);

    const { error } = await signIn(data.email, data.password);
    
    if (error) {
      if (error.message.includes('Invalid login')) {
        setError(language === 'ms' ? 'Emel atau kata laluan tidak sah' : 'Invalid email or password');
      } else {
        setError(error.message);
      }
    }
    
    setIsSubmitting(false);
  };

  const handleRegister = async (data: RegisterFormData) => {
    setIsSubmitting(true);
    setError(null);

    const { error } = await signUp(data.email, data.password, data.fullName);
    
    if (error) {
      if (error.message.includes('already registered')) {
        setError(language === 'ms' ? 'Emel ini telah didaftarkan' : 'This email is already registered');
      } else {
        setError(error.message);
      }
    }
    
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 header-gradient gold-accent-border relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAzMHYySDI0di0yaDEyek0zNiAyNnYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        
        <div className="relative z-10 flex flex-col justify-center px-12 text-primary-foreground">
          <div className="mb-8">
            <div className="w-20 h-20 rounded-xl bg-secondary flex items-center justify-center mb-6 shadow-gold">
              <span className="text-secondary-foreground font-bold text-3xl">MBJ</span>
            </div>
            <h1 className="text-4xl font-bold mb-4">
              {t('header.portalTitle')}
            </h1>
            <p className="text-xl text-primary-foreground/80 mb-2">
              {t('header.organization')}
            </p>
            <div className="w-24 h-1 bg-secondary rounded-full" />
          </div>
          
          <div className="space-y-4 text-primary-foreground/70">
            <p className="text-lg">
              {language === 'ms' 
                ? 'Portal dalaman untuk pengurusan Majlis Bersama Jabatan'
                : 'Internal portal for Department Joint Council management'}
            </p>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-secondary rounded-full" />
                <span>{language === 'ms' ? 'Mesyuarat & Keputusan' : 'Meetings & Decisions'}</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-secondary rounded-full" />
                <span>{language === 'ms' ? 'Aduan & Cadangan' : 'Complaints & Suggestions'}</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-secondary rounded-full" />
                <span>{language === 'ms' ? 'Pengumuman' : 'Announcements'}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Language Toggle */}
          <div className="flex justify-end mb-6">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Globe className="w-4 h-4" />
                  {language === 'ms' ? 'BM' : 'EN'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setLanguage('ms')}>
                  Bahasa Malaysia
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage('en')}>
                  English
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="w-16 h-16 rounded-xl bg-primary flex items-center justify-center mx-auto mb-4">
              <span className="text-primary-foreground font-bold text-2xl">MBJ</span>
            </div>
            <h1 className="text-2xl font-bold text-foreground">{t('header.portalTitle')}</h1>
            <p className="text-muted-foreground">{t('header.organization')}</p>
          </div>

          <Card className="shadow-gov">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold">
                {isLogin ? t('auth.login') : t('auth.register')}
              </CardTitle>
              <CardDescription>
                {isLogin 
                  ? (language === 'ms' ? 'Masukkan maklumat anda untuk log masuk' : 'Enter your credentials to sign in')
                  : (language === 'ms' ? 'Cipta akaun baru untuk mengakses portal' : 'Create a new account to access the portal')}
              </CardDescription>
            </CardHeader>

            <CardContent>
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {isLogin ? (
                <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">{t('auth.email')}</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="nama@jpj.gov.my"
                      {...loginForm.register('email')}
                      className="gov-input"
                    />
                    {loginForm.formState.errors.email && (
                      <p className="text-sm text-destructive">{loginForm.formState.errors.email.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password">{t('auth.password')}</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      {...loginForm.register('password')}
                      className="gov-input"
                    />
                    {loginForm.formState.errors.password && (
                      <p className="text-sm text-destructive">{loginForm.formState.errors.password.message}</p>
                    )}
                  </div>

                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t('common.loading')}
                      </>
                    ) : (
                      t('auth.login')
                    )}
                  </Button>
                </form>
              ) : (
                <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">{t('auth.fullName')}</Label>
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="Ahmad bin Abdullah"
                      {...registerForm.register('fullName')}
                      className="gov-input"
                    />
                    {registerForm.formState.errors.fullName && (
                      <p className="text-sm text-destructive">{registerForm.formState.errors.fullName.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="regEmail">{t('auth.email')}</Label>
                    <Input
                      id="regEmail"
                      type="email"
                      placeholder="nama@jpj.gov.my"
                      {...registerForm.register('email')}
                      className="gov-input"
                    />
                    {registerForm.formState.errors.email && (
                      <p className="text-sm text-destructive">{registerForm.formState.errors.email.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="regPassword">{t('auth.password')}</Label>
                    <Input
                      id="regPassword"
                      type="password"
                      placeholder="••••••••"
                      {...registerForm.register('password')}
                      className="gov-input"
                    />
                    {registerForm.formState.errors.password && (
                      <p className="text-sm text-destructive">{registerForm.formState.errors.password.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">
                      {language === 'ms' ? 'Sahkan Kata Laluan' : 'Confirm Password'}
                    </Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      {...registerForm.register('confirmPassword')}
                      className="gov-input"
                    />
                    {registerForm.formState.errors.confirmPassword && (
                      <p className="text-sm text-destructive">{registerForm.formState.errors.confirmPassword.message}</p>
                    )}
                  </div>

                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t('common.loading')}
                      </>
                    ) : (
                      t('auth.register')
                    )}
                  </Button>
                </form>
              )}
            </CardContent>

            <CardFooter>
              <p className="text-sm text-muted-foreground text-center w-full">
                {isLogin ? t('auth.noAccount') : t('auth.hasAccount')}{' '}
                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setError(null);
                  }}
                  className="text-primary hover:underline font-medium"
                >
                  {isLogin ? t('auth.register') : t('auth.login')}
                </button>
              </p>
            </CardFooter>
          </Card>

          {/* Footer */}
          <p className="text-center text-xs text-muted-foreground mt-6">
            © 2024 JPJ Negeri Melaka. {language === 'ms' ? 'Hak Cipta Terpelihara.' : 'All Rights Reserved.'}
          </p>
        </div>
      </div>
    </div>
  );
}
