import { Layout } from '@dmesmar/core-components';
import { en, es, ca } from '@dmesmar/i18n';
import classNames from 'classnames';
import Link from 'next/link';
import { Container } from 'reactstrap';
import { getCurrentLanguage } from '../../../libs/core-components/src/lib/language-configurator';

const OfferingsPage = () => {
  // Get the current language code
  const langCode = getCurrentLanguage();
  
  // Map language code to language data
  const langMap = { en, es, ca };
  
  // Get the language data based on current language
  const lang = langMap[langCode];

  return (
     <Layout title='What I Offer'>
      <section className="service-area">
        <div className="container">
          <h1 className="section-heading" data-aos="fade-up">
            {lang.offerings.heading}{' '}
          </h1>
          <div className="row">
            {/* Sidebar */}
            <h1 className="section-heading" data-aos="fade-up">
                {lang.offerings.heading}{' '}
              </h1>
            <div className="col-md-4">
              <div className="service-sidebar" data-aos="fade-right">
                <div className="service-sidebar-inner shadow-box">
                  <ul>
                    {lang.offerings.navbar.entries.map((item, index) => (
                      <>
                        <li key={`entry-${index}`}>
                          <i className={classNames('icon', item.icon)} />
                          {item.text}
                        </li>
                        <Container>
                          {item.topics.map((topic, topicIndex) => (
                            <p key={`topic-${index}-${topicIndex}`}>
                              - <b>{topic}</b>
                            </p>
                          ))}
                        </Container>
                      </>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
            {/* Content */}
            <div className="col-md-8 h-100">
              
              <div className="service-content-wrap" data-aos="zoom-in">
                <div className="service-content-inner shadow-box">
                  <div className="service-items">
                    {lang.offerings.offerings.map((item, index) => (
                      <div className="service-item" key={index}>
                        <h3>{item.title}</h3>
                        {item.description.map((desc, descIndex) => (
                          <p
                            key={`desc-${index}-${descIndex}`}
                            dangerouslySetInnerHTML={{
                              __html: desc,
                            }}
                          ></p>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="row mt-24">
            <div className="col-md-12">
              <div className="d-flex profile-contact-credentials-wrap gap-24">
                <div data-aos="zoom-in" className="h-full">
                  <div className="about-crenditials-box info-box shadow-box">
                    <Link className="overlay-link" href="/credentials" />
                    <img src="/assets/bg1.png" alt="BG" className="bg-img" />
                    <img src={lang.offerings.credentials.media} alt="Sign" />
                    <div className="d-flex align-items-center justify-content-between">
                      <div className="infos">
                        <h4>{lang.offerings.credentials.caption}</h4>
                        <h1>{lang.offerings.credentials.heading}</h1>
                      </div>
                      <Link
                        href={lang.offerings.credentials.button.link}
                        className="about-btn"
                      >
                        <img
                          src={lang.offerings.credentials.button.icon}
                          alt="button"
                        />
                      </Link>
                    </div>
                  </div>
                </div>
                <div data-aos="zoom-in" className="flex-1">
                  <div className="about-contact-box info-box shadow-box">
                    <Link className="overlay-link" href="/cv" />
                    <img src="/assets/bg1.png" alt="BG" className="bg-img" />
                    <img
                      src="/assets/icons/icon2.png"
                      alt="Icon"
                      className="star-icon"
                    />
                    <h1
                      dangerouslySetInnerHTML={{
                        __html: lang.offerings.contact.heading,
                      }}
                    ></h1>
                    <Link
                      href={lang.offerings.contact.button.link}
                      className="about-btn"
                    >
                      <img
                        src={lang.offerings.contact.button.icon}
                        alt="button"
                      />
                    </Link>
                  </div>
                </div>
                <div data-aos="zoom-in">
                  <div className="about-profile-box info-box shadow-box h-full">
                    <img src="/assets/bg1.png" alt="BG" className="bg-img" />
                    <div className="inner-profile-icons shadow-box">
                      {lang.offerings.profiles.profiles.map((item, index) => (
                        <Link href={item.link} key={index}>
                          <i className={item.icon} />
                        </Link>
                      ))}
                    </div>
                    <div className="d-flex align-items-center justify-content-between">
                      <div className="infos">
                        <h4>{lang.offerings.profiles.caption}</h4>
                        <h1>{lang.offerings.profiles.heading}</h1>
                      </div>
                      <Link
                        href={lang.offerings.profiles.button.link}
                        className="about-btn"
                      >
                        <img
                          src={lang.offerings.profiles.button.icon}
                          alt="button"
                        />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default OfferingsPage;