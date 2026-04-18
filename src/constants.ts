import { Quote, ChecklistItem } from './types';

export const INITIAL_QUOTES: Quote[] = [
  {
    id: '1',
    text: "Guard your heart above all else, for it determines the course of your life.",
    reference: "Proverbs 4:23",
    type: 'verse',
    date: '2026-04-17'
  },
  {
    id: '2',
    text: "True beauty is not about having a pretty face. It is about having a pretty mind, a pretty heart, and most importantly, a beautiful soul.",
    reference: "Inspiration",
    type: 'inspiration',
    date: '2026-04-16'
  },
  {
    id: '3',
    text: "Do not be unequally yoked with unbelievers. For what partnership has righteousness with lawlessness?",
    reference: "2 Corinthians 6:14",
    type: 'verse',
    date: '2026-04-15'
  },
  {
    id: '4',
    text: "Dating is for evaluation, not recreation. Seek someone who loves the Lord more than they love you.",
    reference: "Advice",
    type: 'advice',
    date: '2026-04-14'
  },
  {
    id: '5',
    text: "Above all, keep loving one another earnestly, since love covers a multitude of sins.",
    reference: "1 Peter 4:8",
    type: 'verse',
    date: '2026-04-13'
  },
  {
    id: '6',
    text: "Wait on the Lord; be of good courage, and He shall strengthen your heart.",
    reference: "Psalm 27:14",
    type: 'verse',
    date: '2026-04-12'
  }
];

export const INITIAL_DO_CHECKLIST: ChecklistItem[] = [
  { id: 'd1', text: 'Pray together daily', type: 'do', completed: true },
  { id: 'd2', text: 'Set clear boundaries', type: 'do', completed: true },
  { id: 'd3', text: 'Honor each other in speech', type: 'do', completed: false },
  { id: 'd4', text: 'Seek godly counsel', type: 'do', completed: false },
  { id: 'd5', text: 'Listen more than you speak', type: 'do', completed: false },
  { id: 'd6', text: 'Focus on building friendship first', type: 'do', completed: false },
];

export const INITIAL_DONT_CHECKLIST: ChecklistItem[] = [
  { id: 'dt1', text: 'Compromise your values', type: 'dont', completed: false },
  { id: 'dt2', text: 'Ignore red flags', type: 'dont', completed: false },
  { id: 'dt3', text: 'Rush into emotional intimacy', type: 'dont', completed: false },
  { id: 'dt4', text: 'Isolate yourselves from community', type: 'dont', completed: false },
  { id: 'dt5', text: 'Hide your true self', type: 'dont', completed: false },
];

export const INITIAL_COMMENTS: any[] = [
  {
    id: 'c1',
    userName: 'Brother James',
    text: 'This verse really spoke to me today. Persistence in prayer is key!',
    timestamp: '2026-04-17T10:00:00Z'
  },
  {
    id: 'c2',
    userName: 'Sister Mary',
    text: 'Love the checklist feature. It helps keep focus on what truly matters.',
    timestamp: '2026-04-17T12:30:00Z'
  }
];
