import i18next = require("i18next");
import translation = require("../resources/locales/en/translation.json");

type SuccessMessages = (typeof translation)["success"];
type SuccessKey = keyof SuccessMessages;

export const messageHandler = (messageKey: SuccessKey) => {
  const successMessage = i18next.t(`success.${String(messageKey)}`);
  return { message: successMessage };
};
