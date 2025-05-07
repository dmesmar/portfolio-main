import React, { useState, useEffect } from 'react';
import { Layout } from '@dmesmar/core-components';
import { Col, Container, Row, Input, Badge } from 'reactstrap';
import styles from './CertificatesPage.module.scss';
import { en, es, ca } from '@dmesmar/i18n';
import { getCurrentLanguage } from '../../../libs/core-components/src/lib/language-configurator';

const CertificatesPage: React.FC = () => {
  const langCode = getCurrentLanguage();
  const langMap = { en, es, ca };
  const lang = langMap[langCode];
  
  // Certificate data with categories
  const certificatesData = [
    { 
      file: 'ai900.png', 
      name: 'Azure AI Fundamentals', 
      categories: [lang.certifications.categories_list.AI, lang.certifications.categories_list.azure]
    },
    { 
      file: 'dp900.png', 
      name: 'Azure Data Fundamentals', 
      categories: [lang.certifications.categories_list.ML, lang.certifications.categories_list.azure]
    },
    { 
      file: 'md102.png', 
      name: 'Modern Desktop Administrator', 
      categories: [lang.certifications.categories_list.other]
    },
    { 
      file: 'ms900.png', 
      name: 'Microsoft 365 Fundamentals', 
      categories: [lang.certifications.categories_list.other]
    }
  ];

  // States
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [searchText, setSearchText] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [filteredCertificates, setFilteredCertificates] = useState(certificatesData);

  // Available categories
  const categories = [lang.certifications.categories_list.ML, lang.certifications.categories_list.AI, lang.certifications.categories_list.azure, lang.certifications.categories_list.other];

  // Filter certificates when search or categories change
  useEffect(() => {
    const filtered = certificatesData.filter(cert => {
      // Check if name matches search text
      const nameMatch = cert.name.toLowerCase().includes(searchText.toLowerCase());
      
      // If no categories selected, only filter by name
      if (selectedCategories.length === 0) {
        return nameMatch;
      }
      
      // Check if certificate has any of the selected categories
      const categoryMatch = selectedCategories.some(category => 
        cert.categories.includes(category)
      );
      
      return nameMatch && categoryMatch;
    });
    
    setFilteredCertificates(filtered);
  }, [searchText, selectedCategories]);

  // Toggle category selection
  const toggleCategory = (category:any) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter(cat => cat !== category));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  // Remove category from search
  const removeCategory = (category:any) => {
    setSelectedCategories(selectedCategories.filter(cat => cat !== category));
  };

  // Lightbox functions
  const openLightbox = (index:any) => {
    setCurrentIndex(index);
    setIsOpen(true);
  };

  const closeLightbox = () => {
    setIsOpen(false);
  };

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? filteredCertificates.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => 
      (prevIndex + 1) % filteredCertificates.length
    );
  };

  // Custom lightbox component
  const CustomLightbox = () => {
    if (!isOpen || filteredCertificates.length === 0) return null;
    
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
                src={`/assets/${filteredCertificates[currentIndex].file}`} 
                alt={filteredCertificates[currentIndex].name}
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
          </div>

          {/* Search and Categories Section */}
          <div className={styles.searchSection} data-aos="fade-up">
            <Row className="mb-4">
              <Col md="12">
                <div className={styles.searchContainer}>
                  <Input
                    type="text"
                    placeholder={lang.certifications.placeholder_search_bar}
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    className={styles.searchInput}
                  />
                  
                  {/* Selected categories in search bar */}
                  <div className={styles.selectedCategories}>
                    {selectedCategories.map(category => (
                      <Badge 
                        key={category} 
                        color="primary" 
                        className={styles.categoryBadge}
                        onClick={() => removeCategory(category)}
                      >
                        {category} ×
                      </Badge>
                    ))}
                  </div>
                </div>
              </Col>
            </Row>
            
            <Row className="mb-4">
              <Col md="12">
                <div className={styles.categoriesContainer}>
                  <span className={styles.categoriesLabel}>Categories: </span>
                  {categories.map(category => (
                    <Badge 
                      key={category} 
                      pill 
                      className={styles.categoryBadge}
                      color={selectedCategories.includes(category) ? "success" : "secondary"}
                      onClick={() => toggleCategory(category)}
                    >
                      {category}
                    </Badge>
                  ))}
                </div>
              </Col>
            </Row>
          </div>

          {/* Certificates Grid */}
          <Row>
            <Col md="12">
              {filteredCertificates.length > 0 ? (
                <div className={styles['certificates-grid']}>
                  {filteredCertificates.map((certificate, index) => (
                    <div
                      className={styles['certificate-item']}
                      key={index}
                      data-aos="zoom-in"
                      onClick={() => openLightbox(index)}
                    >
                      <div className={styles['img-box']}>
                        <img
                          src={`/assets/${certificate.file}`}
                          alt={certificate.name}
                          className={styles['certificate-image']}
                        />
                        <div className={styles['neon-glow']}></div>
                      </div>
                      <div className={styles.certificateInfo}>
                        <p className={styles.certificateName}>{certificate.name}</p>
                        <div className={styles.certificateCategories}>
                        {certificate.categories.map(cat => (
                          <Badge 
                            key={cat} 
                            pill 
                            className={styles.categoryBadge}
                          >
                            {cat}
                          </Badge>
                        ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={styles.noResults} data-aos="fade-in">
                  <p>{lang.certifications.not_found}</p>
                </div>
              )}
            </Col>
          </Row>
        </Container>
      </section>
      
      <CustomLightbox />
      
    </Layout>
  );
};

export default CertificatesPage;