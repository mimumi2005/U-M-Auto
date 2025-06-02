import { getTranslation, saveTranslation } from '../models/translationModels.js';

export const fetchTranslation = (req, res) => {
  const  key  = req.params.key;
  const translations = getTranslation(key);
  res.json(translations);
};

export const addTranslation = (req, res) => {
  const { key, translation, lang } = req.body;
  saveTranslation(key, translation, lang);
  res.sendStatus(200);
};
