import Technology from '~/models/schemas/Technology.schema'
import databaseService from './database.services'
import { DatabaseTable } from '~/constants/databaseTable'

class TechnologyServices {
  async getTechnologies(limit: number, page: number) {
    const result = await databaseService.query<Technology[]>(
      `select * from ${DatabaseTable.Technology} limit ${limit} offset ${limit * (page - 1)}`
    )
    return result
  }

  async getTechnologiesByProjectId(projectId: string) {
    const technologies = await databaseService.query(
      `SELECT t.* FROM ${DatabaseTable.Technology} t
       JOIN ${DatabaseTable.Project_Technology} pt ON t.techID = pt.techID
       WHERE pt.projectID = ?`,
      [projectId]
    )
    return technologies
  }
}

const technologyServices = new TechnologyServices()
export default technologyServices
