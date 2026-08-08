import { CognitoIdentityProviderClient } from "@aws-sdk/client-cognito-identity-provider";
import env from "./env.js";

const clientConfig = {
  region: env.awsRegion
};

if (env.accessKey && env.secretKey) {
  clientConfig.credentials = {
    accessKeyId: env.accessKey,
    secretAccessKey: env.secretKey
  };
}

const cognitoClient = new CognitoIdentityProviderClient(clientConfig);

export default cognitoClient;
