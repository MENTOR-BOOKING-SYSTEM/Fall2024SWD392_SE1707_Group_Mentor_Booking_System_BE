import { config } from 'dotenv'
import fs from 'fs'
import path from 'path'
const env = process.env.NODE_ENV
const envFilename = `.env.${env}`
if (!env) {
  console.log(`Bạn chưa cung cấp biến môi trường NODE_ENV (ví dụ: development, production)`)
  console.log(`Phát hiện NODE_ENV = ${env}`)
  process.exit(1)
}
console.log(`Phát hiện NODE_ENV = ${env}, vì thế app sẽ dùng file môi trường là ${envFilename}`)
if (!fs.existsSync(path.resolve(envFilename))) {
  console.log(`Không tìm thấy file môi trường ${envFilename}`)
  console.log(`Lưu ý: App không dùng file .env, ví dụ môi trường là development thì app sẽ dùng file .env.development`)
  console.log(`Vui lòng tạo file ${envFilename} và tham khảo nội dung ở file .env.example`)
  process.exit(1)
}
config({
  path: envFilename
})
export const isProduction = env === 'production'

export const envConfig = {
  port: (process.env.PORT as string) || 4000,
  backendUrl: process.env.BACKEND_URL as string,
  frontendUrl: process.env.FRONTEND_URL as string,
  dbName: process.env.DB_NAME as string,
  dbUserName: process.env.DB_USER_NAME as string,
  dbPassword: process.env.DB_PASSWORD as string,
  jwtSecretAccessToken: process.env.JWT_SECRET_ACCESS_TOKEN as string,
  jwtSecretRefreshToken: process.env.JWT_SECRET_REFRESH_TOKEN as string,
  passwordSecret: process.env.PASSWORD_SECRET as string,
  accessTokenExpiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN as string,
  refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN as string,
  nodeMailerEmail: process.env.NODE_MAILER_EMAIL as string,
  nodeMailerPassword: process.env.NODE_MAILER_PASSWORD as string,
  jwtSecretForgotPasswordToken: process.env.JWT_SECRET_FORGOT_PASSWORD_TOKEN as string,
  forgotPasswordTokenExpiresIn: process.env.FORGOT_PASSWORD_EXPIRES_IN as string,
  s3SecretAccessKey: process.env.S3_SECRET_ACCESS_KEY as string,
  s3AccessKeyId: process.env.S3_ACCESS_KEY_ID as string,
  s3Endpoint: process.env.S3_ENDPOINT as string
}

