import Project from '~/models/schemas/Project.schema'
import databaseService from './database.services'
import { DatabaseTable } from '~/constants/databaseTable'
import { handleSpreadObjectToArray } from '~/utils/spreadObjectToArray'
import { OkPacket } from 'mysql2'
import { submitProjectBody } from '~/models/Request/Project.request'
import { TokenRole } from '~/constants/enums'
import User from '~/models/schemas/User.schema'
import Post from '~/models/schemas/Post.schema'
import { Sprint } from '~/models/schemas/Sprint.schema'

class ProjectServices {
  async getProjectDetail(id: number) {
    const [project, attachments] = await Promise.all([
      databaseService.query<Project[]>(`SELECT * FROM ${DatabaseTable.Project} WHERE projectID = ?`, [id]),
      databaseService.query<{ attachmentID: string, attachmentURL: string }[]>(
        `SELECT attachmentID, attachmentURL FROM ${DatabaseTable.Attachment} WHERE projectID = ?`,
        [id]
      )
    ])
    return { project: project[0], attachments }
  }

  async getProjectTechnologies(id: number) {
    return databaseService.query<{ techID: string, techName: string }[]>(
      `SELECT t.techID, t.techName FROM ${DatabaseTable.Technology} t
       JOIN ${DatabaseTable.Project_Technology} pt ON t.techID = pt.techID
       WHERE pt.projectID = ?`,
      [id]
    )
  }

  async getProjectPost(id: number) {
    return databaseService.query<Post[]>(
      `SELECT * FROM ${DatabaseTable.Post} WHERE projectID = ?`,
      [id]
    )
  }

  async getProjectOwn(id: number) {
    return databaseService.query<{ userID: string, email: string, avatarUrl: string, username: string, firstName: string, lastName: string }[]>(
      `SELECT u.userID, u.email, u.avatarUrl, u.username, u.firstName, u.lastName
       FROM ${DatabaseTable.User} u
       JOIN ${DatabaseTable.User_Own_Project} uop ON u.userID = uop.userID
       WHERE uop.projectID = ?`,
      [id]
    )
  }

  async getProjectReview(id: number) {
    return databaseService.query<{ userID: string, email: string, avatarUrl: string, username: string, firstName: string, lastName: string }[]>(
      `SELECT u.userID, u.email, u.avatarUrl, u.username, u.firstName, u.lastName
       FROM ${DatabaseTable.User} u
       JOIN ${DatabaseTable.User_Review_Project} urp ON u.userID = urp.userID
       WHERE urp.projectID = ?`,
      [id]
    )
  }

  async getProjectGuide(id: number) {
    return databaseService.query<{ userID: string, email: string, avatarUrl: string, username: string, firstName: string, lastName: string }[]>(
      `SELECT u.userID, u.email, u.avatarUrl, u.username, u.firstName, u.lastName
       FROM ${DatabaseTable.User} u
       JOIN ${DatabaseTable.User_Guide} ug ON u.userID = ug.userID
       WHERE ug.projectID = ?`,
      [id]
    )
  }

  async getProjectSprint(id: number) {
    return databaseService.query<Sprint[]>(
      `SELECT * FROM ${DatabaseTable.Sprint} WHERE projectID = ?`,
      [id]
    )
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
        const userReviewProjectPromise = Array.isArray(userIdReviewProject) ? mentorID.map((item) => databaseService.query(
          `insert into ${DatabaseTable.User_Review_Project}(userID,projectID,type) values(?,?,?)`,
          [item, result.insertId, role]
        )) : databaseService.query(
          `insert into ${DatabaseTable.User_Review_Project}(userID,projectID,type) values(?,?,?)`,
          [userIdReviewProject, result.insertId, role]
        )
        await Promise.all([
          userOwnProjectPromises,
          userReviewProjectPromise
          ,
          projectTechnology
        ])
      } else {
        const userOwnProjectPromises = collaborators.map((item) =>
          databaseService.query<{ userID: string; projectID: string }>(
            `Insert into ${DatabaseTable.User_Own_Project}(userID,projectID,type) VALUES (?,?,?)`,
            [item, result.insertId, type]
          )
        )
        const userReviewProjectPromise = Array.isArray(userIdReviewProject) ? mentorID.map((item) => databaseService.query(
          `insert into ${DatabaseTable.User_Review_Project}(userID,projectID,type) values(?,?,?)`,
          [item, result.insertId, role]
        )) : databaseService.query(
          `insert into ${DatabaseTable.User_Review_Project}(userID,projectID,type) values(?,?,?)`,
          [userIdReviewProject, result.insertId, role]
        )
        await Promise.all([
          userOwnProjectPromises,
          userReviewProjectPromise
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
        const userReviewProjectPromise = Array.isArray(userIdReviewProject) ? mentorID.map((item) => databaseService.query(
          `insert into ${DatabaseTable.User_Review_Project}(userID,projectID,type) values(?,?,?)`,
          [item, result.insertId, role]
        )) : databaseService.query(
          `insert into ${DatabaseTable.User_Review_Project}(userID,projectID,type) values(?,?,?)`,
          [userIdReviewProject, result.insertId, role]
        )
        await Promise.all([
          databaseService.query<{ userID: string; projectID: string }>(
            `Insert into ${DatabaseTable.User_Own_Project}(userID,projectID,type) VALUES (?,?,?)`,
            [user_id, result.insertId, type]
          ),
          userReviewProjectPromise,
          projectTechnology
        ])
      } else {
        const userReviewProjectPromise = Array.isArray(userIdReviewProject) ? mentorID.map((item) => databaseService.query(
          `insert into ${DatabaseTable.User_Review_Project}(userID,projectID,type) values(?,?,?)`,
          [item, result.insertId, role]
        )) : databaseService.query(
          `insert into ${DatabaseTable.User_Review_Project}(userID,projectID,type) values(?,?,?)`,
          [userIdReviewProject, result.insertId, role]
        )
        await Promise.all([
          databaseService.query<{ userID: string; projectID: string }>(
            `Insert into ${DatabaseTable.User_Own_Project}(userID,projectID,type) VALUES (?,?,?)`,
            [user_id, result.insertId, type]
          ),

          userReviewProjectPromise
        ])
      }
    }
    const submitProjectData = await this.getProjectDetail(result.insertId)
    return submitProjectData
  }

  async getProject(type: string, limit: number, page: number, userID: string) {
    if (type === 'all') {
      const result = await databaseService.query(
        `select * from ${DatabaseTable.User_Review_Project} ur join ${DatabaseTable.Project} p on ur.projectID = p.projectID limit ${limit} offset ${limit * (page - 1)}`
      )
      return result
    } else if (type === "get-submit") {
      const result = await databaseService.query(
        `select * from ${DatabaseTable.User_Own_Project} uo join ${DatabaseTable.Project} p on uo.projectID = p.projectID  where uo.userID=? limit ${limit} offset ${limit * (page - 1)}`, [userID]
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
