import Link from 'next/link';
import { getCurrentLanguage } from '../language-configurator';
import { ca, es, en } from '@dmesmar/i18n';

export const PortfolioFooter = () => {
    // Get the current language code
  const langCode = getCurrentLanguage();
  
  // Map language code to language data
  const langMap = { en, es, ca };
  
  // Get the language data based on current language
  const lang = langMap[langCode];
  return (
    <div
      className="container d-flex align-items-center justify-content-center"
      data-aos="zoom-in"
    >
      <Link href="/portfolio" className="theme-btn">
        {lang.portfolio.goBack}
      </Link>
    </div>
  );
};
