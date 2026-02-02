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
    'meetings.editMeeting': 'Edit Mesyuarat',
    'meetings.viewMinutes': 'Lihat Minit',
    'meetings.viewDecisions': 'Lihat Keputusan',
    'meetings.titleMs': 'Tajuk (BM)',
    'meetings.titleEn': 'Tajuk (EN)',
    'meetings.titlePlaceholder': 'Masukkan tajuk mesyuarat',
    'meetings.titlePlaceholderEn': 'Enter meeting title',
    'meetings.descriptionMs': 'Keterangan (BM)',
    'meetings.descriptionEn': 'Keterangan (EN)',
    'meetings.descriptionPlaceholder': 'Masukkan keterangan mesyuarat',
    'meetings.descriptionPlaceholderEn': 'Enter meeting description',
    'meetings.description': 'Keterangan',
    'meetings.date': 'Tarikh & Masa',
    'meetings.selectDate': 'Pilih tarikh',
    'meetings.location': 'Lokasi',
    'meetings.locationPlaceholder': 'Cth: Bilik Mesyuarat Utama',
    'meetings.selectStatus': 'Pilih status',
    'meetings.minutes': 'Minit Mesyuarat',
    'meetings.uploadMinutes': 'Muat naik minit mesyuarat',
    'meetings.existingMinutes': 'Minit sedia ada',
    'meetings.fileTooLarge': 'Fail terlalu besar (max 10MB)',
    'meetings.uploadError': 'Gagal memuat naik fail',
    'meetings.createSuccess': 'Mesyuarat berjaya dicipta',
    'meetings.updateSuccess': 'Mesyuarat berjaya dikemaskini',
    'meetings.deleteSuccess': 'Mesyuarat berjaya dipadam',
    'meetings.saveError': 'Gagal menyimpan mesyuarat',
    'meetings.deleteError': 'Gagal memadam mesyuarat',
    'meetings.confirmDelete': 'Padam Mesyuarat?',
    'meetings.deleteWarning': 'Tindakan ini tidak boleh dibatalkan. Semua keputusan berkaitan juga akan dipadam.',
    'meetings.decisions': 'Keputusan',
    'meetings.noDecisions': 'Tiada keputusan untuk mesyuarat ini',
    
    // Decisions
    'decisions.title': 'Keputusan MBJ',
    'decisions.pending': 'Tertunda',
    'decisions.inProgress': 'Dalam Proses',
    'decisions.completed': 'Selesai',
    'decisions.overdue': 'Terlewat',
    'decisions.addNew': 'Tambah Keputusan',
    'decisions.editDecision': 'Edit Keputusan',
    'decisions.number': 'Nombor Keputusan',
    'decisions.titleMs': 'Tajuk (BM)',
    'decisions.titleEn': 'Tajuk (EN)',
    'decisions.titlePlaceholder': 'Masukkan tajuk keputusan',
    'decisions.titlePlaceholderEn': 'Enter decision title',
    'decisions.descriptionMs': 'Keterangan (BM)',
    'decisions.descriptionEn': 'Keterangan (EN)',
    'decisions.descriptionPlaceholder': 'Masukkan keterangan keputusan',
    'decisions.descriptionPlaceholderEn': 'Enter decision description',
    'decisions.responsibleParty': 'Pihak Bertanggungjawab',
    'decisions.responsiblePlaceholder': 'Cth: Bahagian Pentadbiran',
    'decisions.dueDate': 'Tarikh Akhir',
    'decisions.selectDate': 'Pilih tarikh',
    'decisions.selectStatus': 'Pilih status',
    'decisions.createSuccess': 'Keputusan berjaya dicipta',
    'decisions.updateSuccess': 'Keputusan berjaya dikemaskini',
    'decisions.deleteSuccess': 'Keputusan berjaya dipadam',
    'decisions.saveError': 'Gagal menyimpan keputusan',
    'decisions.deleteError': 'Gagal memadam keputusan',
    'decisions.confirmDelete': 'Padam Keputusan?',
    'decisions.deleteWarning': 'Tindakan ini tidak boleh dibatalkan.',
    
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
    'announcements.new': 'Pengumuman Baru',
    'announcements.edit': 'Edit Pengumuman',
    'announcements.delete': 'Padam Pengumuman',
    'announcements.publish': 'Terbitkan',
    'announcements.expires': 'Tarikh Tamat',
    
    // Admin
    'admin.title': 'Panel Pentadbiran',
    'admin.users': 'Pengurusan Pengguna',
    'admin.roles': 'Peranan',
    'admin.auditLog': 'Log Audit',
    'admin.settings': 'Tetapan',
    'admin.totalUsers': 'Jumlah Pengguna',
    'admin.changeRole': 'Tukar Peranan',
    'admin.confirmChange': 'Sahkan Perubahan',
    'admin.accessDenied': 'Akses Ditolak',
    'admin.noPermission': 'Anda tidak mempunyai kebenaran untuk mengakses halaman ini.',
    
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
    
    // Profile
    'profile.personalInfo': 'Maklumat Peribadi',
    'profile.personalInfoDesc': 'Kemaskini maklumat profil anda',
    'profile.phone': 'No. Telefon',
    'profile.department': 'Jabatan',
    'profile.departmentPlaceholder': 'Cth: Bahagian Pentadbiran',
    'profile.position': 'Jawatan',
    'profile.positionPlaceholder': 'Cth: Pegawai Tadbir',
    'profile.updateSuccess': 'Profil berjaya dikemaskini',
    'profile.updateError': 'Gagal mengemaskini profil',
    'profile.languageSettings': 'Tetapan Bahasa',
    'profile.languageSettingsDesc': 'Pilih bahasa pilihan anda untuk antaramuka',
    'profile.languageUpdateSuccess': 'Bahasa berjaya dikemaskini',
    
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
    'meetings.editMeeting': 'Edit Meeting',
    'meetings.viewMinutes': 'View Minutes',
    'meetings.viewDecisions': 'View Decisions',
    'meetings.titleMs': 'Title (BM)',
    'meetings.titleEn': 'Title (EN)',
    'meetings.titlePlaceholder': 'Enter meeting title',
    'meetings.titlePlaceholderEn': 'Enter meeting title',
    'meetings.descriptionMs': 'Description (BM)',
    'meetings.descriptionEn': 'Description (EN)',
    'meetings.descriptionPlaceholder': 'Enter meeting description',
    'meetings.descriptionPlaceholderEn': 'Enter meeting description',
    'meetings.description': 'Description',
    'meetings.date': 'Date & Time',
    'meetings.selectDate': 'Select date',
    'meetings.location': 'Location',
    'meetings.locationPlaceholder': 'E.g: Main Meeting Room',
    'meetings.selectStatus': 'Select status',
    'meetings.minutes': 'Meeting Minutes',
    'meetings.uploadMinutes': 'Upload meeting minutes',
    'meetings.existingMinutes': 'Existing minutes',
    'meetings.fileTooLarge': 'File too large (max 10MB)',
    'meetings.uploadError': 'Failed to upload file',
    'meetings.createSuccess': 'Meeting created successfully',
    'meetings.updateSuccess': 'Meeting updated successfully',
    'meetings.deleteSuccess': 'Meeting deleted successfully',
    'meetings.saveError': 'Failed to save meeting',
    'meetings.deleteError': 'Failed to delete meeting',
    'meetings.confirmDelete': 'Delete Meeting?',
    'meetings.deleteWarning': 'This action cannot be undone. All related decisions will also be deleted.',
    'meetings.decisions': 'Decisions',
    'meetings.noDecisions': 'No decisions for this meeting',
    
    // Decisions
    'decisions.title': 'MBJ Decisions',
    'decisions.pending': 'Pending',
    'decisions.inProgress': 'In Progress',
    'decisions.completed': 'Completed',
    'decisions.overdue': 'Overdue',
    'decisions.addNew': 'Add Decision',
    'decisions.editDecision': 'Edit Decision',
    'decisions.number': 'Decision Number',
    'decisions.titleMs': 'Title (BM)',
    'decisions.titleEn': 'Title (EN)',
    'decisions.titlePlaceholder': 'Enter decision title',
    'decisions.titlePlaceholderEn': 'Enter decision title',
    'decisions.descriptionMs': 'Description (BM)',
    'decisions.descriptionEn': 'Description (EN)',
    'decisions.descriptionPlaceholder': 'Enter decision description',
    'decisions.descriptionPlaceholderEn': 'Enter decision description',
    'decisions.responsibleParty': 'Responsible Party',
    'decisions.responsiblePlaceholder': 'E.g: Administration Division',
    'decisions.dueDate': 'Due Date',
    'decisions.selectDate': 'Select date',
    'decisions.selectStatus': 'Select status',
    'decisions.createSuccess': 'Decision created successfully',
    'decisions.updateSuccess': 'Decision updated successfully',
    'decisions.deleteSuccess': 'Decision deleted successfully',
    'decisions.saveError': 'Failed to save decision',
    'decisions.deleteError': 'Failed to delete decision',
    'decisions.confirmDelete': 'Delete Decision?',
    'decisions.deleteWarning': 'This action cannot be undone.',
    
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
    'announcements.new': 'New Announcement',
    'announcements.edit': 'Edit Announcement',
    'announcements.delete': 'Delete Announcement',
    'announcements.publish': 'Publish',
    'announcements.expires': 'Expiry Date',
    
    // Admin
    'admin.title': 'Administration Panel',
    'admin.users': 'User Management',
    'admin.roles': 'Roles',
    'admin.auditLog': 'Audit Log',
    'admin.settings': 'Settings',
    'admin.totalUsers': 'Total Users',
    'admin.changeRole': 'Change Role',
    'admin.confirmChange': 'Confirm Change',
    'admin.accessDenied': 'Access Denied',
    'admin.noPermission': 'You do not have permission to access this page.',
    
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
    
    // Profile
    'profile.personalInfo': 'Personal Information',
    'profile.personalInfoDesc': 'Update your profile information',
    'profile.phone': 'Phone Number',
    'profile.department': 'Department',
    'profile.departmentPlaceholder': 'E.g: Administration Division',
    'profile.position': 'Position',
    'profile.positionPlaceholder': 'E.g: Administrative Officer',
    'profile.updateSuccess': 'Profile updated successfully',
    'profile.updateError': 'Failed to update profile',
    'profile.languageSettings': 'Language Settings',
    'profile.languageSettingsDesc': 'Choose your preferred interface language',
    'profile.languageUpdateSuccess': 'Language updated successfully',
    
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
