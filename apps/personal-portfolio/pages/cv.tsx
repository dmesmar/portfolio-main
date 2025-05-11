import { Layout } from '@dmesmar/core-components';
import { en, es, ca } from '@dmesmar/i18n';
import { useEffect, useState } from 'react';
import styles from './CertificatesPage.module.scss';
import ShootingStar from '../../../libs/core-components/src/lib/layout/ShootingStar';
import ShiningStar from '../../../libs/core-components/src/lib/layout/ShiningStar';
import { getCurrentLanguage } from '../../../libs/core-components/src/lib/language-configurator';

const cv = () => {
  const [displayBanner, setDisplayBanner] = useState(false);

  // Get the current language code
  const langCode = getCurrentLanguage();

  // Map language code to language data
  const langMap = { en, es, ca };

  // Get the language data based on current language
  const lang = langMap[langCode];

  const handleDownload = () => {
    // Logic to download resume PDF
    // Logic to apply effects to the image
    // For example:
    // document.querySelector('.img-fluid').classList.add('enlarged');
  };

  useEffect(() => {
    // Your useEffect logic here
  }, []);

  return (
    <Layout wrapperClass="main-aboutpage" title='CV'>
      <section className="contact-area">
        <div className="container">
          <div className="about-details" data-aos="zoom-in">
            <br />
            <br />
          </div>
          <div
            className="gx-row d-flex justify-content-between gap-24"
            style={{ alignItems: "flex-start" }}
          >
            {/* Left: Contact Info */}
            <div
              className="contact-infos"
              style={{ maxWidth: '400px', flex: "0 0 350px" }}
            >
              <ShootingStar />
              <h3 data-aos="fade-up">{lang.contact.contact.heading}</h3>
              <ul className="contact-details">
                <li className="d-flex align-items-center" data-aos="zoom-in">
                  <div className="icon-box shadow-box">
                    <i className={lang.contact.contact.mail.icon} />
                  </div>
                  <div className="right">
                    <span>{lang.contact.contact.mail.heading}</span>
                    {lang.contact.contact.mail.links.map((item, index) => (
                      <h4 key={index}>
                        <a href={`mailto:${item}`}>{item}</a>
                      </h4>
                    ))}
                  </div>
                </li>
                <li className="d-flex align-items-center" data-aos="zoom-in">
                  <div className="icon-box shadow-box">
                    <i className="iconoir-phone" />
                  </div>
                  <div className="right">
                    <span>{lang.contact.contact.phone.heading}</span>
                    {lang.contact.contact.phone.links.map((item, index) => (
                      <h4 key={index}>
                        <a>{item.text}</a>
                      </h4>
                    ))}
                  </div>
                </li>
                <li className="d-flex align-items-center" data-aos="zoom-in">
                  <div className="icon-box shadow-box">
                    <i className={lang.contact.contact.location.icon} />
                  </div>
                  <div className="right">
                    <span>{lang.contact.contact.location.heading}</span>
                    <h4>{lang.contact.contact.location.location}</h4>
                  </div>
                </li>
              </ul>
              <h3 data-aos="fade-up">{lang.contact.profiles.heading}</h3>
              <ul className="social-links d-flex align-center" data-aos="zoom-in">
                <li>
                  <a className="shadow-box" href="https://github.com/dmesmar/portfolio" target="_blank" rel="noreferrer noopener">
                    <i className="iconoir-github" />
                  </a>
                </li>
                <li>
                  <a className="shadow-box" href="https://www.linkedin.com/in/dario-mesas-marti/" target="_blank" rel="noreferrer noopener">
                    <i className="iconoir-linkedin" />
                  </a>
                </li>
              </ul>
            </div>

            {/* Right: CV PDF Viewer */}
            <div
              className="c1-image-container"
              style={{ flex: 1, minWidth: "480px", paddingLeft: "2vw" }}
              data-aos="zoom-in"
            >
              <div className="image-wrapper" style={{ width: "100%" }}>
                <iframe
                  src={`/assets/cv/${langCode}DarioMesasCV.pdf`}
                  title="CV"
                  width="100%"
                  height="820px"
                  style={{
                    border: "none",
                    borderRadius: "16px",
                    background: "white",
                    boxShadow: "0 2px 24px #0003"
                  }}
                >
                  This browser does not support PDFs. Please download the PDF:{" "}
                  <a href={`/assets/cv/${langCode}DarioMesasCV.pdf`}>Download PDF</a>
                </iframe>
                <div className="image-overlay">
                  <div className="download-button"
                    style={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      padding: '20px 0'
                    }}>
                    <ul className="social-links d-flex align-center" data-aos="zoom-in">
                      <li>
                        <a className="shadow-box" href={`/assets/cv/${langCode}DarioMesasCV.pdf`} target="_blank" rel="noreferrer noopener">
                          <i className="iconoir-attachment" />
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            {/* End Right PDF Viewer */}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default cv;