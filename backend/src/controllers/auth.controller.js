import cognitoService from "../services/cognito.service.js";
import { success, failure } from "../utils/response.js";

const cognitoStatusCodes = {
  AccessDeniedException: 503,
  CodeDeliveryFailureException: 503,
  CodeMismatchException: 400,
  ExpiredCodeException: 400,
  AliasExistsException: 409,
  InvalidEmailRoleAccessPolicyException: 503,
  InvalidLambdaResponseException: 502,
  InvalidParameterException: 400,
  InvalidPasswordException: 400,
  LimitExceededException: 429,
  NotAuthorizedException: 401,
  ResourceNotFoundException: 404,
  TooManyRequestsException: 429,
  UnexpectedLambdaException: 502,
  UserLambdaValidationException: 400,
  UserNotConfirmedException: 403,
  UserNotFoundException: 404,
  UsernameExistsException: 409
};

const getErrorStatus = (error) =>
  error.statusCode || cognitoStatusCodes[error.name] || 500;

const publicMessages = {
  AccessDeniedException: "Account creation is not permitted by the configured AWS credentials.",
  AliasExistsException: "An account already uses this email address.",
  CodeDeliveryFailureException: "Your account could not be created because the invitation email could not be delivered.",
  CodeMismatchException: "The verification code is invalid.",
  ExpiredCodeException: "The verification code has expired. Request a new one.",
  InvalidEmailRoleAccessPolicyException: "The authentication email service is not configured correctly.",
  InvalidLambdaResponseException: "Account creation could not be completed by the authentication service.",
  InvalidParameterException: "The submitted details are invalid.",
  InvalidPasswordException: "The password does not meet the account requirements.",
  LimitExceededException: "Too many attempts. Please try again later.",
  NotAuthorizedException: "The username or password is incorrect.",
  ResourceNotFoundException: "The authentication service is unavailable.",
  TooManyRequestsException: "Too many attempts. Please try again later.",
  UnexpectedLambdaException: "Account creation could not be completed by the authentication service.",
  UserLambdaValidationException: "The submitted account details were rejected by the authentication service.",
  UserNotConfirmedException: "This account has not been confirmed.",
  UserNotFoundException: "The username or password is incorrect.",
  UsernameExistsException: "An account already uses this email address."
};

const sendAuthError = (res, error) => {
  // Do not log request bodies: they can contain passwords, reset codes, or tokens.
  console.error("Authentication request failed", {
    code: error.name || "Error",
    status: getErrorStatus(error)
  });

  return failure(
    res,
    error.publicMessage || publicMessages[error.name] || "Authentication could not be completed. Please try again.",
    getErrorStatus(error)
  );
};

class AuthController {

  async register(req, res) {
    try {
      const { firstName, lastName, email, company, phone } = req.body;

      const response = await cognitoService.register({
        firstName,
        lastName,
        email,
        company,
        phone
      });

      return success(
        res,
        response,
        "User created successfully"
      );

    } catch (error) {
      return sendAuthError(res, error);
    }
  }

  async setPassword(req, res) {
  try {
    const {
      username,
      session,
      temporaryPassword,
      newPassword
    } = req.body;

    const response = await cognitoService.setPassword({
      username,
      session,
      temporaryPassword,
      newPassword
    });

    return success(
      res,
      response,
      "Password updated successfully"
    );

  } catch (error) {
    return sendAuthError(res, error);
  }
}

  async login(req, res) {
    try {
      const { username, password } = req.body;

      const response = await cognitoService.login({
        username,
        password
      });

      return success(
        res,
        response,
        "Login successful"
      );

    } catch (error) {
      return sendAuthError(res, error);
    }
  }

  async forgotPassword(req, res) {
    try {
      const { username } = req.body;

      const response = await cognitoService.forgotPassword({
        username
      });

      return success(
        res,
        response,
        "Password reset code sent successfully"
      );

    } catch (error) {
      return sendAuthError(res, error);
    }
  }

  async resetPassword(req, res) {
    try {
      const { username, code, password } = req.body;

      const response = await cognitoService.resetPassword({
        username,
        code,
        password
      });

      return success(
        res,
        response,
        "Password reset successfully"
      );

    } catch (error) {
      return sendAuthError(res, error);
    }
  }

}

export default new AuthController();
