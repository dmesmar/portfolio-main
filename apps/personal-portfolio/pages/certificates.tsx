import React, { useState } from 'react';
import { Layout } from '@dmesmar/core-components';
import { Col, Container, Row } from 'reactstrap';
import styles from './CertificatesPage.module.scss';
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
  ];

  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const openLightbox = (index:any) => {
    setCurrentIndex(index);
    setIsOpen(true);
  };

  const closeLightbox = () => {
    setIsOpen(false);
  };

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? certificates.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => 
      (prevIndex + 1) % certificates.length
    );
  };

  // Custom lightbox component
  const CustomLightbox = () => {
    if (!isOpen) return null;
    
    return (
      <div className={styles.customLightbox}>
        <div className={styles.lightboxOverlay} onClick={closeLightbox}>
          <div 
            className={styles.lightboxContent} 
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              className={styles.closeButton} 
              onClick={closeLightbox}
            >
              ×
            </button>
            <button 
              className={styles.navButton} 
              onClick={goToPrevious}
            >
              ‹
            </button>
            <div className={styles.imageContainer}>
              <img 
                src={`/assets/${certificates[currentIndex]}`} 
                alt={`Certificate ${currentIndex + 1}`}
              />
            </div>
            <button 
              className={styles.navButton} 
              onClick={goToNext}
            >
              ›
            </button>
          </div>
        </div>
      </div>
    );
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
      
      <CustomLightbox />
      
    </Layout>
  );
};

export default CertificatesPage;