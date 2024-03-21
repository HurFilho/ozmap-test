import * as Backend from "i18next-node-fs-backend";
import * as express from "express";
import * as i18nextMiddleware from "i18next-express-middleware";
import { Routes } from "./constants/routes.constant";
import regionsRouter from "./routes/regions.route";
import usersRouter from "./routes/users.route";
const i18next = require("i18next");

const server = express();
const router = express.Router();

i18next
  .use(Backend)
  .use(i18nextMiddleware.LanguageDetector)
  .init({
    backend: {
      loadPath: __dirname + "/resources/locales/{{lng}}/{{ns}}.json",
    },
    fallbackLng: "en",
    preload: ["en"],
  });

server.use(i18nextMiddleware.handle(i18next));
server.use(express.json());
server.use(router);

server.use(Routes.Users, usersRouter);
server.use(Routes.Regions, regionsRouter);

export default server;
