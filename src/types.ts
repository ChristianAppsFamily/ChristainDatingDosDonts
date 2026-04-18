export interface Quote {
  id: string;
  text: string;
  reference: string;
  type: 'verse' | 'advice' | 'inspiration';
  date: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  type: 'do' | 'dont';
  completed: boolean;
}

export interface JournalEntry {
  id: string;
  title: string;
  content: string;
  date: string;
}

export interface Comment {
  id: string;
  userName: string;
  text: string;
  timestamp: string;
}

export type Tab = 'home' | 'bookmarks' | 'checklist' | 'journal' | 'profile';

// React Native WebView interface
declare global {
  interface Window {
    ReactNativeWebView?: {
      postMessage: (message: string) => void;
    };
  }
}
