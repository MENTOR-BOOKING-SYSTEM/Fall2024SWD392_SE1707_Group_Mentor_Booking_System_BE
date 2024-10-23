import databaseService from './database.services'
import { Account } from '~/models/schemas/User.schema'
import { DatabaseTable } from '~/constants/databaseTable'
import { omit } from 'lodash'

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

    const transformedAccounts = Array.from(accountsMap.values())

    const total = transformedAccounts.length
    const totalPages = Math.ceil(total / limitNumber)

    const paginatedAccounts = transformedAccounts.slice(offset, offset + limitNumber)

    return {
      total,
      pages: totalPages,
      accounts: paginatedAccounts
    }
  }
}

const dashboardService = new DashboardService()
export default dashboardService
