import { UserRole } from '../@types/user';
import { Step } from 'react-joyride';

const firmAdminTour: Step[] = [
  {
    target: '#onboarding-overview',
    disableBeacon: true,
    title: 'Overview section',
    content:
      "Everything related to the application and analytics—from tasks, to connected technologies, and what you've accomplished.",
    placement: 'auto',
  },
  {
    target: '#onboarding-management',
    disableBeacon: true,
    title: 'Management section',
    content:
      'Everything related to customer relations—from forms, to where people are in your process, and what you need to do to keep moving forward.',
    placement: 'auto',
  },
  // Header onboarding
  {
    target: '#header-search-onboarding',
    disableBeacon: true,
    title: 'Search',
    content: "Find anyone you've connected with.",
    placement: 'auto',
  },
  {
    target: '#header-account-onboarding',
    disableBeacon: true,
    title: 'Settings',
    content:
      'This is where you can change your account settings, firm settings, logo, and log out.',
    placement: 'auto',
  },
  // settings
  {
    target: '#backdrop-settings',
    disableBeacon: true,
    title: 'Personalize',
    content: 'Light and dark mode',
    placement: 'auto',
  },
];

const advisorTour: Step[] = [
  {
    target: '#onboarding-overview',
    disableBeacon: true,
    title: 'Overview section',
    content:
      "Everything related to the application and analytics—from tasks, to connected technologies, and what you've accomplished.",
    placement: 'auto',
  },
  {
    target: '#onboarding-management',
    disableBeacon: true,
    title: 'Management section',
    content:
      'Everything related to customer relations—from forms, to where people are in your process, and what you need to do to keep moving forward.',
    placement: 'auto',
  },
  // Header onboarding
  {
    target: '#header-search-onboarding',
    disableBeacon: true,
    title: 'Search',
    content: "Find anyone you've connected with.",
    placement: 'auto',
  },
  {
    target: '#header-account-onboarding',
    disableBeacon: true,
    title: 'Settings',
    content: 'This is where you can change your account settings, photo, password, and log out.',
    placement: 'auto',
  },
  {
    target: '#backdrop-settings',
    disableBeacon: true,
    title: 'Personalize',
    content: 'Light and dark mode',
    placement: 'auto',
  },
];

const clientTour: Step[] = [
  {
    target: '#onboarding-overview',
    disableBeacon: true,
    title: 'Overview section',
    content:
      'This is the fastest way to stay updated on your process and chat directly with your advisor.',
    placement: 'auto',
  },
  // Header onboarding
  {
    target: '#header-search-onboarding',
    disableBeacon: true,
    title: 'Search',
    content: "Find anyone you've connected with",
    placement: 'auto',
  },
  {
    target: '#header-account-onboarding',
    disableBeacon: true,
    title: 'Settings',
    content: 'This is where you can change your account settings, photo, password, and log out.',
    placement: 'auto',
  },
  // settings
  {
    target: '#backdrop-settings',
    disableBeacon: true,
    title: 'Personalize',
    content: 'Light and dark mode',
    placement: 'auto',
  },
];

const steps = {
  [UserRole.FIRM_ADMIN]: firmAdminTour,
  [UserRole.ADVISOR]: advisorTour,
  [UserRole.CLIENT]: clientTour,
};

export const getTourSteps = (role: UserRole): Step[] => steps[role];
