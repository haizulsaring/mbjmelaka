import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Calendar, 
  MessageSquare, 
  Megaphone, 
  FileCheck, 
  Shield, 
  Users,
  Globe,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function Landing() {
  const { t, language, setLanguage } = useLanguage();
  const { user } = useAuth();

  const features = [
    {
      icon: Calendar,
      title: language === 'ms' ? 'Mesyuarat MBJ' : 'MBJ Meetings',
      description: language === 'ms' 
        ? 'Pengurusan mesyuarat dan minit secara digital'
        : 'Digital meeting and minutes management',
    },
    {
      icon: FileCheck,
      title: language === 'ms' ? 'Keputusan & Tindakan' : 'Decisions & Actions',
      description: language === 'ms'
        ? 'Jejak keputusan dan status pelaksanaan'
        : 'Track decisions and implementation status',
    },
    {
      icon: MessageSquare,
      title: language === 'ms' ? 'Aduan & Cadangan' : 'Complaints & Suggestions',
      description: language === 'ms'
        ? 'Sistem aduan telus dengan penjejakan status'
        : 'Transparent complaint system with status tracking',
    },
    {
      icon: Megaphone,
      title: language === 'ms' ? 'Pengumuman' : 'Announcements',
      description: language === 'ms'
        ? 'Makluman dan pengumuman rasmi jabatan'
        : 'Official department notices and announcements',
    },
  ];

  const benefits = [
    language === 'ms' ? 'Akses mudah untuk semua anggota' : 'Easy access for all staff',
    language === 'ms' ? 'Ketelusan dalam pengurusan' : 'Transparency in management',
    language === 'ms' ? 'Rekod digital yang selamat' : 'Secure digital records',
    language === 'ms' ? 'Jejak status secara langsung' : 'Real-time status tracking',
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="header-gradient gold-accent-border sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center shadow-gold">
                <span className="text-secondary-foreground font-bold text-xl">MBJ</span>
              </div>
              <div className="text-primary-foreground">
                <h1 className="font-bold text-lg leading-tight">Portal Digital MBJ</h1>
                <p className="text-sm text-primary-foreground/70">JPJ Negeri Melaka</p>
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-primary-foreground hover:bg-primary-foreground/10">
                    <Globe className="w-4 h-4 mr-2" />
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

              {user ? (
                <Button asChild className="bg-secondary text-secondary-foreground hover:bg-secondary/90">
                  <Link to="/dashboard">
                    {language === 'ms' ? 'Papan Pemuka' : 'Dashboard'}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              ) : (
                <Button asChild className="bg-secondary text-secondary-foreground hover:bg-secondary/90">
                  <Link to="/auth">
                    {t('auth.login')}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="header-gradient py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAzMHYySDI0di0yaDEyek0zNiAyNnYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-3xl mx-auto text-center text-primary-foreground">
            <div className="inline-flex items-center gap-2 bg-primary-foreground/10 rounded-full px-4 py-2 mb-6">
              <Shield className="w-4 h-4" />
              <span className="text-sm font-medium">
                {language === 'ms' ? 'Portal Dalaman Rasmi' : 'Official Internal Portal'}
              </span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              {language === 'ms' 
                ? 'Portal Digital Majlis Bersama Jabatan'
                : 'Department Joint Council Digital Portal'}
            </h1>
            
            <p className="text-xl text-primary-foreground/80 mb-8">
              {language === 'ms'
                ? 'Platform pengurusan MBJ yang telus dan efisien untuk semua warga JPJ Negeri Melaka'
                : 'Transparent and efficient MBJ management platform for all JPJ Melaka State staff'}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-gold">
                <Link to="/auth">
                  {language === 'ms' ? 'Masuk ke Portal' : 'Enter Portal'}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Wave decoration */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="hsl(var(--background))"/>
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              {language === 'ms' ? 'Modul Utama' : 'Core Modules'}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {language === 'ms'
                ? 'Semua fungsi penting untuk pengurusan MBJ dalam satu platform'
                : 'All essential functions for MBJ management in one platform'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="dashboard-card bg-card rounded-xl p-6 border border-border"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-6">
                {language === 'ms' ? 'Kelebihan Portal' : 'Portal Benefits'}
              </h2>
              <p className="text-muted-foreground mb-8">
                {language === 'ms'
                  ? 'Portal Digital MBJ direka untuk meningkatkan kecekapan dan ketelusan dalam pengurusan hal ehwal pekerja di JPJ Negeri Melaka.'
                  : 'MBJ Digital Portal is designed to enhance efficiency and transparency in managing staff affairs at JPJ Melaka State.'}
              </p>
              <ul className="space-y-4">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />
                    <span className="text-foreground">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="bg-card rounded-xl p-8 border border-border shadow-gov">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-xl bg-primary flex items-center justify-center">
                  <Users className="w-8 h-8 text-primary-foreground" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-foreground">3</p>
                  <p className="text-muted-foreground">
                    {language === 'ms' ? 'Tahap Akses' : 'Access Levels'}
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                  <span className="font-medium">{t('role.staff')}</span>
                  <span className="text-xs text-muted-foreground">
                    {language === 'ms' ? 'Semua anggota' : 'All staff'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                  <span className="font-medium">{t('role.committee')}</span>
                  <span className="text-xs text-muted-foreground">
                    {language === 'ms' ? 'Ahli MBJ' : 'MBJ Members'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-primary/10 border border-primary/20">
                  <span className="font-medium text-primary">{t('role.chairman')}</span>
                  <span className="text-xs text-primary/70">
                    {language === 'ms' ? 'Pengurusan' : 'Management'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 header-gradient">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-primary-foreground mb-4">
            {language === 'ms' 
              ? 'Sedia untuk memulakan?' 
              : 'Ready to get started?'}
          </h2>
          <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">
            {language === 'ms'
              ? 'Log masuk untuk mengakses semua fungsi Portal Digital MBJ.'
              : 'Log in to access all MBJ Digital Portal functions.'}
          </p>
          <Button asChild size="lg" className="bg-secondary text-secondary-foreground hover:bg-secondary/90">
            <Link to="/auth">
              {t('auth.login')}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-8">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold">MBJ</span>
              </div>
              <div>
                <p className="font-semibold text-foreground">Portal Digital MBJ</p>
                <p className="text-sm text-muted-foreground">JPJ Negeri Melaka</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 JPJ Negeri Melaka. {language === 'ms' ? 'Hak Cipta Terpelihara.' : 'All Rights Reserved.'}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
