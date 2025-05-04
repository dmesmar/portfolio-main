// menu.ts
import { en, es, ca } from '@dmesmar/i18n';
import { getCurrentLanguage } from '../language-configurator';

export const getMenu = () => {
  const langCode = getCurrentLanguage();
  const langMap = { en, es, ca };
  const lang = langMap[langCode];

  return [
    {
      label: lang.misc.menus.home,
      path: '/',
    },
    {
      label: lang.misc.menus.bio,
      path: '/bio',
    },
    {
      label: lang.misc.menus.portfolio,
      path: '/portfolio',
    },
    {
      label: lang.misc.menus.contact,
      path: '/contact',
    },
    {
      label: lang.misc.menus.certificates,
      path: '/certificates',
    },
    {
      label: lang.misc.menus.links,
      path: '/tbd',
    },
  ];
};