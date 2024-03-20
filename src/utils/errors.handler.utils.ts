import i18next = require("i18next");
import translation = require("../resources/locales/en/translation.json");

type ErrorMessages = (typeof translation)["errors"];
type ErrorKey = keyof ErrorMessages;

export const errorHandler = (errorKey: ErrorKey) => {
  const errorMessage = i18next.t(`errors.${String(errorKey)}`);
  return { error: errorMessage };
};

export const errorMessage = (errorKey: ErrorKey) => {
  const errorMessage = i18next.t(`errors.${String(errorKey)}`);
  return errorMessage;
};
