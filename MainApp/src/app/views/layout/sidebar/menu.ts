import { MenuItem } from './menu.model';

export const MENU: MenuItem[] = [
  {
    label: 'Main',
    isTitle: true
  },
  {
    label: 'Dashboard',
    icon: 'home',
    link: '/dashboard'
  },
  // {
  //   label: 'Chat',
  //   icon: 'inbox',
  //   link: '/apps/chat'
  // },
  // {
  //   label: 'Calendar',
  //   icon: 'calendar',
  //   link: '/apps/calendar'
  // }
];
