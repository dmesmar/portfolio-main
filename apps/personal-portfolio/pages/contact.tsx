import { ValidationError, useForm } from '@formspree/react';
import { Layout } from '@dmesmar/core-components';
import { en, es, ca } from '@dmesmar/i18n';
import { useEffect, useState } from 'react';
import { Alert, Form } from 'reactstrap';
import { getCurrentLanguage } from '../../../libs/core-components/src/lib/language-configurator';

const ContactPage = () => {
  const [state, handleSubmit] = useForm('xgvkyobd');
  const [displayBanner, setDisplayBanner] = useState(false);
  
  // Get the current language code
  const langCode = getCurrentLanguage();
  
  // Map language code to language data
  const langMap = { en, es, ca };
  
  // Get the language data based on current language
  const lang = langMap[langCode];

  useEffect(() => {
    if (state.submitting) {
      setDisplayBanner(false);
    }
    if (state.succeeded) {
      setDisplayBanner(true);
    }
  }, [state]);

  return (
     <Layout wrapperClass="main-aboutpage" title='Contact'>
      <section className="contact-area">
        <div className="container">
          <div className="gx-row d-flex justify-content-between gap-24">
            <div className="contact-infos">
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
                    <a
                      target="_blank"
                      rel="noreferrer noopener"
                    >
                      <i className={lang.contact.contact.phone.icon} />
                    </a>
                  </div>
                  <div className="right">
                    <span>{lang.contact.contact.phone.heading}</span>
                    {lang.contact.contact.phone.links.map((item, index) => (
                      <h4 key={index}>
                        <a >{item.text}</a>
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
              <ul
                className="social-links d-flex align-center"
                data-aos="zoom-in"
              >
                <li>
                  <a
                    className="shadow-box"
                    href="https://github.com/dmesmar/"
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    <i className="iconoir-github" />
                  </a>
                </li>
                <li>
                  <a
                    className="shadow-box"
                    href="https://www.linkedin.com/in/dario-mesas-marti/"
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    <i className="iconoir-linkedin" />
                  </a>
                </li>
              </ul>
            </div>
            <div data-aos="zoom-in" className="contact-form">
              <div className="shadow-box">
                <img src="/assets/bg1.png" alt="BG" className="bg-img" />
                <img src="/assets/icons/icon3.png" alt="Icon" />
                <h1
                  dangerouslySetInnerHTML={{
                    __html: lang.contact.form.heading,
                  }}
                ></h1>
                <Form onSubmit={handleSubmit}>
                  <Alert
                    className="messenger-box-contact__msg"
                    role="alert"
                    color="success"
                    isOpen={displayBanner}
                    toggle={() => setDisplayBanner(false)}
                  >
                    {lang.contact.form.onCompletion}
                  </Alert>
                  
                  <div className="input-group">
                    <input
                      type="text"
                      name="name"
                      id="name"
                      required
                      placeholder="Name *"
                    />
                    
                    <ValidationError
                      prefix="Name"
                      field="name"
                      errors={state.errors}
                    />
                  </div>
                  <div className="input-group">
                    <input
                      id="email"
                      type="email"
                      name="email"
                      required
                      placeholder="Email *"
                    />
                    <ValidationError
                      prefix="Email"
                      field="email"
                      errors={state.errors}
                    />
                  </div>
                  <div className="input-group">
                    <input
                      type="text"
                      name="topic"
                      id="topic"
                      required
                      placeholder="Topic *"
                    />
                    
                    <ValidationError
                      prefix="topic"
                      field="topic"
                      errors={state.errors}
                    />
                  </div>
                  
                  <div className="input-group">
                    <textarea
                      name="message"
                      id="message"
                      required
                      placeholder="Message *"
                    />
                    <ValidationError
                      prefix="Message"
                      field="message"
                      errors={state.errors}
                    />
                  </div>
                  <div className="input-group">
                    <button
                      className="theme-btn submit-btn"
                      type="submit"
                      disabled={state.submitting}
                    >
                      {lang.contact.form.button.text}
                    </button>
                  </div>
                </Form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default ContactPage;