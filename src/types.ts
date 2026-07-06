export type FileType = 'pdf' | 'ppt' | 'pptx' | 'gslide' | 'drive' | 'youtube' | 'web_embed';

export interface Document {
  id: string;
  title: string;
  description: string;
  file_url: string;
  file_type: FileType;
  category: string;
  created_at: string;
}

export interface LinkItem {
  id: string;
  title: string;
  description: string;
  url: string;
  icon: string;
  color: string;
  width: 'small' | 'medium' | 'large' | 'xl' | 'custom';
  height?: string; // e.g. "120px" or custom
  custom_width?: string; // e.g. "300px" or custom
  category: string;
  position: number;
  created_at: string;
}

export interface User {
  id: string;
  fullname: string;
  role: 'Administrator' | 'User';
  email: string;
}

export interface ViewerConfig {
  width: string; // e.g. "100%"
  height: string; // e.g. "600px"
  borderRadius: string; // e.g. "16px"
  shadow: string; // e.g. "shadow-lg", "shadow-2xl", "shadow-inner"
}

export interface ActivityLog {
  id: string;
  user: string;
  action: string;
  timestamp: string;
}

export interface AppSettings {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  headerTitle: string;
  headerSubtitle1: string;
  headerSubtitle2: string;
  headerDetails: string;
  sheetId: string;
  scriptUrl: string;
  driveFolderUrl: string;
}
