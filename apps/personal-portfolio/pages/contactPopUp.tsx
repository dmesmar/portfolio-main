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
    <section className="contact-area d-flex justify-content-center align-items-center min-vh-100">
      <div className="container">
        <div className="gx-row d-flex justify-content-center">
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
                    placeholder={lang.contact.form.placeholderName}
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
                    placeholder={lang.contact.form.placeholderEmail}
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
                    placeholder={lang.contact.form.placeholderTopic}
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
                    placeholder={lang.contact.form.placeholderMessage}
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
  );
};

export default ContactPage;