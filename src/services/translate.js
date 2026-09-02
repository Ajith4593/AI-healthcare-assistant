import apiClient from "@/lib/axios";
import { API } from "@/constants/api";
import { UI_TRANSLATIONS } from "@/locales/uiTranslations";

export async function translateText(text, targetLang) {
  const dictionary = UI_TRANSLATIONS[targetLang];
  if (dictionary && typeof dictionary[text] === "string") {
    return dictionary[text];
  }

  const response = await apiClient.post(API.TRANSLATE, {
    text,
    target_language: targetLang,
  });
  return response.data.translated_text;
}