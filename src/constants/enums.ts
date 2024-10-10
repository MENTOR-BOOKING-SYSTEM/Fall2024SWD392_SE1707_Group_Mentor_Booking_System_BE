export enum TokenType {
  AccessToken,
  RefreshToken,
  ForgotPasswordToken,
  EmailVerifyToken
}
export enum TokenRole {
  Student = 'Student',
  Business = 'Business',
  Mentor = 'Mentor',
  Admin = 'Admin'
}
export enum ProjectStatus {
  Accepted,
  Rejected,
  Considered,
  Created,
  Pending
}
