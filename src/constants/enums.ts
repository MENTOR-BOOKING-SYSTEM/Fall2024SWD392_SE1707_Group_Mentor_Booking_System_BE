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
  Admin = 'Admin',
  Reviewer = "Reviewer"
}
export enum MediaQuery {
  Image = 'image',
  Video = 'video'
}
export enum MediaType {
  Image,
  Video,
  HLS
}
export enum ProjectStatus {
  Accepted,
  Rejected,
  Considered,
  Created,
  Pending
}
