import Project from '~/models/schemas/Project.schema'
import databaseService from './database.services'
import { DatabaseTable } from '~/constants/databaseTable'
import { handleSpreadObjectToArray } from '~/utils/spreadObjectToArray'
import { OkPacket } from 'mysql2'
import { submitProjectBody } from '~/models/Request/Project.request'
import { TokenRole } from '~/constants/enums'
import User from '~/models/schemas/User.schema'
class ProjectServices {
  async getProjectDetail(id: number) {
    const [technologies, collaborators, projects] = await Promise.all([
      databaseService.query<{ techID: string; techName: string }[]>(
        `SELECT * FROM ${DatabaseTable.Technology} t WHERE t.techID IN (SELECT pt.techID FROM ${DatabaseTable.Project_Technology} pt WHERE pt.projectID IN (SELECT p.projectID FROM ${DatabaseTable.Project} p  WHERE p.projectID = ?))`,
        [id]
      ),
      databaseService.query<User>(
        `SELECT u.userID,u.email FROM ${DatabaseTable.User} u WHERE u.userID IN (SELECT up.userID FROM ${DatabaseTable.User_Own_Project} up WHERE up.projectID IN (SELECT p.projectID FROM ${DatabaseTable.Project} p where p.projectID = ?)) `,
        [id]
      ),
      await databaseService.query<Project[]>(`select * from ${DatabaseTable.Project} where projectID = ? `, [id])
    ])
    const [project] = projects
    return {
      project,
      collaborators,
      technologies
    }
  }
  async createProject(body: submitProjectBody, user_id: string, roles: string[]) {
    const { technologies, collaborators, type, mentorID, ...project } = body
    const { projectID, ...rest } = new Project(project)

    const role = roles.some((item) => item === TokenRole.Mentor) ? TokenRole.Reviewer : TokenRole.Mentor

    const userIdReviewProject = roles.some((item) => item === TokenRole.Mentor) ? 0 : mentorID
    const result = await databaseService.query<OkPacket>(
      `Insert into ${DatabaseTable.Project}(
    projectName,
    slug,
    funcRequirements,
    nonFuncRequirements,
    context,
    actors,
    problems,
    status)  values (?,?,?,?,?,?,?,?)`,
      handleSpreadObjectToArray(rest)
    )
    if (collaborators && collaborators.length > 0) {
      if (technologies && technologies.length > 0) {
        const userOwnProjectPromises = collaborators.map((item) =>
          databaseService.query<{ userID: string; projectID: string }>(
            `Insert into ${DatabaseTable.User_Own_Project}(userID,projectID,type) VALUES (?,?,?)`,
            [item, result.insertId, type]
          )
        )
        const projectTechnology = technologies.map((item) =>
          databaseService.query(`insert into ${DatabaseTable.Project_Technology}(projectID,techID) VALUES (?,?)`, [
            result.insertId,
            item
          ])
        )
        await Promise.all([
          userOwnProjectPromises,
          databaseService.query(
            `insert into ${DatabaseTable.User_Review_Project}(userID,projectID,type) values(?,?,?)`,
            [userIdReviewProject, result.insertId, role]
          ),
          projectTechnology
        ])
      } else {
        const userOwnProjectPromises = collaborators.map((item) =>
          databaseService.query<{ userID: string; projectID: string }>(
            `Insert into ${DatabaseTable.User_Own_Project}(userID,projectID,type) VALUES (?,?,?)`,
            [item, result.insertId, type]
          )
        )
        await Promise.all([
          userOwnProjectPromises,
          databaseService.query(
            `insert into ${DatabaseTable.User_Review_Project}(userID,projectID,type) values(?,?,?)`,
            [userIdReviewProject, result.insertId, role]
          )
        ])
      }
    } else {
      if (technologies && technologies.length > 0) {
        const projectTechnology = technologies.map((item) =>
          databaseService.query(`insert into ${DatabaseTable.Project_Technology}(projectID,techID) VALUES (?,?)`, [
            result.insertId,
            item
          ])
        )

        await Promise.all([
          databaseService.query<{ userID: string; projectID: string }>(
            `Insert into ${DatabaseTable.User_Own_Project}(userID,projectID,type) VALUES (?,?,?)`,
            [user_id, result.insertId, type]
          ),
          databaseService.query(
            `insert into ${DatabaseTable.User_Review_Project}(userID,projectID,type) values(?,?,?)`,
            [userIdReviewProject, result.insertId, role]
          ),
          projectTechnology
        ])
      } else {
        await Promise.all([
          databaseService.query<{ userID: string; projectID: string }>(
            `Insert into ${DatabaseTable.User_Own_Project}(userID,projectID,type) VALUES (?,?,?)`,
            [user_id, result.insertId, type]
          ),

          databaseService.query(
            `insert into ${DatabaseTable.User_Review_Project}(userID,projectID,type) values(?,?,?)`,
            [userIdReviewProject, result.insertId, role]
          )
        ])
      }
    }
    const submitProjectData = await this.getProjectDetail(result.insertId)
    return submitProjectData
  }
  async getProject(type: string, limit: number, page: number) {
    if (type === 'all') {
      const result = await databaseService.query(
        `select * from ${DatabaseTable.User_Review_Project} ur join ${DatabaseTable.Project} p on ur.projectID = p.projectID limit ${limit} offset ${limit * (page - 1)}`
      )
      return result
    }
    return await databaseService.query(
      `select * from ${DatabaseTable.User_Review_Project} ur join ${DatabaseTable.Project} p on ur.projectID = p.projectID where type =?`,
      ['Reviewer']
    )
  }
}
const projectServices = new ProjectServices()
export default projectServices
