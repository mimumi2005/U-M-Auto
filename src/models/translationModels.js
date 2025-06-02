import fs from 'fs';
import path from 'path';
const dynamicLocalesPath = path.join(process.cwd(), 'locales', 'dynamic');

export const getTranslation = (key) => {
 const translationsForKey = {};

  // Read all dynamic translation files
  const files = fs.readdirSync(dynamicLocalesPath);
  files.forEach(file => {
    const lang = path.basename(file, '.json');
    const filePath = path.join(dynamicLocalesPath, file);

    const translations = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    if (translations[key]) {
      translationsForKey[lang] = translations[key];
    }
  });

  return translationsForKey;
};

export const saveTranslation = (key, translation, lang) => {
  const filePath = path.join(dynamicLocalesPath, `${lang}.json`);
  let translations = {};
  if (fs.existsSync(filePath)) {
    translations = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  }
  translations[key] = translation;
  fs.writeFileSync(filePath, JSON.stringify(translations, null, 2), 'utf-8');
};
