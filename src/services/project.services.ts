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
        const userReviewProjectPromise = Array.isArray(userIdReviewProject)
          ? mentorID.map((item) =>
            databaseService.query(
              `insert into ${DatabaseTable.User_Review_Project}(userID,projectID,type) values(?,?,?)`,
              [item, result.insertId, role]
            )
          )
          : databaseService.query(
            `insert into ${DatabaseTable.User_Review_Project}(userID,projectID,type) values(?,?,?)`,
            [userIdReviewProject, result.insertId, role]
          )
        await Promise.all([userOwnProjectPromises, userReviewProjectPromise, projectTechnology])
      } else {
        const userOwnProjectPromises = collaborators.map((item) =>
          databaseService.query<{ userID: string; projectID: string }>(
            `Insert into ${DatabaseTable.User_Own_Project}(userID,projectID,type) VALUES (?,?,?)`,
            [item, result.insertId, type]
          )
        )
        const userReviewProjectPromise = Array.isArray(userIdReviewProject)
          ? mentorID.map((item) =>
            databaseService.query(
              `insert into ${DatabaseTable.User_Review_Project}(userID,projectID,type) values(?,?,?)`,
              [item, result.insertId, role]
            )
          )
          : databaseService.query(
            `insert into ${DatabaseTable.User_Review_Project}(userID,projectID,type) values(?,?,?)`,
            [userIdReviewProject, result.insertId, role]
          )
        await Promise.all([userOwnProjectPromises, userReviewProjectPromise])
      }
    } else {
      if (technologies && technologies.length > 0) {
        const projectTechnology = technologies.map((item) =>
          databaseService.query(`insert into ${DatabaseTable.Project_Technology}(projectID,techID) VALUES (?,?)`, [
            result.insertId,
            item
          ])
        )
        const userReviewProjectPromise = Array.isArray(userIdReviewProject)
          ? mentorID.map((item) =>
            databaseService.query(
              `insert into ${DatabaseTable.User_Review_Project}(userID,projectID,type) values(?,?,?)`,
              [item, result.insertId, role]
            )
          )
          : databaseService.query(
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
        const userReviewProjectPromise = Array.isArray(userIdReviewProject)
          ? mentorID.map((item) =>
            databaseService.query(
              `insert into ${DatabaseTable.User_Review_Project}(userID,projectID,type) values(?,?,?)`,
              [item, result.insertId, role]
            )
          )
          : databaseService.query(
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
        `SELECT 
    uo.userID,
    p.projectID,
    uo.type,
    p.projectName,
    p.slug,
    p.funcRequirements,
    p.nonFuncRequirements,
    p.context,
    p.actors,
    p.problems,
    p.status,
    p.createdAt,
    p.updatedAt,
    p.deletedAt,
    GROUP_CONCAT(DISTINCT t.techName SEPARATOR ', ') AS techNames,
   GROUP_CONCAT (DISTINCT u.email SEPARATOR ', ') AS reviewer
FROM 
    ${DatabaseTable.User_Own_Project} uo
JOIN 
    ${DatabaseTable.Project} p ON uo.projectID = p.projectID
JOIN 
    ${DatabaseTable.Project_Technology} pt ON p.projectID = pt.projectID
JOIN 
    ${DatabaseTable.Technology} t ON pt.techID = t.techID
JOIN ${DatabaseTable.User_Review_Project} ur on ur.projectID = p.projectID 
JOIN ${DatabaseTable.User} u on u.userID =ur.userID 
GROUP BY 
    uo.userID, p.projectID
LIMIT 
    ${limit}
OFFSET 
    ${limit * (page - 1)}`
      )
      return result
    } else if (type === 'get-submit') {
      const result = await databaseService.query<(Project & { reviewer: string; techNames: string })[]>(
        `SELECT 
    uo.userID,
    p.projectID,
    uo.type,
    p.projectName,
    p.slug,
    p.funcRequirements,
    p.nonFuncRequirements,
    p.context,
    p.actors,
    p.problems,
    p.status,
    p.createdAt,
    p.updatedAt,
    p.deletedAt,
    GROUP_CONCAT(DISTINCT t.techName SEPARATOR ', ') AS techNames,
   GROUP_CONCAT (DISTINCT u.email SEPARATOR ', ') AS reviewer
FROM 
    ${DatabaseTable.User_Own_Project} uo
JOIN 
    ${DatabaseTable.Project} p ON uo.projectID = p.projectID
JOIN 
    ${DatabaseTable.Project_Technology} pt ON p.projectID = pt.projectID
JOIN 
    ${DatabaseTable.Technology} t ON pt.techID = t.techID
JOIN ${DatabaseTable.User_Review_Project} ur on ur.projectID = p.projectID 
JOIN ${DatabaseTable.User} u on u.userID =ur.userID 
WHERE 
    uo.userID = ?
GROUP BY 
    uo.userID, p.projectID
LIMIT 
    ${limit}
OFFSET 
    ${limit * (page - 1)}`,
        [userID]
      )
      console.log(result)
      const processedResult = result.map((item) => ({
        ...item,
        techNames: item.techNames ? item.techNames.split(', ') : [],
        reviewer: item.reviewer ? item.reviewer.split(', ') : []
      }))

      return processedResult
    }
    return await databaseService.query(
      `select * from ${DatabaseTable.User_Review_Project} ur join ${DatabaseTable.Project} p on ur.projectID = p.projectID where type =?`,
      ['Reviewer']
    )
  }
}
const projectServices = new ProjectServices()
export default projectServices
