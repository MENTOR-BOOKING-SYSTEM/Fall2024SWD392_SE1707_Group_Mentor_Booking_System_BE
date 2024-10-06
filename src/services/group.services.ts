import { DatabaseTable } from '~/constants/databaseTable'
import databaseService from './database.services'
import Group from '~/models/schemas/Group.schema'
import Semester from '~/models/schemas/Semester.schema'
import { handleSpreadObjectToArray } from '~/utils/spreadObjectToArray'
import { OkPacket } from 'mysql2'

class GroupServices {
  async createGroup(groupName: string) {
    console.log(`SELECT * FROM ${DatabaseTable.Semester.toString} WHERE NOW() BETWEEN startDate AND endDate`)
    const [semesterNow] = await databaseService.query<Semester[]>(
      `SELECT * FROM ${DatabaseTable.Semester} WHERE NOW() BETWEEN startDate AND endDate`
    )
    const { groupID, ...newGroup } = new Group({ groupName, semesterID: semesterNow.semesterID as string })
    const { insertId } = await databaseService.query<OkPacket>(
      ` INSERT INTO \`${DatabaseTable.Group}\` (groupName, semesterID, projectID, createdAt, updatedAt) 
  VALUES (?, ?, ?, ?, ?) ;`,

      handleSpreadObjectToArray(newGroup)
    )
    const group = await databaseService.query<Group>(` SELECT * FROM \`${DatabaseTable.Group}\` WHERE groupID = ?`, [insertId])
    return group
  }
}
const groupServices = new GroupServices()
export default groupServices
