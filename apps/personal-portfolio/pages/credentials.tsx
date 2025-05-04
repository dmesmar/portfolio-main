import { Layout } from '@dmesmar/core-components';
import { en, es, ca } from '@dmesmar/i18n';
import Link from 'next/link';
import ShootingStar from '../../../libs/core-components/src/lib/layout/ShootingStar';
import { getCurrentLanguage } from '../../../libs/core-components/src/lib/language-configurator';

const CredentialsPage = () => {
  // Get the current language code
  const langCode = getCurrentLanguage();
  
  // Map language code to language data
  const langMap = { en, es, ca };
  
  // Get the language data based on current language
  const lang = langMap[langCode];

  return (
    <Layout wrapperClass="main-aboutpage" title='Insights'>
      <section className="credential-area">
        <div className="container">
          <div className="gx-row d-flex">
            <div className="credential-sidebar-wrap" data-aos="zoom-in">
              <div className="credential-sidebar text-center">
              <ShootingStar />
                <div className="shadow-box">
                  <img src="/assets/bg1.png" alt="BG" className="bg-img" />
                  <div className="img-box">
                    <img src={lang.credentials.navbar.media} alt="bio" />
                  </div>
                  <h2>{lang.credentials.navbar.heading}</h2>
                  <p>{lang.credentials.navbar.email}</p>
                  <ul className="social-links d-flex justify-content-center">
                    {lang.credentials.navbar.profiles.map((item, index) => (
                      <li key={index}>
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noreferrer noopener"
                        >
                          <i className={item.icon} />
                        </a>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={lang.credentials.navbar.button.link}
                    className="theme-btn"
                  >
                    {lang.credentials.navbar.button.text}
                  </Link>
                </div>
              </div>
            </div>
            <div className="credential-content flex-1">
              <div className="credential-about" data-aos="zoom-in">
                <h2>{lang.credentials.bio.heading}</h2>
                {lang.credentials.bio.description.map((item, index) => (
                  <p
                    key={index}
                    dangerouslySetInnerHTML={{
                      __html: item,
                    }}
                  />
                ))}
              </div>
              <div className="credential-edc-exp credential-experience">
                <h2 data-aos="fade-up">{lang.credentials.experience.heading}</h2>
                {lang.credentials.experience.experience.map((item, index) => (
                  <div
                    className="credential-edc-exp-item"
                    data-aos="zoom-in"
                    key={index}
                  >
                    <h4>{item.date}</h4>
                    <h3>{item.title}</h3>
                    <h5>{item.company}</h5>
                    <p
                      dangerouslySetInnerHTML={{
                        __html: item.description,
                      }}
                    />
                  </div>
                ))}
              </div>
              <div className="credential-edc-exp credential-education">
                <h2 data-aos="fade-up">{lang.credentials.education.heading}</h2>
                {lang.credentials.education.education.map((item, index) => (
                  <div
                    className="credential-edc-exp-item"
                    data-aos="zoom-in"
                    key={index}
                  >
                    <h4>{item.date}</h4>
                    <h3>{item.degree}</h3>
                    <h5>{item.university}</h5>
                    {item.description && (
                      <p
                        dangerouslySetInnerHTML={{
                          __html: item.description,
                        }}
                      />
                    )}
                  </div>
                ))}
              </div>
              <div className="skills-wrap">
                <h2 data-aos="fade-up">
                  {lang.credentials.capabilities.heading}
                </h2>
                <div className="d-grid skill-items gap-24 flex-wrap">
                  {lang.credentials.capabilities.capabilities.map(
                    (item, index) => (
                      <div
                        className="skill-item"
                        data-aos="zoom-in"
                        key={index}
                      >
                        <span className="percent">{item.percent}</span>
                        <h3 className="name">{item.name}</h3>
                        <p>{item.description}</p>
                      </div>
                    )
                  )}
                </div>
              </div>
              <div className="skills-wrap awards-wrap">
                <h2 data-aos="fade-up">{lang.credentials.expertise.heading}</h2>
                <div className="d-grid skill-items gap-24 flex-wrap">
                  {lang.credentials.expertise.expertise.map((item, index) => (
                    <div className="skill-item" data-aos="zoom-in" key={index}>
                      <h3 className="name">{item.name}</h3>
                      <p>{item.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default CredentialsPage;