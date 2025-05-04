import React, { useState } from 'react';
import { Layout } from '@dmesmar/core-components';
import { Col, Container, Row } from 'reactstrap';
import styles from './CertificatesPage.module.scss';
import Lightbox from 'react-image-lightbox';
import 'react-image-lightbox/style.css';
import { en, es, ca } from '@dmesmar/i18n';
import { getCurrentLanguage } from '../../../libs/core-components/src/lib/language-configurator';
const CertificatesPage: React.FC = () => {
    const langCode = getCurrentLanguage();
    const langMap = { en, es, ca };
    const lang = langMap[langCode];
  const certificates = [
    'ai900.png',
    'dp900.png',
    'md102.png',
    'ms900.png'
    // Add more certificate image URLs as needed
  ];

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);

  const openLightbox = (index: number) => {
    setPhotoIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  return (
     <Layout title='CERTIFICATES'>
      <section className={styles['certificates-area']}>
        <Container>
          <div className="about-details" data-aos="zoom-in">
            <h1 className="section-heading" data-aos="fade-up">
              {lang.misc.menus.certificates}
            </h1>
            <br />
            <br />
          </div>
          <Row>
            <Col md="12">
              <div className={styles['certificates-grid']}>
                {certificates.map((certificate, index) => (
                  <div
                    className={styles['certificate-item']}
                    key={index}
                    data-aos="zoom-in"
                    onClick={() => openLightbox(index)}
                  >
                    <div className={styles['img-box']}>
                      <img
                        src={`/assets/${certificate}`}
                        alt={`Certificate ${index + 1}`}
                        className={styles['certificate-image']}
                      />
                      <div className={styles['neon-glow']}></div>
                    </div>
                  </div>
                ))}
              </div>
            </Col>
          </Row>
        </Container>
      </section>
      {lightboxOpen && (
        <Lightbox
          mainSrc={`/assets/${certificates[photoIndex]}`}
          nextSrc={`/assets/${certificates[(photoIndex + 1) % certificates.length]}`}
          prevSrc={`/assets/${certificates[(photoIndex + certificates.length - 1) % certificates.length]}`}
          onCloseRequest={closeLightbox}
          onMovePrevRequest={() => setPhotoIndex((photoIndex + certificates.length - 1) % certificates.length)}
          onMoveNextRequest={() => setPhotoIndex((photoIndex + 1) % certificates.length)}
        />
      )}
    </Layout>
  );
};

export default CertificatesPage;
