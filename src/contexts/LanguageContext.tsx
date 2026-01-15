import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

type Language = 'ms' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  ms: {
    // Navigation
    'nav.dashboard': 'Papan Pemuka',
    'nav.meetings': 'Mesyuarat MBJ',
    'nav.decisions': 'Keputusan',
    'nav.complaints': 'Aduan & Cadangan',
    'nav.announcements': 'Pengumuman',
    'nav.admin': 'Pentadbiran',
    'nav.profile': 'Profil',
    'nav.logout': 'Log Keluar',
    'nav.login': 'Log Masuk',
    
    // Common
    'common.search': 'Cari...',
    'common.submit': 'Hantar',
    'common.cancel': 'Batal',
    'common.save': 'Simpan',
    'common.edit': 'Edit',
    'common.delete': 'Padam',
    'common.view': 'Lihat',
    'common.status': 'Status',
    'common.date': 'Tarikh',
    'common.actions': 'Tindakan',
    'common.loading': 'Memuatkan...',
    'common.noData': 'Tiada data',
    'common.all': 'Semua',
    
    // Dashboard
    'dashboard.title': 'Papan Pemuka',
    'dashboard.welcome': 'Selamat Datang ke Portal Digital MBJ',
    'dashboard.totalStaff': 'Jumlah Anggota',
    'dashboard.pendingComplaints': 'Aduan Tertunda',
    'dashboard.upcomingMeetings': 'Mesyuarat Akan Datang',
    'dashboard.totalDecisions': 'Jumlah Keputusan',
    'dashboard.recentAnnouncements': 'Pengumuman Terkini',
    'dashboard.recentComplaints': 'Aduan Terkini',
    'dashboard.quickActions': 'Tindakan Pantas',
    
    // Meetings
    'meetings.title': 'Mesyuarat MBJ',
    'meetings.upcoming': 'Mesyuarat Akan Datang',
    'meetings.past': 'Mesyuarat Lepas',
    'meetings.scheduled': 'Dijadualkan',
    'meetings.completed': 'Selesai',
    'meetings.cancelled': 'Dibatalkan',
    'meetings.addNew': 'Tambah Mesyuarat',
    'meetings.viewMinutes': 'Lihat Minit',
    
    // Decisions
    'decisions.title': 'Keputusan MBJ',
    'decisions.pending': 'Tertunda',
    'decisions.inProgress': 'Dalam Proses',
    'decisions.completed': 'Selesai',
    'decisions.overdue': 'Terlewat',
    
    // Complaints
    'complaints.title': 'Aduan & Cadangan',
    'complaints.new': 'Aduan Baru',
    'complaints.complaint': 'Aduan',
    'complaints.suggestion': 'Cadangan',
    'complaints.pending': 'Tertunda',
    'complaints.inProgress': 'Dalam Siasatan',
    'complaints.resolved': 'Selesai',
    'complaints.rejected': 'Ditolak',
    'complaints.submitNew': 'Hantar Aduan/Cadangan',
    'complaints.track': 'Jejak Status',
    'complaints.reference': 'No. Rujukan',
    'complaints.category': 'Kategori',
    'complaints.subject': 'Subjek',
    'complaints.description': 'Keterangan',
    'complaints.priority': 'Keutamaan',
    'complaints.resolution': 'Penyelesaian',
    'complaints.submittedBy': 'Dihantar Oleh',
    'complaints.assignedTo': 'Ditugaskan Kepada',
    
    // Announcements
    'announcements.title': 'Pengumuman',
    'announcements.latest': 'Pengumuman Terkini',
    'announcements.pinned': 'Pengumuman Penting',
    'announcements.general': 'Umum',
    'announcements.urgent': 'Segera',
    'announcements.event': 'Acara',
    
    // Admin
    'admin.title': 'Panel Pentadbiran',
    'admin.users': 'Pengurusan Pengguna',
    'admin.roles': 'Peranan',
    'admin.auditLog': 'Log Audit',
    'admin.settings': 'Tetapan',
    
    // Auth
    'auth.login': 'Log Masuk',
    'auth.logout': 'Log Keluar',
    'auth.email': 'Emel',
    'auth.password': 'Kata Laluan',
    'auth.forgotPassword': 'Lupa Kata Laluan?',
    'auth.register': 'Daftar',
    'auth.noAccount': 'Tiada akaun?',
    'auth.hasAccount': 'Sudah ada akaun?',
    'auth.fullName': 'Nama Penuh',
    
    // Roles
    'role.staff': 'Anggota',
    'role.committee': 'Jawatankuasa MBJ',
    'role.chairman': 'Pengerusi',
    
    // Header
    'header.portalTitle': 'Portal Digital MBJ',
    'header.organization': 'JPJ Negeri Melaka',
    'header.language': 'Bahasa',
  },
  en: {
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.meetings': 'MBJ Meetings',
    'nav.decisions': 'Decisions',
    'nav.complaints': 'Complaints & Suggestions',
    'nav.announcements': 'Announcements',
    'nav.admin': 'Administration',
    'nav.profile': 'Profile',
    'nav.logout': 'Log Out',
    'nav.login': 'Log In',
    
    // Common
    'common.search': 'Search...',
    'common.submit': 'Submit',
    'common.cancel': 'Cancel',
    'common.save': 'Save',
    'common.edit': 'Edit',
    'common.delete': 'Delete',
    'common.view': 'View',
    'common.status': 'Status',
    'common.date': 'Date',
    'common.actions': 'Actions',
    'common.loading': 'Loading...',
    'common.noData': 'No data available',
    'common.all': 'All',
    
    // Dashboard
    'dashboard.title': 'Dashboard',
    'dashboard.welcome': 'Welcome to MBJ Digital Portal',
    'dashboard.totalStaff': 'Total Staff',
    'dashboard.pendingComplaints': 'Pending Complaints',
    'dashboard.upcomingMeetings': 'Upcoming Meetings',
    'dashboard.totalDecisions': 'Total Decisions',
    'dashboard.recentAnnouncements': 'Recent Announcements',
    'dashboard.recentComplaints': 'Recent Complaints',
    'dashboard.quickActions': 'Quick Actions',
    
    // Meetings
    'meetings.title': 'MBJ Meetings',
    'meetings.upcoming': 'Upcoming Meetings',
    'meetings.past': 'Past Meetings',
    'meetings.scheduled': 'Scheduled',
    'meetings.completed': 'Completed',
    'meetings.cancelled': 'Cancelled',
    'meetings.addNew': 'Add Meeting',
    'meetings.viewMinutes': 'View Minutes',
    
    // Decisions
    'decisions.title': 'MBJ Decisions',
    'decisions.pending': 'Pending',
    'decisions.inProgress': 'In Progress',
    'decisions.completed': 'Completed',
    'decisions.overdue': 'Overdue',
    
    // Complaints
    'complaints.title': 'Complaints & Suggestions',
    'complaints.new': 'New Complaint',
    'complaints.complaint': 'Complaint',
    'complaints.suggestion': 'Suggestion',
    'complaints.pending': 'Pending',
    'complaints.inProgress': 'Under Investigation',
    'complaints.resolved': 'Resolved',
    'complaints.rejected': 'Rejected',
    'complaints.submitNew': 'Submit Complaint/Suggestion',
    'complaints.track': 'Track Status',
    'complaints.reference': 'Reference No.',
    'complaints.category': 'Category',
    'complaints.subject': 'Subject',
    'complaints.description': 'Description',
    'complaints.priority': 'Priority',
    'complaints.resolution': 'Resolution',
    'complaints.submittedBy': 'Submitted By',
    'complaints.assignedTo': 'Assigned To',
    
    // Announcements
    'announcements.title': 'Announcements',
    'announcements.latest': 'Latest Announcements',
    'announcements.pinned': 'Important Announcements',
    'announcements.general': 'General',
    'announcements.urgent': 'Urgent',
    'announcements.event': 'Event',
    
    // Admin
    'admin.title': 'Administration Panel',
    'admin.users': 'User Management',
    'admin.roles': 'Roles',
    'admin.auditLog': 'Audit Log',
    'admin.settings': 'Settings',
    
    // Auth
    'auth.login': 'Log In',
    'auth.logout': 'Log Out',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.forgotPassword': 'Forgot Password?',
    'auth.register': 'Register',
    'auth.noAccount': "Don't have an account?",
    'auth.hasAccount': 'Already have an account?',
    'auth.fullName': 'Full Name',
    
    // Roles
    'role.staff': 'Staff',
    'role.committee': 'MBJ Committee',
    'role.chairman': 'Chairman',
    
    // Header
    'header.portalTitle': 'MBJ Digital Portal',
    'header.organization': 'JPJ Melaka State',
    'header.language': 'Language',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('ms');

  const t = useCallback((key: string): string => {
    return translations[language][key] || key;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
