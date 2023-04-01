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
  {
    label: 'Chat',
    icon: 'inbox',
    link: '/chat'
  },
  {
    label: 'Profile',
    isTitle: true
  },
  {
    label: 'Edit Profile ',
    icon: 'edit',
    link: 'profile/edit'
  },
  {
    label: 'View Profile',
    icon: 'user',
    link: 'profile/detail'
  }
  // {
  //   label: 'Calendar',
  //   icon: 'calendar',
  //   link: '/apps/calendar'
  // }
];
