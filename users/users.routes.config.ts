import BodyValidationMiddleware from "../common/middleware/body.validation.middleware";
import { CommonRoutesConfig } from "../common/common.routes.config";
import usersMiddleware from "./middleware/users.middleware";
import usersController from "./controllers/users.controller";
import express from "express";
import { body } from "express-validator";
import jwtMiddleware from "../auth/middleware/jwt.middleware";
import permissionMiddleware from "../common/middleware/common.permission.middleware";
import { PermissionFlag } from "../common/middleware/common.permissionFlag.enum";

export class UsersRoutes extends CommonRoutesConfig {
  constructor(app: express.Application) {
    super(app, "UsersRoutes");
  }
  configureRoutes(): express.Application {
    this.app
      .route("/users")
      .get(
        jwtMiddleware.validJwtNeeded,
        permissionMiddleware.permissionFlagRequired(
          PermissionFlag.ADMIN_PERMISSION
        ),
        usersController.listUsers
      )
      .post(
        body("email").isEmail(),
        body("password")
          .isLength({ min: 5 })
          .withMessage("Must include password (5+ characters)"),
        BodyValidationMiddleware.verifyBodyFieldErrors,
        usersMiddleware.validateSameEmailDoesNotExist,
        usersController.createUser
      );
    this.app.param("userId", usersMiddleware.extractUserId);
    this.app
      .route("/users/:userId")
      .all(
        usersMiddleware.validateUserExists,
        jwtMiddleware.validJwtNeeded,
        permissionMiddleware.onlySameUserOrAdminCanDoThisAction
      )
      .get(usersController.getUserById)
      .delete(usersController.removeUser);
    this.app.put(
      "/users/:userId",
      body("email").isEmail(),
      body("password")
        .isLength({ min: 5 })
        .withMessage(`Must include password (5+ characters)`),
      body("firstName").isString(),
      body("lastName").isString(),
      body("permissionFlags").isInt(),
      BodyValidationMiddleware.verifyBodyFieldErrors,
      usersMiddleware.validateSameEmailBelongToSameUser,
      usersMiddleware.userCannotChangePermissions,
      usersController.put
    );
    this.app.patch("/users/:userId", [
      body("email").isEmail().optional(),
      body("password")
        .isLength({ min: 5 })
        .withMessage("Password must be 5+ characters")
        .optional(),
      body("firstName").isString().optional(),
      body("lastName").isString().optional(),
      body("permissionFlags").isInt().optional(),
      BodyValidationMiddleware.verifyBodyFieldErrors,
      usersMiddleware.validatePatchEmail,
      usersMiddleware.userCannotChangePermissions,
      usersController.patch,
    ]);
    return this.app;
  }
}
