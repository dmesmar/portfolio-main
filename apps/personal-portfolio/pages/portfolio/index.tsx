import { Layout } from '@dmesmar/core-components';
import { Post } from '@dmesmar/store';
import { getThemedContent } from '@dmesmar/core-components';
import { en, es, ca } from '@dmesmar/i18n';
import { useTheme } from 'next-themes';
import fs from 'fs';
import matter from 'gray-matter';
import { GetStaticProps } from 'next';
import Link from 'next/link';
import path from 'path';
import Moment from 'react-moment';
import { CASE_STUDIES_PATH, caseStudiesFilePaths } from '../../utils/mdx.utils';
import GithubCalendar from '../../../../libs/core-components/src/lib/GithubCalendar';
import Skills from '../../../../libs/core-components/src/lib/skills/skills';
import { getCurrentLanguage } from '../../../../libs/core-components/src/lib/language-configurator';

// Helper for slicing the projects array into rows of given size
function chunkArray<T>(array: T[], size: number): T[][] {
  const res: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    res.push(array.slice(i, i + size));
  }
  return res;
}

export const getStaticProps: GetStaticProps<PortfolioPageProps> = () => {
  const caseStudies = caseStudiesFilePaths.map((filePath) => {
    const fileContents = fs.readFileSync(
      path.join(CASE_STUDIES_PATH, filePath)
    );
    const fileMetadata = fs.statSync(path.join(CASE_STUDIES_PATH, filePath));
    const { content, data } = matter(fileContents);

    return {
      content,
      metadata: {
        ...data,
        created: fileMetadata.ctime.toISOString(),
        modified: fileMetadata.mtime.toISOString(),
      },
      filePath,
    };
  });

  return { props: { caseStudies } };
};

type PortfolioPageProps = {
  caseStudies: Post[];
};

const PortfolioPage = ({ caseStudies }: PortfolioPageProps) => {
  const langCode = getCurrentLanguage();
  const langMap = { en, es, ca };
  const lang = langMap[langCode];
  const { theme } = useTheme();

  const filteredCaseStudies = caseStudies.filter(
    study =>
      study.filePath.replace(/\.mdx?$/, '').startsWith(langCode)
  );
  console.log(filteredCaseStudies)
  const ROW_SIZE = 3;
  const rows = chunkArray(filteredCaseStudies, ROW_SIZE);

  return (
    <Layout wrapperClass="main-workspage" title="Projects">
      <section className="projects-area">
        <h1 className="section-heading" data-aos="fade-up">
          Portfolio
        </h1>
        <div className="container">
          {rows.map((row, rowIdx) => (
            <div className="row mb-4" key={rowIdx}>
              {row.map((study, colIdx) => (
                <div className="col-md-4" key={colIdx}>
                  <div data-aos="zoom-in">
                    <div className="project-item shadow-box">
                      <Link
                        className="overlay-link"
                        as={`/portfolio/${study.filePath.replace(/\.mdx?$/, '')}`}
                        href={`/portfolio/[entry]`}
                      />
                      <img src="/assets/bg1.png" alt="BG" className="bg-img" />
                      <div className="project-img">
                        <img src={study.metadata.thumbnail} alt="thumbnail" />
                      </div>
                      <div className="d-flex align-items-center justify-content-between">
                        <div className="project-info">
                          <p>{study.metadata.category}</p>
                          <h1>{study.metadata.title}</h1>
                          <Moment format="L - h:mm a">
                            {study.metadata.modified || study.metadata.created}
                          </Moment>
                        </div>
                        <Link
                          as={`/portfolio/${study.filePath.replace(/\.mdx?$/, '')}`}
                          href={`/portfolio/[entry]`}
                          className="project-btn"
                        >
                          <img src="/assets/icons/cta-icon.svg" alt="Button" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}

          <div className="mt-5"></div>
          <div className="about-contact-box info-box shadow-box">
            <img src="/assets/bg1.png" alt="BG" className="bg-img" />
            <img src="/assets/icons/icon2.png" alt="Icon" className="star-icon" />
            <div className="w-full max-w-3xl mx-auto">
              <h1>
                <GithubCalendar username="dmesmar" />
              </h1>
            </div>
            <br />
            {/*   <Skills />    */}
          </div>
        </div>

        <style jsx>{`
          .image-container {
            display: flex;
            justify-content: center;
            align-items: center;
            width: 100%;
            max-width: 1000px;
            margin: 0 auto;
          }
        `}</style>
      </section>
    </Layout>
  );
};

export default PortfolioPage;