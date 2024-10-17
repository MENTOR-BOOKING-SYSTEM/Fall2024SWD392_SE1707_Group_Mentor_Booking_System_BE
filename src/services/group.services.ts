import { DatabaseTable } from '~/constants/databaseTable'
import databaseService from './database.services'
import Group from '~/models/schemas/Group.schema'
import Semester from '~/models/schemas/Semester.schema'
import { handleSpreadObjectToArray } from '~/utils/spreadObjectToArray'
import { OkPacket } from 'mysql2'

class GroupServices {
  async createGroup(groupName: string, usersID: number[]) {
    const [role, [semesterNow]] = await Promise.all([
      databaseService.query<{ roleName: string }[]>(
        `select r.roleName FROM \`${DatabaseTable.User}\`  u JOIN \`${DatabaseTable.User_Role}\` ur on u.userID = ur.userID JOIN \`${DatabaseTable.Role}\` r on ur.roleID = r.roleID where u.userID in (?)`,
        usersID
      ),
      databaseService.query<Semester[]>(
        `SELECT * FROM ${DatabaseTable.Semester} WHERE NOW() BETWEEN startDate AND endDate`
      )
    ])

    const { groupID, ...newGroup } = new Group({ groupName, semesterID: semesterNow.semesterID as string })
    const { insertId } = await databaseService.query<OkPacket>(
      ` INSERT INTO \`${DatabaseTable.Group}\` (groupName, semesterID, projectID, createdAt, updatedAt) 
  VALUES (?, ?, ?, ?, ?) ;`,

      handleSpreadObjectToArray(newGroup)
    )
    const [group] = await databaseService.query<Group[]>(
      ` SELECT * FROM \`${DatabaseTable.Group}\` WHERE groupID = ?`,
      [insertId]
    )
    const group_user = usersID.map((data, index) => ({ data, insertId, position: role[index].roleName }))
    for (const item of group_user) {
      await databaseService.query(
        `INSERT INTO ${DatabaseTable.User_Group}(userID,groupID,position) VALUES(?,?,?)`,
        handleSpreadObjectToArray(item)
      )
    }

    return { ...group, usersID }
  }
  async getRequestPending(groupID: number) {
    const result = await databaseService.query(
      `select * from ${DatabaseTable.User_Group} ug JOIN \`${DatabaseTable.Group}\` g on ug.groupID = g.groupID WHERE ug.groupID= ? and ug.position = ? `,
      [groupID, 'Proposal']
    )
    return result
  }
  async removeGroupMember(groupID: number, userID: number) {
    const result = await databaseService.query(
      `DELETE FROM ${DatabaseTable.User_Group} where userID = ? AND groupID = ?`,
      [userID, groupID]
    )
    return result
  }
}
const groupServices = new GroupServices()
export default groupServices
