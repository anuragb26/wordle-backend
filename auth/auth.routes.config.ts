import { CommonRoutesConfig } from "../common/common.routes.config";
import authController from "./controllers/auth.controller";
import authMiddleware from "./middleware/auth.middleware";
import express from "express";
import bodyValidationMiddleware from "../common/middleware/body.validation.middleware";
import { body } from "express-validator";
import jwtMiddleware from "./middleware/jwt.middleware";

export class AuthRoutes extends CommonRoutesConfig {
  constructor(app: express.Application) {
    super(app, "AuthRoutes");
  }
  configureRoutes(): express.Application {
    this.app.post("/auth", [
      body("email").isEmail(),
      body("password").isString(),
      bodyValidationMiddleware.verifyBodyFieldErrors,
      authMiddleware.verifyUserPassword,
      authController.createJwt,
    ]);
    this.app.post("/auth/refresh-token", [
      jwtMiddleware.validJwtNeeded,
      jwtMiddleware.verifyRefreshBodyField,
      jwtMiddleware.validRefreshNeeded,
      authController.createJwt,
    ]);
    return this.app;
  }
}
