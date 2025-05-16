import { Layout } from '@dmesmar/core-components';
import { Post } from '@dmesmar/store';
import styles from '../CertificatesPage.module.scss';
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
import { getCurrentLanguage } from '../../../../libs/core-components/src/lib/language-configurator';
import { useState, useEffect } from 'react';
import { Input, Badge } from 'reactstrap';

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

  const categoriesList = {
    webDev: lang.portfolio.categories.webDev,
    mobileApp: lang.portfolio.categories.mobileApp,
    AI: lang.portfolio.categories.ai,
    ML: lang.portfolio.categories.ml,
    backend: lang.portfolio.categories.backend,
    frontend: lang.portfolio.categories.frontend,
    thesis: lang.portfolio.categories.thesis
  };
  
  const languages = ['es', 'en', 'ca'];

  const projectsData = [
    ...languages.map(lang => ({
      file: `${lang}TFG.mdx`,
      categories: [categoriesList.thesis, categoriesList.frontend],
    })),
    ...languages.map(lang => ({
      file: `${lang}Digits.mdx`,
      categories: [categoriesList.ML, categoriesList.AI],
    }))
  ];



  // Get all case studies for the current language
  const langFilteredCaseStudies = caseStudies.filter(
  study => {
    const basePath = study.filePath.replace(/\.mdx?$/, '');
    return basePath.startsWith(langCode);
  }
);


  const projectsWithCategories = langFilteredCaseStudies.map(study => {
    const projectData = projectsData.find(p => p.file === study.filePath);
    const categories = projectData ? projectData.categories : [];
    
    return {
      ...study,
      projectCategories: categories
    };
  });

  const [searchText, setSearchText] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [filteredProjects, setFilteredProjects] = useState(projectsWithCategories);

  const allCategories = [...new Set(projectsData.flatMap(project => project.categories))];

  useEffect(() => {
    const filtered = projectsWithCategories.filter(project => {
      const titleMatch = project.metadata.title?.toLowerCase().includes(searchText.toLowerCase());
      
      if (selectedCategories.length === 0) {
        return titleMatch;
      }
      
      const categoryMatch = selectedCategories.some(category => 
        project.projectCategories.includes(category)
      );
      
      return titleMatch && categoryMatch;
    });
    
    setFilteredProjects(filtered);
  }, [searchText, selectedCategories, projectsWithCategories]);

  // Toggle category selection
  const toggleCategory = (category: string) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter(cat => cat !== category));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  // Remove category from search
  const removeCategory = (category: string) => {
    setSelectedCategories(selectedCategories.filter(cat => cat !== category));
  };

  const ROW_SIZE = 3;
  const rows = chunkArray(filteredProjects, ROW_SIZE);

  return (
    <Layout wrapperClass="main-workspage" title="Projects">
      <section className="projects-area">
        <h1 className="section-heading" data-aos="fade-up">
          Portfolio
        </h1>
        <div className="container">
          {/* Search and Categories Section */}
          <div className={styles.searchSection} data-aos="fade-up">
            <div className="row mb-4">
              <div className="col-md-12">
                <div className={styles.searchContainer}>
                  <Input
                    type="text"
                    placeholder={lang.portfolio.placeholder_search_bar}
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
              </div>
            </div>
            
            <div className="row mb-4">
              <div className="col-md-12">
                <div className={styles.categoriesContainer}>
                  <span className={styles.categoriesLabel}>{lang.misc.categories} </span>
                  {allCategories.map(category => (
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
              </div>
            </div>
          </div>

          {filteredProjects.length > 0 ? (
            <>
              {rows.map((row, rowIdx) => (
                <div className="row mb-4" key={rowIdx}>
                  {row.map((project, colIdx) => (
                    <div className="col-md-4 " key={colIdx}>
                      <div data-aos="zoom-in">
                        <div className="project-item shadow-box">
                          <Link
                            className="overlay-link"
                            as={`/portfolio/${project.filePath.replace(/\.mdx?$/, '')}`}
                            href={`/portfolio/[entry]`}
                          />
                          <img src="/assets/bg1.png" alt="BG" className="bg-img" />
                          <div className="project-img">
                            <img src={project.metadata.thumbnail} alt="thumbnail" />
                          </div>
                          <div className="d-flex align-items-center justify-content-between">
                            <div className="project-info">
                              <div className="project-categories d-flex flex-wrap mb-2">
                                {project.projectCategories.map((category, idx) => (
                                  <Badge 
                                    key={idx} 
                                    pill 
                                    className={`me-1 mb-1 ${styles.categoryBadge}`}
                                    color="light"
                                  >
                                    {category}
                                  </Badge>
                                ))}
                              </div>
                              <h1>{project.metadata.title}</h1>
                              <Moment format="L - h:mm a">
                                {project.metadata.modified || project.metadata.created}
                              </Moment>
                            </div>
                            <Link
                              as={`/portfolio/${project.filePath.replace(/\.mdx?$/, '')}`}
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
            </>
          ) : (
            <div className={styles.noResults} data-aos="fade-in">
              <p>{lang.certifications.not_found}</p>
            </div>
          )}

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
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default PortfolioPage;