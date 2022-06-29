import { CommonRoutesConfig } from "../common/common.routes.config";
import usersMiddleware from "./middleware/users.middleware";
import express from "express";
import usersController from "./controllers/users.controller";

export class UsersRoutes extends CommonRoutesConfig {
  constructor(app: express.Application) {
    super(app, "UsersRoutes");
  }
  configureRoutes(): express.Application {
    this.app
      .route("/users")
      .get(usersController.listUsers)
      .post(
        usersMiddleware.validateRequiredUserBodyFields,
        usersMiddleware.validateSameEmailDoesNotExist,
        usersController.createUser
      );
    this.app.param("userId", usersMiddleware.extractUserId);
    this.app
      .route("/users/:userId")
      .all(usersMiddleware.validateUserExists)
      .get(usersController.getUserById)
      .delete(usersController.removeUser);
    this.app.put(
      "/users/:userId",
      usersMiddleware.validateRequiredUserBodyFields,
      usersMiddleware.validateSameEmailBelongToSameUser,
      usersController.put
    );
    this.app.patch("/users/:userId", [
      usersMiddleware.validatePatchEmail,
      usersController.patch,
    ]);
    return this.app;
  }
}
