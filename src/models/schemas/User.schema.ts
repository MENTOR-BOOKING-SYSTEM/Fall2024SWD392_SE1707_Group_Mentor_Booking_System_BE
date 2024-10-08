interface UserType {
  userID: string
  password: string
  username: string
  email: string
  firstName: string
  forgotPasswordToken?: string | null
  lastName: string
  createdAt?: Date
  updatedAt?: Date
  groupID?: string
}
export default class User {
  userID: string
  password: string
  username: string
  email: string
  firstName: string
  forgotPasswordToken: string | null
  lastName: string
  createdAt: Date
  updatedAt: Date
  groupID: string
  constructor({
    userID,
    password,
    username,
    email,
    firstName,
    lastName,
    createdAt,
    updatedAt,
    groupID,
    forgotPasswordToken
  }: UserType) {
    this.userID = userID
    this.password = password
    this.username = username
    this.email = email
    this.forgotPasswordToken = forgotPasswordToken || null
    this.firstName = firstName
    this.lastName = lastName
    this.createdAt = createdAt || new Date()
    this.updatedAt = updatedAt || new Date()
    this.groupID = groupID || ''
  }
}
