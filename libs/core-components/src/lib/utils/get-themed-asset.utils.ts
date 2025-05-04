
export type Asset = {
  light: string;
  dark: string;
};

export const getThemedContent = (theme: string | undefined, asset: Asset) => {
  if (theme === 'dark') {
    return asset.dark;
  } else {
    return asset.light;
  }
};
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
