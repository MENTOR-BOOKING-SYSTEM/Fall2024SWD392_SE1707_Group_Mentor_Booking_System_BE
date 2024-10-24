import { DatabaseTable } from '~/constants/databaseTable'
import databaseService from './database.services'
import Group from '~/models/schemas/Group.schema'
import Semester from '~/models/schemas/Semester.schema'
import { handleSpreadObjectToArray } from '~/utils/spreadObjectToArray'
import { OkPacket } from 'mysql2'

class GroupServices {
  async createGroup(groupName: string, usersID: number[], user_id: string) {
    const [role, [semesterNow]] = await Promise.all([
      databaseService.query<{ roleName: string }[]>(
        `select r.roleName FROM \`${DatabaseTable.User}\`  u JOIN \`${DatabaseTable.User_Role}\` ur on u.userID = ur.userID JOIN \`${DatabaseTable.Role}\` r on ur.roleID = r.roleID where u.userID in (?)`,
        usersID
      ),
      databaseService.query<Semester[]>(
        `SELECT * FROM ${DatabaseTable.Semester} WHERE NOW() BETWEEN startDate AND endDate`
      )
    ])
    console.log(role);

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
    const group_user = usersID.map((data, index) => ({ data, insertId, position: data === Number(user_id) ? "Leader" : role[index] ? role[index].roleName : role[0].roleName }))
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
  async addMemberToGroup(groupID: number, userID: number[]) {
    const alreadyInGroup = userID.map((item) =>
      databaseService.query<{ userID: number; position: string }[]>(
        `select userID,position from ${DatabaseTable.User_Group} where userID= ? and groupID =?`,
        [item, groupID]
      )
    )
    const promiseCheckPosition = await Promise.all(alreadyInGroup)
    console.log(promiseCheckPosition)

    const newUserArray = userID.filter((id) => promiseCheckPosition.flat().some((item) => id !== item.userID))

    const proposal = promiseCheckPosition.flat().reduce((result: number[], item) => {
      if (item.position === 'Proposal') {
        result.push(item.userID)
      }
      return result
    }, [])
    const proposalInGroup = proposal
    const insertNewMember = newUserArray.map((item) =>
      databaseService.query(`Insert into ${DatabaseTable.User_Group}(userID,groupID,position) values (?,?,?)`, [
        item,
        groupID,
        'Member'
      ])
    )
    const acceptMember = proposalInGroup.map((item) =>
      databaseService.query(`UPDATE ${DatabaseTable.User_Group} SET position = ? where userID =?`, ['Member', item])
    )
    const allQueries = [...insertNewMember, ...acceptMember]
    const result = await Promise.all(allQueries)
    return result
  }
  async assignLeader(groupID: number, userID: number, oldLeader: number) {
    const result = await Promise.all([
      databaseService.query(`UPDATE ${DatabaseTable.User_Group} set position = ? where userID =? and groupID =?`, [
        'Leader',
        userID,
        groupID
      ]),
      databaseService.query(`UPDATE ${DatabaseTable.User_Group} set position = ? where userID =? and groupID =?`, [
        'Member',
        oldLeader,
        groupID
      ])
    ])
    return result
  }
  async getListUserFromGroup(groupID: string) {
    const result = await databaseService.query(`select u.email,u.username,u.firstName,u.lastName,u.avatarUrl,ug.groupID,ug.position,g.groupName from \`${DatabaseTable.User}\` u join ${DatabaseTable.User_Group} ug on ug.userID=u.userID JOIN \`${DatabaseTable.Group}\` g on ug.groupID = g.groupID where g.groupID =? `, [groupID])
    return result
  }

  async getUserGroup(userID: string) {
    const result = await databaseService.query<Group[]>(
      `SELECT g.* FROM \`${DatabaseTable.Group}\` g
       JOIN ${DatabaseTable.User_Group} ug ON g.groupID = ug.groupID
       WHERE ug.userID = ?`,
      [userID]
    )
    return result.length > 0 ? result[0] : null
  }
}
const groupServices = new GroupServices()
export default groupServices
