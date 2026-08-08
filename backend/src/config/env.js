import dotenv from "dotenv";

dotenv.config();

export default {
  port: process.env.PORT || 5000,

  awsRegion: process.env.AWS_REGION,

  accessKey: process.env.AWS_ACCESS_KEY_ID,

  secretKey: process.env.AWS_SECRET_ACCESS_KEY,

  userPoolId: process.env.COGNITO_USER_POOL_ID,

  clientId: process.env.COGNITO_CLIENT_ID,

  clientSecret: process.env.COGNITO_CLIENT_SECRET,

  frontendOrigin: process.env.FRONTEND_ORIGIN || "http://localhost:5173",

  jwtSecret: process.env.JWT_SECRET
};
