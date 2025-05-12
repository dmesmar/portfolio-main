import React, { useState, useEffect, Fragment } from 'react';
import { Layout, getThemedContent } from '@dmesmar/core-components';
import { en, es, ca } from '@dmesmar/i18n';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import ShiningStar from '../../../libs/core-components/src/lib/layout/ShiningStar';
import ShootingStar from '../../../libs/core-components/src/lib/layout/ShootingStar';
import { getCurrentLanguage } from '../../../libs/core-components/src/lib/language-configurator';



const LandingPage: React.FC = () => {
  const { theme } = useTheme();


  const langCode = getCurrentLanguage();
  const langMap = { en, es, ca };
  const lang = langMap[langCode];

  return (
    <Layout>
      <section className="about-area">
        <div className="container">
          <div className="row">
            <div className="col-md-6" data-aos="zoom-in">
              <div className="about-me-box shadow-box h-100">
                <ShiningStar />
                <ShootingStar />
                <Link className="overlay-link" href="/bio" />
                <div className="img-box">
                  <img src={lang.landing.bio.media} alt="profile" />
                </div>
                <div className="infos">
                  <h4>{lang.landing.bio.caption}</h4>
                  <h1>{lang.landing.bio.heading}</h1>
                  <p>{lang.landing.bio.description}</p>
                  <br />
                  <p
                    dangerouslySetInnerHTML={{
                      __html: lang.landing.bio.descriptionExtended,
                    }}
                  />
                  <br />
                  <p>{lang.landing.bio.location}</p>
                  <Link href={lang.landing.bio.button.link} className="about-btn">
                    <img
                      src={getThemedContent(theme, lang.landing.bio.button.icon)}
                      alt="Button"
                    />
                  </Link>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="about-credentials-wrap">
                <div data-aos="zoom-in">
                  <div className="banner shadow-box">
                    <div className="marquee">
                      <div>
                        <span>
                          {lang.misc.intro1}
                          <b>{lang.misc.intro2}</b>{' '}
                          {Array(6)
                            .fill(0)
                            .map((_, index) => (
                              <Fragment key={index}>
                                <img src="/assets/star1.svg" alt="Star" />{' '}
                                {lang.misc.intro1}
                                <b>{lang.misc.intro2}</b>{' '}
                              </Fragment>
                            ))}
                          <img src="/assets/star1.svg" alt="Star" />
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="gx-row d-flex gap-24">
                  <div data-aos="zoom-in">
                    <div className="about-crenditials-box info-box shadow-box h-full">
                      <Link className="overlay-link" href="/certificates" />
                      <img
                        src={lang.landing.credentials.media}
                        alt="credentials"
                      />
                      <div className="d-flex align-items-center justify-content-between">
                        <div className="infos">
                          <h4>{lang.landing.credentials.caption}</h4>
                          <h1>{lang.landing.credentials.heading}</h1>
                        </div>
                        <Link
                          href={lang.landing.credentials.button.link}
                          className="about-btn"
                        >
                          <img
                            src={getThemedContent(
                              theme,
                              lang.landing.credentials.button.icon
                            )}
                            alt="button"
                          />
                        </Link>
                      </div>
                    </div>
                  </div>
                  <div data-aos="zoom-in">
                    <div className="about-project-box info-box shadow-box h-full">
                      <Link className="overlay-link" href="/portfolio" />
                      <img src={lang.landing.cv.media} alt="My Works" />
                      <div className="d-flex align-items-center justify-content-between">
                        <div className="infos">
                          <h4>{lang.landing.projects.header}</h4>
                          <h1>{lang.landing.projects.text}</h1>
                        </div>
                        <Link
                          href={lang.landing.cv.button.link}
                          className="about-btn"
                        >
                          <img
                            src={getThemedContent(
                              theme,
                              lang.landing.cv.button.icon
                            )}
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
          <div className="row mt-24">
            <div className="blog-service-profile-wrap d-flex gap-24">
              <div data-aos="zoom-in" className="col">
                <div className="about-profile-box info-box shadow-box h-full ">
                  {Array.from(
                    {
                      length: Math.ceil(
                        lang.landing.profiles.profiles.length / 2
                      ),
                    },
                    (_, i) => i * 2
                  ).map((startIndex, index) => (
                    <div
                      className="inner-profile-icons shadow-box"
                      key={index}
                    >
                      {lang.landing.profiles.profiles
                        .slice(startIndex, startIndex + 2)
                        .map((item, i) => (
                          <a
                            href={item.link}
                            key={i}
                            target="_blank"
                            rel="noreferrer noopener"
                          >
                            <i className={item.icon} />
                          </a>
                        ))}
                    </div>
                  ))}
                  <div className="d-flex align-items-center justify-content-between">
                    <div className="infos">
                      <h4>{lang.landing.profiles.caption}</h4>
                      <h1>{lang.landing.profiles.heading}</h1>
                    </div>
                    <Link
                      href={lang.landing.profiles.button.link}
                      className="about-btn"
                    >
                      <img
                        src={getThemedContent(
                          theme,
                          lang.landing.profiles.button.icon
                        )}
                        alt="Button"
                      />
                    </Link>
                  </div>
                </div>
              </div>
              <div data-aos="zoom-in" className="col">
                <div className="about-client-box info-box shadow-box h-full">
                  <div className="clients d-flex align-items-start gap-24 justify-content-center">
                    {lang.landing.facts.quickFacts.map((item, index) => (
                      <div className="client-item" key={index}>
                        <h1>{item.count}</h1>
                        <p
                          dangerouslySetInnerHTML={{
                            __html: item.label,
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div data-aos="zoom-in" className="col">
                <div className="about-contact-box info-box shadow-box">
                  <Link className="overlay-link" href="/cv" />
                  <img
                    src="/assets/icons/icon2.png"
                    alt="Icon"
                    className="star-icon"
                  />
                  <h1
                    dangerouslySetInnerHTML={{
                      __html: lang.landing.contact.heading,
                    }}
                  />
                  <Link
                    href={lang.landing.contact.button.link}
                    className="about-btn"
                  >
                    <img
                      src={getThemedContent(
                        theme,
                        lang.landing.contact.button.icon
                      )}
                      alt="button"
                    />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default LandingPage;