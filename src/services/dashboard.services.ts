import databaseService from './database.services'
import { Account, Role } from '~/models/schemas/User.schema'
import { DatabaseTable } from '~/constants/databaseTable'
import { omit } from 'lodash'
import { CreateAccountReqBody, EditAccountReqBody } from '~/models/Request/Dashboard.request'
import { hashPassword } from '~/utils/crypto'

class DashboardService {
  async getAccounts(limit: string, page: string, semesterID: string) {
    const limitNumber = Number(limit)
    const pageNumber = Number(page)
    const offset = (pageNumber - 1) * limitNumber

    const accounts = await databaseService.query<Account[]>(
      `
      SELECT u.userID, u.email, u.username, u.firstName, u.lastName, u.avatarUrl, u.createdAt, u.updatedAt, ur.roleID, r.roleName 
      FROM ${DatabaseTable.User} AS u 
      JOIN ${DatabaseTable.User_Role} AS ur
      ON u.userID = ur.userID 
      JOIN ${DatabaseTable.Role} AS r
      ON ur.roleID = r.roleID 
      WHERE r.roleName <> 'Admin' AND ur.semesterID = ?
    `,
      [semesterID]
    )

    const accountsMap = new Map<string, any>()
    accounts.forEach((account) => {
      if (accountsMap.get(account.userID)) {
        accountsMap.get(account.userID)?.roles.push({ roleID: account.roleID, roleName: account.roleName })
      } else {
        accountsMap.set(account.userID, {
          ...omit(account, ['roleID', 'roleName']),
          roles: [{ roleID: account.roleID, roleName: account.roleName }]
        })
      }
    })

    const transformedAccounts = Array.from(accountsMap.values()).sort((a, b) => a.userID - b.userID)

    const total = transformedAccounts.length
    const totalPages = Math.ceil(total / limitNumber)

    const paginatedAccounts = transformedAccounts.slice(offset, offset + limitNumber)

    return {
      total,
      pages: totalPages,
      accounts: paginatedAccounts
    }
  }

  async getRoles() {
    const roles = await databaseService.query<Role[]>(`SELECT roleID, roleName FROM ${DatabaseTable.Role}`)
    return roles
  }

  async createAccount({ account, semesterID }: { account: CreateAccountReqBody; semesterID: string }) {
    const { firstName, lastName, username, email, password, roles, avatarUrl } = account
    await databaseService.query(
      `INSERT INTO ${DatabaseTable.User} (username, email, password, firstName, lastName, avatarUrl) VALUES (?, ?, ?, ?, ?, ?)`,
      [username, email, hashPassword(password), firstName, lastName, avatarUrl]
    )

    const [user] = await databaseService.query<{ userID: string }[]>(
      `SELECT userID FROM ${DatabaseTable.User} WHERE email = ?`,
      [email]
    )

    await Promise.all(
      roles.map((roleID) =>
        databaseService.query(`INSERT INTO ${DatabaseTable.User_Role} (userID, roleID, semesterID) VALUES (?, ?, ?)`, [
          user.userID,
          roleID,
          semesterID
        ])
      )
    )
  }

  async getAccount(semesterID: string, userID: string) {
    const accounts = await databaseService.query<Account[]>(
      `
      SELECT u.userID, u.email, u.username, u.firstName, u.lastName, u.avatarUrl, u.createdAt, u.updatedAt, ur.roleID, r.roleName
      FROM ${DatabaseTable.User} AS u 
      JOIN ${DatabaseTable.User_Role} AS ur 
      ON u.userID = ur.userID 
      JOIN ${DatabaseTable.Role} AS r 
      ON ur.roleID = r.roleID 
      WHERE ur.semesterID = ? AND u.userID = ?
    `,
      [semesterID, userID]
    )

    const accountsMap = new Map<string, any>()
    accounts.forEach((account) => {
      if (accountsMap.get(account.userID)) {
        accountsMap.get(account.userID)?.roles.push({ roleID: account.roleID, roleName: account.roleName })
      } else {
        accountsMap.set(account.userID, {
          ...omit(account, ['roleID', 'roleName']),
          roles: [{ roleID: account.roleID, roleName: account.roleName }]
        })
      }
    })
    return Array.from(accountsMap.values())[0]
  }

  async editAccount({
    account,
    semesterID,
    userID
  }: {
    account: EditAccountReqBody
    semesterID: string
    userID: string
  }) {
    const { firstName, lastName, roles, avatarUrl } = account
    await databaseService.query(
      `UPDATE ${DatabaseTable.User} SET firstName = ?, lastName = ?, avatarUrl = ? WHERE userID = ?`,
      [firstName, lastName, avatarUrl, userID]
    )

    await databaseService.query(`DELETE FROM ${DatabaseTable.User_Role} WHERE userID = ? AND semesterID = ?`, [
      userID,
      semesterID
    ])

    await Promise.all(
      roles.map((roleID) =>
        databaseService.query(`INSERT INTO ${DatabaseTable.User_Role} (userID, roleID, semesterID) VALUES (?, ?, ?)`, [
          userID,
          roleID,
          semesterID
        ])
      )
    )
  }
}

const dashboardService = new DashboardService()
export default dashboardService
