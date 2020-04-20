export default {
  bodySizeLimit: 1024 * 1024 * 10,
  parameterLimit: 10000,
  port: process.env.PORT || 8080,
  host: process.env.HOST as string,
  basicAuth: String(process.env.BASIC_AUTH),
  rsaPublicKey: String(process.env.RSA_PUBLIC_KEY),
  rsaPrivateKey: String(process.env.RSA_PRIVATE_KEY),
  spreedlyEnviromentKey: process.env.ENVIRONMENT_KEY as string,
  spreedlyApiKey: process.env.API_KEY as string
};
