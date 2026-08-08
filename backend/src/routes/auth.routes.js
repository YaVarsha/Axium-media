import express from "express";
import { body, validationResult } from "express-validator";
import authController from "../controllers/auth.controller.js";

const router = express.Router();

const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array().map((error) => ({
        field: error.path,
        message: error.msg
      }))
    });
  }

  return next();
};

/*
 * Do not use express-validator normalizeEmail() here.
 *
 * normalizeEmail() may modify Gmail addresses by removing dots or + tags.
 * Cognito should receive the same logical identifier that the user entered.
 *
 * We only:
 * - trim whitespace
 * - lowercase email identifiers
 *
 * Generated Cognito usernames such as user_xxxxx are left unchanged.
 */
const normalizeIdentifier = (value) => {
  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();

  return trimmed.includes("@")
    ? trimmed.toLowerCase()
    : trimmed;
};

const passwordRule = () =>
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long");

/*
 * REGISTER
 */
router.post(
  "/register",
  [
    body("firstName")
      .trim()
      .notEmpty()
      .withMessage("First name is required")
      .isLength({ max: 80 })
      .withMessage("First name must be 80 characters or fewer"),

    body("lastName")
      .trim()
      .notEmpty()
      .withMessage("Last name is required")
      .isLength({ max: 80 })
      .withMessage("Last name must be 80 characters or fewer"),

    body("email")
      .trim()
      .isEmail()
      .withMessage("A valid email address is required")
      .customSanitizer(normalizeIdentifier),

    body("company")
      .trim()
      .notEmpty()
      .withMessage("Company name is required")
      .isLength({ max: 160 })
      .withMessage("Company name must be 160 characters or fewer"),

    body("phone")
      .trim()
      .notEmpty()
      .withMessage("Phone number is required")
      .isLength({ max: 40 })
      .withMessage("Phone number must be 40 characters or fewer")
  ],
  validate,
  authController.register
);

/*
 * FIRST LOGIN - NEW_PASSWORD_REQUIRED
 *
 * This endpoint responds to the Cognito challenge.
 *
 * It is deliberately separate from ForgotPassword / ConfirmForgotPassword.
 */
router.post(
  "/set-password",
  [
    body("username")
      .customSanitizer(normalizeIdentifier)
      .notEmpty()
      .withMessage("Username is required"),

    body().custom((value) => {
      if (!value.session && !value.temporaryPassword) {
        throw new Error("Authentication session is required");
      }

      return true;
    }),

    body("newPassword")
      .isLength({ min: 8 })
      .withMessage("New password must be at least 8 characters long")
  ],
  validate,
  authController.setPassword
);

/*
 * LOGIN
 */
router.post(
  "/login",
  [
    body("username")
      .customSanitizer(normalizeIdentifier)
      .notEmpty()
      .withMessage("Username is required"),

    passwordRule()
  ],
  validate,
  authController.login
);

/*
 * FORGOT PASSWORD
 */
router.post(
  "/forgot-password",
  [
    body("username")
      .customSanitizer(normalizeIdentifier)
      .notEmpty()
      .withMessage("Username is required")
  ],
  validate,
  authController.forgotPassword
);

/*
 * FORGOT PASSWORD CONFIRMATION
 *
 * This requires the confirmation code.
 * It is NOT used for NEW_PASSWORD_REQUIRED.
 */
router.post(
  "/reset-password",
  [
    body("username")
      .customSanitizer(normalizeIdentifier)
      .notEmpty()
      .withMessage("Username is required"),

    body("code")
      .trim()
      .notEmpty()
      .withMessage("Reset code is required"),

    passwordRule()
  ],
  validate,
  authController.resetPassword
);

export default router;