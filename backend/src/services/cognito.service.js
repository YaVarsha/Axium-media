import {
  AdminCreateUserCommand,
  InitiateAuthCommand,
  RespondToAuthChallengeCommand,
  ForgotPasswordCommand,
  ConfirmForgotPasswordCommand
} from "@aws-sdk/client-cognito-identity-provider";
import crypto from "node:crypto";

import { v4 as uuid } from "uuid";
import env from "../config/env.js";
import cognitoClient from "../config/aws.js";

class CognitoService {

async register({ firstName, lastName, email, company, phone }) {
  this.ensureConfig();

  const temporaryPassword =
    `Tmp@${uuid().replace(/-/g, "").substring(0, 10)}1`;

  // IMPORTANT:
  // Cognito pool uses email as an alias, therefore the internal Username
  // must NOT itself be an email address.
  const username = `user_${uuid().replace(/-/g, "").substring(0, 12)}`;

  const command = new AdminCreateUserCommand({
    UserPoolId: env.userPoolId,
    Username: username,
    TemporaryPassword: temporaryPassword,
    DesiredDeliveryMediums: ["EMAIL"],

    ClientMetadata: {
      company: company || "",
      phone: phone || ""
    },

    UserAttributes: [
      {
        Name: "email",
        Value: email.trim().toLowerCase()
      },
      {
        Name: "email_verified",
        Value: "true"
      },
      {
        Name: "given_name",
        Value: firstName
      },
      {
        Name: "family_name",
        Value: lastName
      }
    ]
  });

  await cognitoClient.send(command);

  return {
    username,
    email: email.trim().toLowerCase()
  };
}

  async setPassword({ username, session, temporaryPassword, newPassword }) {
    this.ensureConfig();

    let challengeSession = session;
    let challengeUsername = username;

    // Backward-compatible fallback for any old caller that still submits the
    // temporary password directly. The normal UI now gets the challenge session
    // from /login and continues it here without asking for the temp password twice.
    if (!challengeSession) {
      const initiateResponse = await cognitoClient.send(
        new InitiateAuthCommand({
          ClientId: env.clientId,
          AuthFlow: "USER_PASSWORD_AUTH",
          AuthParameters: {
            USERNAME: username,
            PASSWORD: temporaryPassword,
            ...this.secretHashAuthParameter(username)
          }
        })
      );

      if (initiateResponse.ChallengeName !== "NEW_PASSWORD_REQUIRED") {
        const error = new Error("Temporary password challenge was not returned");
        error.statusCode = 400;
        error.publicMessage = "Password reset could not be started. Please sign in again.";
        throw error;
      }

      challengeSession = initiateResponse.Session;
      challengeUsername =
        initiateResponse.ChallengeParameters?.USER_ID_FOR_SRP || username;
    }

    const challengeResponse = await cognitoClient.send(
      new RespondToAuthChallengeCommand({
        ClientId: env.clientId,
        ChallengeName: "NEW_PASSWORD_REQUIRED",
        Session: challengeSession,
        ChallengeResponses: {
          USERNAME: challengeUsername,
          NEW_PASSWORD: newPassword,
          ...this.secretHashAuthParameter(challengeUsername)
        }
      })
    );

    if (!challengeResponse.AuthenticationResult?.AccessToken) {
      const error = new Error("Password update did not complete");
      error.statusCode = 400;
      error.publicMessage = "Password update could not be completed. Please try again.";
      throw error;
    }

    // Axium-style first-login flow: after setting the permanent password the
    // user returns to Sign in and uses the new password.
    return { username: challengeUsername };
  }

  async login({ username, password }) {
    this.ensureConfig();

    const response = await cognitoClient.send(
      new InitiateAuthCommand({
        ClientId: env.clientId,
        AuthFlow: "USER_PASSWORD_AUTH",
        AuthParameters: {
          USERNAME: username,
          PASSWORD: password,
          ...this.secretHashAuthParameter(username)
        }
      })
    );

    if (response.ChallengeName === "NEW_PASSWORD_REQUIRED") {
      return {
        challengeName: "NEW_PASSWORD_REQUIRED",
        session: response.Session,
        username: response.ChallengeParameters?.USER_ID_FOR_SRP || username
      };
    }

    return this.formatTokens(response.AuthenticationResult);
  }

  async forgotPassword({ username }) {
    this.ensureConfig();

    await cognitoClient.send(
      new ForgotPasswordCommand({
        ClientId: env.clientId,
        Username: username,
        ...this.secretHashParameter(username)
      })
    );

    return { username };
  }

  async resetPassword({ username, code, password }) {
    this.ensureConfig();

    await cognitoClient.send(
      new ConfirmForgotPasswordCommand({
        ClientId: env.clientId,
        Username: username,
        ConfirmationCode: code,
        Password: password,
        ...this.secretHashParameter(username)
      })
    );

    return { username };
  }

  formatTokens(authenticationResult) {
    if (!authenticationResult?.AccessToken) {
      const error = new Error("Authentication did not return tokens");
      error.statusCode = 401;
      error.publicMessage = "Sign-in could not be completed. Please try again.";
      throw error;
    }

    return {
      accessToken: authenticationResult.AccessToken,
      idToken: authenticationResult.IdToken,
      refreshToken: authenticationResult.RefreshToken,
      expiresIn: authenticationResult.ExpiresIn,
      tokenType: authenticationResult.TokenType
    };
  }

  secretHash(username) {
    if (!env.clientSecret) return undefined;

    return crypto
      .createHmac("sha256", env.clientSecret)
      .update(`${username}${env.clientId}`)
      .digest("base64");
  }

  secretHashAuthParameter(username) {
    const secretHash = this.secretHash(username);
    return secretHash ? { SECRET_HASH: secretHash } : {};
  }

  secretHashParameter(username) {
    const secretHash = this.secretHash(username);
    return secretHash ? { SecretHash: secretHash } : {};
  }

  ensureConfig() {
    const missing = [];

    if (!env.awsRegion) missing.push("AWS_REGION");
    if (!env.userPoolId) missing.push("COGNITO_USER_POOL_ID");
    if (!env.clientId) missing.push("COGNITO_CLIENT_ID");

    if (missing.length) {
      const error = new Error(
        `Missing required Cognito configuration: ${missing.join(", ")}`
      );
      error.statusCode = 500;
      throw error;
    }
  }

}

export default new CognitoService();
