import { Layout } from '@dmesmar/core-components';
import { en, es, ca } from '@dmesmar/i18n';
import { useState } from 'react';
import styles from './CertificatesPage.module.scss';
import ShootingStar from '../../../libs/core-components/src/lib/layout/ShootingStar';
import ShiningStar from '../../../libs/core-components/src/lib/layout/ShiningStar';
import { getCurrentLanguage } from '../../../libs/core-components/src/lib/language-configurator';

const tbd = () => {
  const [displayBanner, setDisplayBanner] = useState(false);

  const langCode = getCurrentLanguage();
  const langMap = { en, es, ca };
  const lang = langMap[langCode];

  return (
    <Layout wrapperClass="main-aboutpage" title='CV'>
      <section className="contact-area">
        <div className="container">
          <div className="about-details" data-aos="zoom-in">
            <h1 className="section-heading" data-aos="fade-up">
              {lang.misc.tbd.title}
            </h1>
            <img
              src="/assets/tbd.jpg"
              alt=""
              className={styles.enlargedImg}
            />
            <h3 className={`section-heading ${styles.centerText}`}>
              {lang.misc.tbd.subtitle}
            </h3>
            <br />
            <br />
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default tbd;