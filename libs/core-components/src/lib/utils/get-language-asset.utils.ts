export type AssetLang = {
  ca: string;
  es: string;
  en: string;
};

export const getLanguageContent = (lang: string | undefined, asset: AssetLang) => {
  if (lang === 'ca') {
    return asset.ca;
  } else if (lang === 'es') {
    return asset.es;
  } else {
    return asset.en;
  }
};
