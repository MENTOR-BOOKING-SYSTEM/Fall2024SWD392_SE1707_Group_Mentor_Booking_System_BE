interface UserType {
  userID: string
  password: string
  username: string
  email: string
  firstName: string
  forgotPasswordToken?: string | null
  avatarUrl?: string | null
  lastName: string
  createdAt?: Date
  updatedAt?: Date
}
export default class User {
  userID: string
  password: string
  username: string
  email: string
  firstName: string
  forgotPasswordToken: string | null
  avatarUrl: string | null
  lastName: string
  createdAt: Date
  updatedAt: Date
  constructor({
    userID,
    password,
    username,
    email,
    firstName,
    lastName,
    createdAt,
    updatedAt,
    forgotPasswordToken,
    avatarUrl
  }: UserType) {
    this.userID = userID
    this.password = password
    this.username = username
    this.email = email
    this.forgotPasswordToken = forgotPasswordToken || null
    this.firstName = firstName
    this.lastName = lastName
    this.avatarUrl = avatarUrl || null
    this.createdAt = createdAt || new Date()
    this.updatedAt = updatedAt || new Date()
  }
}

interface AccountType extends UserType {
  roleID: number
  roleName: string
}

export class Account extends User {
  roleID: number
  roleName: string
  constructor({ roleID, roleName, ...user }: AccountType) {
    super(user)
    this.roleID = roleID
    this.roleName = roleName
  }
}
