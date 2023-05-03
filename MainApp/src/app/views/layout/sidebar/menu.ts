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
    label: 'Spaces',
    icon: 'users',
    link: '/group'
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
  },
  {
    label: 'Contact',
    isTitle: true
  },
  {
    label: 'Employees',
    icon: 'shield',
    link: 'admin'
  }
];
