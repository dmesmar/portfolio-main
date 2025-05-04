import Link from 'next/link';
import { en, es, ca } from '@dmesmar/i18n';
import { getCurrentLanguage } from '../language-configurator';

export const Footer = () => {
  // Set up language objects and retrieve current language
  const langCode = getCurrentLanguage();
  const langMap = { en, es, ca };
  const lang = langMap[langCode];
  
  return (
    <footer className="footer-area">
      <div className="container">
        <div className="footer-content text-center">
          <Link href="/" className="logo">
          </Link>
          <ul className="footer-menu">
            <li>
              <Link href="/">{lang.misc.menus.home}</Link>
            </li>
            <li>
              <Link href="/bio">{lang.misc.menus.bio}</Link>
            </li>
            <li>
              <Link href="/portfolio">{lang.misc.menus.portfolio}</Link>
            </li>
            <li>
              <Link href="/contact">{lang.misc.menus.contact}</Link>
            </li>
            <li>
              <Link href="/certificates">{lang.misc.menus.certificates}</Link>
            </li>
            <li>
              <Link href="/cv">{lang.misc.menus.cv}</Link>
            </li>
            <li>
              <Link href="/offerings">{lang.misc.menus.offerings}</Link>
            </li>
            <li>
              <Link href="/credentials">{lang.misc.menus.insights}</Link>
            </li>
          </ul>
          <p className="copyright">
             <span>Darío Mesas Martí</span>
          </p>
        </div>
      </div>
    </footer>
  );
};