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
import { Attachment } from '~/models/schemas/Attachment.schema'
import internal from 'stream'
import { log } from 'console'
import { query } from 'express'

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

  async getProjectPost(id: number) {
    return databaseService.query<Post[]>(`SELECT * FROM ${DatabaseTable.Post} WHERE projectID = ?`, [id])
  }

  async getProjectOwn(id: number) {
    return databaseService.query<
      { userID: string; email: string; avatarUrl: string; username: string; firstName: string; lastName: string }[]
    >(
      `SELECT u.userID, u.email, u.avatarUrl, u.username, u.firstName, u.lastName
       FROM ${DatabaseTable.User} u
       JOIN ${DatabaseTable.User_Own_Project} uop ON u.userID = uop.userID
       WHERE uop.projectID = ?`,
      [id]
    )
  }

  async getProjectReview(id: number) {
    return databaseService.query<
      { userID: string; email: string; avatarUrl: string; username: string; firstName: string; lastName: string }[]
    >(
      `SELECT u.userID, u.email, u.avatarUrl, u.username, u.firstName, u.lastName
       FROM ${DatabaseTable.User} u
       JOIN ${DatabaseTable.User_Review_Project} urp ON u.userID = urp.userID
       WHERE urp.projectID = ?`,
      [id]
    )
  }

  async getProjectGuide(id: number) {
    return databaseService.query<
      { userID: string; email: string; avatarUrl: string; username: string; firstName: string; lastName: string }[]
    >(
      `SELECT u.userID, u.email, u.avatarUrl, u.username, u.firstName, u.lastName
       FROM ${DatabaseTable.User} u
       JOIN ${DatabaseTable.User_Guide} ug ON u.userID = ug.userID
       WHERE ug.projectID = ?`,
      [id]
    )
  }

  async getProjectSprint(id: number) {
    return databaseService.query<Sprint[]>(`SELECT * FROM ${DatabaseTable.Sprint} WHERE projectID = ?`, [id])
  }

  async createProject(body: submitProjectBody, user_id: string, roles: string[]) {
    const { technologies, collaborators, type, mentorID, attachments, ...project } = body
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
    const [submitProjectData] = await Promise.all([
      this.getProjectDetail(result.insertId),
      attachments.map((item) =>
        databaseService.query(`Insert into ${DatabaseTable.Attachment}(url,type,projectID) VALUES (?,?,?)`, [
          item.attachment,
          item.type,
          result.insertId
        ])
      )
    ])
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
      const result = await databaseService.query<
        (Project & {
          collaboratorsEmail: string
          collaboratorsAvatarUrl: string
          collaboratorsUserID: string
          techNames: string
        })[]
      >(
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
        GROUP_CONCAT(DISTINCT t.techName SEPARATOR ', ') AS techNames
FROM 
    ${DatabaseTable.User_Own_Project} uo
JOIN 
    ${DatabaseTable.Project} p ON uo.projectID = p.projectID
JOIN 
    ${DatabaseTable.Project_Technology} pt ON p.projectID = pt.projectID
JOIN 
    ${DatabaseTable.Technology} t ON pt.techID = t.techID
WHERE 
    uo.userID = ?
          GROUP BY 
 p.projectID
LIMIT 
    ${limit}
OFFSET 
    ${limit * (page - 1)}`,
        [userID]
      )

      const collaboratorsPromise = result.map((item) =>
        databaseService.query(
          `select u.email,u.avatarUrl,u.userID FROM ${DatabaseTable.User} u JOIN ${DatabaseTable.User_Own_Project} p on p.userID = u.userID WHERE projectID =? `,
          [item.projectID]
        )
      )
      const collaborators = await Promise.all(collaboratorsPromise)

      const processedResult = result.map((project, index) => {
        return {
          ...project,
          collaborators: collaborators[index]
        }
      })

      return processedResult
    } else if (type === 'get-review-mentor') {
      const result = await databaseService.query<
        (Project & {
          collaboratorsEmail: string
          collaboratorsAvatarUrl: string
          collaboratorsUserID: string
          techNames: string
        })[]
      >(
        `SELECT 
    up.userID,
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
    up.type as typeReview,
    up.status,
    GROUP_CONCAT(DISTINCT t.techName SEPARATOR ', ') AS techNames,
   GROUP_CONCAT (DISTINCT u.email SEPARATOR ', ') AS collaboratorsEmail,
    GROUP_CONCAT (DISTINCT u.userID SEPARATOR ', ') AS collaboratorsUserID,
     GROUP_CONCAT (DISTINCT u.avatarUrl SEPARATOR ', ') AS collaboratorsAvatarUrl
FROM 
    ${DatabaseTable.User_Own_Project} uo
JOIN 
    ${DatabaseTable.Project} p ON uo.projectID = p.projectID
JOIN 
    ${DatabaseTable.Project_Technology} pt ON p.projectID = pt.projectID
JOIN 
    ${DatabaseTable.Technology} t ON pt.techID = t.techID
JOIN ${DatabaseTable.User} u on u.userID = uo.userID JOIN ${DatabaseTable.User_Review_Project} up on p.projectID = up.projectID
WHERE 
    up.userID = ? and up.type = "Mentor"
GROUP BY 
 p.projectID
LIMIT 
    ${limit}
OFFSET 
    ${limit * (page - 1)}`,
        [userID]
      )

      const processResult = result.map((project) => {
        const collaboratorsEmail = project.collaboratorsEmail ? project.collaboratorsEmail.split(', ') : []
        const collaboratorsAvatarUrl = project.collaboratorsAvatarUrl ? project.collaboratorsAvatarUrl.split(', ') : []
        const collaboratorsUserID = project.collaboratorsUserID ? project.collaboratorsUserID.split(', ') : []
        const newObject = collaboratorsEmail.map((item, index) => {
          return {
            collaboratorsEmail: collaboratorsEmail[index],
            collaboratorsAvatarUrl: collaboratorsAvatarUrl[index] ?? '',
            collaboratorsUserID: collaboratorsUserID[index]
          }
        })
        const { collaboratorsAvatarUrl: _, collaboratorsEmail: __, collaboratorsUserID: ___, ...rest } = project
        return {
          ...rest,
          collaborators: newObject
        }
      })
      return processResult
    } else if (type === 'get-review-reviewer') {
      console.log("vc");

      const result = await databaseService.query<
        (Project & {
          collaboratorsEmail: string
          collaboratorsAvatarUrl: string
          collaboratorsUserID: string
          techNames: string
        })[]
      >(
        `SELECT 
    up.userID,
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
    up.type as typeReview,
    up.status,
    GROUP_CONCAT(DISTINCT t.techName SEPARATOR ', ') AS techNames,
   GROUP_CONCAT (DISTINCT u.email SEPARATOR ', ') AS collaboratorsEmail,
    GROUP_CONCAT (DISTINCT u.userID SEPARATOR ', ') AS collaboratorsUserID,
     GROUP_CONCAT (DISTINCT u.avatarUrl SEPARATOR ', ') AS collaboratorsAvatarUrl
FROM 
    ${DatabaseTable.User_Own_Project} uo
JOIN 
    ${DatabaseTable.Project} p ON uo.projectID = p.projectID
JOIN 
    ${DatabaseTable.Project_Technology} pt ON p.projectID = pt.projectID
JOIN 
    ${DatabaseTable.Technology} t ON pt.techID = t.techID
JOIN ${DatabaseTable.User} u on u.userID = uo.userID JOIN ${DatabaseTable.User_Review_Project} up on p.projectID = up.projectID
WHERE 
    up.userID = ? and up.type = "Reviewer"
GROUP BY 
 p.projectID
LIMIT 
    ${limit}
OFFSET 
    ${limit * (page - 1)}`,
        [userID]
      )

      const processResult = result.map((project) => {
        const collaboratorsEmail = project.collaboratorsEmail ? project.collaboratorsEmail.split(', ') : []
        const collaboratorsAvatarUrl = project.collaboratorsAvatarUrl ? project.collaboratorsAvatarUrl.split(', ') : []
        const collaboratorsUserID = project.collaboratorsUserID ? project.collaboratorsUserID.split(', ') : []
        const newObject = collaboratorsEmail.map((item, index) => {
          return {
            collaboratorsEmail: collaboratorsEmail[index],
            collaboratorsAvatarUrl: collaboratorsAvatarUrl[index] ?? '',
            collaboratorsUserID: collaboratorsUserID[index]
          }
        })
        const { collaboratorsAvatarUrl: _, collaboratorsEmail: __, collaboratorsUserID: ___, ...rest } = project
        return {
          ...rest,
          collaborators: newObject
        }
      })
      return processResult
    }
    return []
  }

  async getProjectBySlug(slug: string) {
    const [project] = await databaseService.query<Project[]>(
      `SELECT projectID FROM ${DatabaseTable.Project} WHERE slug = ?`,
      [slug]
    )
    if (!project) {
      throw new Error('Project not found')
    }
    return project
  }

  async getProjectAttachments(projectID: number) {
    const attachments = await databaseService.query<Attachment[]>(
      `SELECT * FROM ${DatabaseTable.Attachment} WHERE projectID = ?`,
      [projectID]
    )
    return attachments
  }

  async getProjectDetailBySlug(slug: string) {
    const [project] = await databaseService.query<Project[]>(`SELECT * FROM ${DatabaseTable.Project} WHERE slug = ?`, [
      slug
    ])
    if (!project) {
      throw new Error('Project not found')
    }
    return project
  }

  async getProjectTechnologiesWithChildren(slug: string) {
    // Lấy project ID từ slug
    const [project] = await databaseService.query<{ projectID: number }[]>(
      `SELECT projectID FROM ${DatabaseTable.Project} WHERE slug = ?`,
      [slug]
    );

    if (!project) {
      return [];
    }

    // Đầu tiên lấy tất cả technologies của project
    const projectTechs = await databaseService.query<{ techID: number }[]>(
      `SELECT techID FROM ${DatabaseTable.Project_Technology} WHERE projectID = ?`,
      [project.projectID]
    );

    const techIDs = projectTechs.map(tech => tech.techID);
    
    if (techIDs.length === 0) {
      return [];
    }

    // Sau đó lấy thông tin đầy đủ của các technologies và parents của chúng
    const technologies = await databaseService.query<{ techID: number, techName: string, parentID: number | null }[]>(
      `SELECT t.* 
       FROM ${DatabaseTable.Technology} t 
       WHERE t.techID IN (?) 
       OR t.techID IN (
         SELECT parentID 
         FROM ${DatabaseTable.Technology} 
         WHERE techID IN (?) 
         AND parentID IS NOT NULL
       )
       ORDER BY CASE WHEN t.parentID IS NULL THEN 0 ELSE 1 END, t.techID`,
      [techIDs, techIDs]
    );

    // Tạo cấu trúc phân cấp
    const techMap = new Map();
    const rootTechs:any = [];

    // Đầu tiên, tạo map của tất cả technologies
    technologies.forEach(tech => {
      techMap.set(tech.techID, {
        techID: tech.techID.toString(),
        techName: tech.techName,
        children: []
      });
    });

    // Sau đó, xây dựng cấu trúc cây
    technologies.forEach(tech => {
      if (tech.parentID === null) {
        rootTechs.push(techMap.get(tech.techID));
      } else {
        const parent = techMap.get(tech.parentID);
        if (parent) {
          // Chỉ thêm techID và techName cho children
          parent.children.push({
            techID: tech.techID.toString(),
            techName: tech.techName
          });
        }
      }
    });

    return rootTechs;
  }
}

export default new ProjectServices()
