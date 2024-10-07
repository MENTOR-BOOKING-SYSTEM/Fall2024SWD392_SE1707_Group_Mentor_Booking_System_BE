interface UserType {
  userID: string
  password: string
  studentCode: string
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
  studentCode: string
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
    studentCode,
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
    this.studentCode = studentCode
    this.email = email
    this.forgotPasswordToken = forgotPasswordToken || null
    this.firstName = firstName
    this.lastName = lastName
    this.createdAt = createdAt || new Date()
    this.updatedAt = updatedAt || new Date()
    this.groupID = groupID || ''
  }
}
