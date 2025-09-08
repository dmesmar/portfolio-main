import { Layout, getThemedContent} from '@dmesmar/core-components';
import { getCurrentLanguage } from '../../../libs/core-components/src/lib/language-configurator';
import { AssetLang } from '@dmesmar/core-components'
import { en, es, ca } from '@dmesmar/i18n';
import { useTheme } from 'next-themes';
import Link from 'next/link';

const BioPage = () => {
  const { theme } = useTheme();
  
  // Get the current language code
  const langCode = getCurrentLanguage();
  
  // Map language code to language data
  const langMap = { en, es, ca };
  
  // Get the language data based on current language
  const lang = langMap[langCode];
  
  return (
    <Layout wrapperClass="main-aboutpage" title='About me'>
      <section className="about-area">
        <div className="container">

          <div className="d-flex about-me-wrap align-items-stretch ">
            <div className='col mt-24'>
              <div data-aos="zoom-in" className='row-md-6 about-image-box-bio'>
                <div className="shadow-box d-flex align-items-center justify-content-center about-image-box mr-24">
                  <img src="/assets/bg1.png" alt="BG" className="bg-img" />
                  <div className=" d-flex flex-column justify-content-center">
                    <img src={lang.bio.bio.media} alt="bio" className="profile-image" />
                  </div>
                </div>
              </div>
              <div className="about-details" data-aos="zoom-in">
                <div className="about-details-inner shadow-box">
                  <img src="/assets/icons/icon2.png" alt="Star" />
                  
                  <h1>{lang.bio.bio.details.name}</h1>
                  <p>{lang.bio.bio.details.description}</p>
                </div>
              </div>
            </div>
          </div>




          <div className="row mt-24">
            <div className="col-md-6" data-aos="zoom-in">
              <div className="about-edc-exp about-experience shadow-box ">
                <img src="/assets/bg1.png" alt="BG" className="bg-img" />
                <h3>{lang.bio.experience.heading}</h3>
                <ul>
                  {lang.bio.experience.experience.map((item, index) => (
                    <li key={index}>
                      <p className="date">{item.date}</p>
                      <h2>{item.title}</h2>
                      <p className="type">{item.company}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="col-md-6" data-aos="zoom-in">
              <div className="about-edc-exp about-education shadow-box h-100">
                <img src="/assets/bg1.png" alt="BG" className="bg-img" />
                <h3>{lang.bio.education.heading}</h3>
                <ul>
                  {lang.bio.education.education.map((item, index) => (
                    <li key={index}>
                      <p className="date">{item.date}</p>
                      <h2>{item.degree}</h2>
                      <p className="type">{item.university}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          <div className="row mt-24">
            <div className="col-md-12">
              <h1 className='section-heading'>{lang.bio.misc.moreDetails}</h1>
              <div className="d-flex profile-contact-credentials-wrap gap-24">

                <div data-aos="zoom-in" className="flex-1 ">
                  <div className="about-contact-box info-box shadow-box h-100 col">
                    <Link className="overlay-link" href="/cv" />
                    <img src="/assets/bg1.png" alt="BG" className="bg-img" />
                    <img
                      src="/assets/icons/icon2.png"
                      alt="Icon"
                      className="star-icon"
                    />
                    <h1
                      dangerouslySetInnerHTML={{
                        __html: lang.bio.cv.checkCv,
                      }}
                    ></h1>
                    <Link
                      href={lang.bio.contact.button.link}
                      className="about-btn"
                    >
                      <img
                        src={getThemedContent(
                          theme,
                          lang.bio.contact.button.icon
                        )}
                        alt="button"
                      />
                    </Link>
                  </div>
                </div>
                <div data-aos="zoom-in" className="flex-1 ">
                  <div className="about-contact-box info-box shadow-box h-100 col">
                    <Link className="overlay-link" href="/credentials" />
                    <img src="/assets/bg1.png" alt="BG" className="bg-img" />
                    <img
                      src="/assets/icons/icon2.png"
                      alt="Icon"
                      className="star-icon"
                    />
                    <h1
                      dangerouslySetInnerHTML={{
                        __html: lang.bio.cv.credentials,
                      }}
                    ></h1>
                    <Link
                      href={lang.bio.contact.button.link}
                      className="about-btn"
                    >
                      <img
                        src={getThemedContent(
                          theme,
                          lang.bio.contact.button.icon
                        )}
                        alt="button"
                      />
                    </Link>
                  </div>
                </div>
                <div data-aos="zoom-in" className='flex-1 '>
                  <div className="about-profile-box info-box shadow-box h-100 col">
                    <img src="/assets/bg1.png" alt="BG" className="bg-img" />
                    <div className="inner-profile-icons shadow-box">
                      {lang.bio.profiles.profiles.map((item, index) => (
                        <Link href={item.link} key={index}>
                          <i className={item.icon} />
                        </Link>
                      ))}
                    </div>
                    <div className="d-flex align-items-center justify-content-between">
                      <div className="infos">
                        <h4>{lang.bio.profiles.caption}</h4>
                        <h1>{lang.bio.profiles.heading}</h1>
                      </div>
                      <Link
                        href={lang.bio.profiles.button.link}
                        className="about-btn"
                      >
                        <img
                          src={getThemedContent(
                            theme,
                            lang.bio.profiles.button.icon
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
      </section>
    </Layout>
  );
};

export default BioPage;