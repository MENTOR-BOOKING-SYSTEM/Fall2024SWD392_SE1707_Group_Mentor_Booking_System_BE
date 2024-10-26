import Project, { UserReviewProject } from '~/models/schemas/Project.schema'
import databaseService from './database.services'
import { DatabaseTable } from '~/constants/databaseTable'
import { handleSpreadObjectToArray } from '~/utils/spreadObjectToArray'
import { OkPacket } from 'mysql2'
import { submitProjectBody } from '~/models/Request/Project.request'
import { PROJECT_STATUS, REVIEW_STATUS, TokenRole } from '~/constants/enums'
import User from '~/models/schemas/User.schema'
import { ApprovalCriteria } from '~/models/schemas/Criteria.schema'
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
      const result = await databaseService.query<(Project & { collaborators: string; techNames: string })[]>(
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
   GROUP_CONCAT (DISTINCT u.email SEPARATOR ', ') AS collaborators
FROM 
    ${DatabaseTable.User_Own_Project} uo
JOIN 
    ${DatabaseTable.Project} p ON uo.projectID = p.projectID
JOIN 
    ${DatabaseTable.Project_Technology} pt ON p.projectID = pt.projectID
JOIN 
    ${DatabaseTable.Technology} t ON pt.techID = t.techID
JOIN ${DatabaseTable.User} u on u.userID =uo.userID 
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
      const processedResult = result.map((item) => ({
        ...item,
        techNames: item.techNames ? item.techNames.split(', ') : [],
        collaborators: item.collaborators ? item.collaborators.split(', ') : []
      }))

      return processedResult
    } else if (type === 'get-review') {
      const result = await databaseService.query<(Project & { collaborators: string; techNames: string })[]>(
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
    GROUP_CONCAT(DISTINCT t.techName SEPARATOR ', ') AS techNames,
   GROUP_CONCAT (DISTINCT u.email SEPARATOR ', ') AS collaborators
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
    up.userID = ? 
GROUP BY 
 p.projectID
LIMIT 
    ${limit}
OFFSET 
    ${limit * (page - 1)}`,
        [userID]
      )
      return result
    }
    return await databaseService.query(
      `select * from ${DatabaseTable.User_Review_Project} ur join ${DatabaseTable.Project} p on ur.projectID = p.projectID where type =?`,
      ['Reviewer']
    )
  }

  async assignCriteriasForProject(
    projectID: number | undefined,
    inputCid: number[],
    type: string,
    isReplace: boolean = false,
    semesterID: string | null | undefined
  ) {
    const criterias = await databaseService.query<ApprovalCriteria[]>(
      `SELECT criteriaID FROM ${DatabaseTable.Project_Criteria} WHERE projectID = ?`,
      [projectID]
    )

    const criteriaIDs = criterias.map((criteria) => criteria.criteriaID)

    const filteredCriteriaIDs = inputCid.filter((criteriaID) => !criteriaIDs.includes(criteriaID))

    if (isReplace) {
      if (type === REVIEW_STATUS.ACCEPTED) {
        await databaseService.query(`DELETE FROM ${DatabaseTable.Project_Criteria} WHERE projectID = ?`, [projectID])
        const semesterCriterias = await databaseService.query<ApprovalCriteria[]>(
          `SELECT sc.criteriaID FROM ${DatabaseTable.Semester_Criteria} AS sc 
          JOIN ${DatabaseTable.Approval_Criteria} AS ac ON sc.criteriaID = ac.criteriaID 
          WHERE sc.semesterID = ? AND ac.type = 2`,
          [semesterID]
        )
        const semesterCriteriaIDs = semesterCriterias.map((criteria) => criteria.criteriaID)
        const filteredCriteriaIDs = inputCid.filter((criteriaID) => !semesterCriteriaIDs.includes(criteriaID))

        const values = [...filteredCriteriaIDs, ...semesterCriteriaIDs]
          .map((criteriaID) => `(${projectID}, ${criteriaID}, '${type}')`)
          .join(', ')
        await databaseService.query(
          `INSERT INTO ${DatabaseTable.Project_Criteria} (projectID, criteriaID, type) VALUES ${values}`
        )

        return
      } else if (type === REVIEW_STATUS.REJECTED) {
        await databaseService.query(`DELETE FROM ${DatabaseTable.Project_Criteria} WHERE projectID = ? AND type <> ?`, [
          projectID,
          REVIEW_STATUS.REJECTED
        ])
      } else if (type === REVIEW_STATUS.CONSIDERED) {
        await databaseService.query(`DELETE FROM ${DatabaseTable.Project_Criteria} WHERE projectID = ? AND type = ?`, [
          projectID,
          REVIEW_STATUS.CONSIDERED
        ])
      }
    }

    if (filteredCriteriaIDs.length) {
      const values = filteredCriteriaIDs.map((criteriaID) => `(${projectID}, ${criteriaID}, '${type}')`).join(', ')
      await databaseService.query(`
        INSERT INTO ${DatabaseTable.Project_Criteria} (projectID, criteriaID, type)
        VALUES ${values}
      `)
    }
  }

  async assignReviewersForProject(
    semesterID: string | null | undefined,
    userID: string,
    projectID: number | undefined
  ) {
    const reviewers = await databaseService.query<User[]>(
      `
      SELECT u.userID, COUNT(urp.projectID) AS ProjectCount FROM ${DatabaseTable.User} AS u
      JOIN ${DatabaseTable.User_Role} AS ur
      ON u.userID = ur.userID
      JOIN ${DatabaseTable.Role} AS r
      ON ur.roleID = r.roleID
      LEFT JOIN ${DatabaseTable.User_Review_Project} AS urp
      ON u.userID = urp.userID
      AND urp.type = '${TokenRole.Reviewer}'
      WHERE ur.semesterID = ?
      AND r.roleID = 5
      AND u.userID <> ?
      GROUP BY u.userID
      ORDER BY ProjectCount ASC
      LIMIT 3
      `,
      [semesterID, userID]
    )

    if (reviewers.length === 0) {
      throw new Error('No reviewer found')
    }

    await databaseService.query(`
      INSERT INTO ${DatabaseTable.User_Review_Project} (userID, projectID, type)
      VALUES ${reviewers.map((reviewer) => `(${reviewer.userID}, ${projectID}, '${TokenRole.Reviewer}')`).join(', ')}
    `)
  }

  async updateProjectStatus(projectID: number | undefined, status: number) {
    await databaseService.query(`UPDATE ${DatabaseTable.Project} SET status = ? WHERE projectID = ?`, [
      status,
      projectID
    ])
  }

  async updateReviewStatus(projectID: number | undefined, userID: string, status: string) {
    await databaseService.query(
      `UPDATE ${DatabaseTable.User_Review_Project} SET status = ? WHERE projectID = ? AND userID = ?`,
      [status, projectID, userID]
    )
  }

  async handleSingleMentorReview(
    type: 'Accept' | 'Reject' | 'Consider',
    projectID: number | undefined,
    semesterID: string | null | undefined,
    userID: string
  ) {
    switch (type) {
      case 'Accept':
        await Promise.all([
          this.updateProjectStatus(projectID, PROJECT_STATUS.MENTOR_ACCEPTED),
          this.updateReviewStatus(projectID, userID, REVIEW_STATUS.ACCEPTED),
          this.assignReviewersForProject(semesterID, userID, projectID)
        ])
        break
      case 'Reject':
        this.updateProjectStatus(projectID, PROJECT_STATUS.MENTOR_REJECTED)
        this.updateReviewStatus(projectID, userID, REVIEW_STATUS.REJECTED)
        break
      default:
        throw new Error('Invalid type')
    }
  }

  async handleMultipleMentorReviews(
    type: 'Accept' | 'Reject' | 'Consider',
    reviewTypes: UserReviewProject[],
    projectID: number | undefined,
    semesterID: string | null | undefined,
    userID: string
  ) {
    if (reviewTypes.every((rt) => rt.status === REVIEW_STATUS.PENDING)) {
      const otherMentorID = reviewTypes.filter((rt) => String(rt.userID) !== String(userID))
      switch (type) {
        case 'Accept':
          await Promise.all([
            this.updateProjectStatus(projectID, PROJECT_STATUS.MENTOR_ACCEPTED),
            this.updateReviewStatus(projectID, userID, REVIEW_STATUS.ACCEPTED),
            this.updateReviewStatus(projectID, String(otherMentorID[0].userID), REVIEW_STATUS.WITHDRAWN),
            this.assignReviewersForProject(semesterID, userID, projectID)
          ])
          break
        case 'Reject':
          this.updateReviewStatus(projectID, userID, REVIEW_STATUS.REJECTED)
          break
        default:
          throw new Error('Invalid type')
      }
    } else if (reviewTypes.some((rt) => rt.status === REVIEW_STATUS.REJECTED)) {
      const rejectedMentor = reviewTypes.filter((rt) => rt.status === REVIEW_STATUS.REJECTED)
      if (String(rejectedMentor[0].userID) === String(userID)) {
        throw new Error('You have already rejected this project')
      }
      switch (type) {
        case 'Accept':
          await Promise.all([
            this.updateProjectStatus(projectID, PROJECT_STATUS.MENTOR_ACCEPTED),
            this.updateReviewStatus(projectID, userID, REVIEW_STATUS.ACCEPTED),
            this.assignReviewersForProject(semesterID, userID, projectID)
          ])
          break
        case 'Reject':
          this.updateReviewStatus(projectID, userID, REVIEW_STATUS.REJECTED)
          this.updateProjectStatus(projectID, PROJECT_STATUS.MENTOR_REJECTED)
          break
        default:
          throw new Error('Invalid type')
      }
    }
  }

  async handleMultipleReviewerReviews(
    type: 'Accept' | 'Reject' | 'Consider',
    reviewTypes: UserReviewProject[],
    projectID: number | undefined,
    userID: string,
    criteriaID: number[],
    semesterID: string | null | undefined
  ) {
    const fitleredReviewTypes = reviewTypes.filter((rt) => rt.type !== TokenRole.Mentor)
    if (fitleredReviewTypes.every((rt) => rt.status === REVIEW_STATUS.PENDING)) {
      switch (type) {
        case 'Accept':
          this.updateReviewStatus(projectID, userID, REVIEW_STATUS.ACCEPTED)
          this.assignCriteriasForProject(projectID, criteriaID, REVIEW_STATUS.ACCEPTED, false, semesterID)
          break
        case 'Consider':
          this.updateReviewStatus(projectID, userID, REVIEW_STATUS.CONSIDERED)
          this.assignCriteriasForProject(projectID, criteriaID, REVIEW_STATUS.CONSIDERED, false, semesterID)
          break
        case 'Reject':
          this.updateReviewStatus(projectID, userID, REVIEW_STATUS.REJECTED)
          this.assignCriteriasForProject(projectID, criteriaID, REVIEW_STATUS.REJECTED, false, semesterID)
          break
        default:
          throw new Error('Invalid type')
      }
    } else {
      const acceptedCount = fitleredReviewTypes.filter((rt) => rt.status === REVIEW_STATUS.ACCEPTED).length
      const rejectedCount = fitleredReviewTypes.filter((rt) => rt.status === REVIEW_STATUS.REJECTED).length
      const consideredCount = fitleredReviewTypes.filter((rt) => rt.status === REVIEW_STATUS.CONSIDERED).length
      if (rejectedCount === 1 && acceptedCount === 1) {
        switch (type) {
          case 'Accept':
            this.updateReviewStatus(projectID, userID, REVIEW_STATUS.ACCEPTED)
            this.updateProjectStatus(projectID, PROJECT_STATUS.ACCEPTED)
            this.assignCriteriasForProject(projectID, criteriaID, REVIEW_STATUS.ACCEPTED, true, semesterID)
            break
          case 'Consider':
            this.updateReviewStatus(projectID, userID, REVIEW_STATUS.CONSIDERED)
            this.assignCriteriasForProject(projectID, criteriaID, REVIEW_STATUS.CONSIDERED, false, semesterID)
            break
          case 'Reject':
            this.updateReviewStatus(projectID, userID, REVIEW_STATUS.REJECTED)
            this.updateProjectStatus(projectID, PROJECT_STATUS.REJECTED)
            this.assignCriteriasForProject(projectID, criteriaID, REVIEW_STATUS.REJECTED, true, semesterID)
            break
          default:
            throw new Error('Invalid type')
        }
        return
      } else if (rejectedCount === 1 && consideredCount === 1) {
        switch (type) {
          case 'Accept':
            this.updateReviewStatus(projectID, userID, REVIEW_STATUS.ACCEPTED)
            this.assignCriteriasForProject(projectID, criteriaID, REVIEW_STATUS.ACCEPTED, false, semesterID)
            break
          case 'Consider':
            this.updateReviewStatus(projectID, userID, REVIEW_STATUS.CONSIDERED)
            this.assignCriteriasForProject(projectID, criteriaID, REVIEW_STATUS.CONSIDERED, false, semesterID)
            this.updateProjectStatus(projectID, PROJECT_STATUS.CONSIDERED)
            break
          case 'Reject':
            this.updateReviewStatus(projectID, userID, REVIEW_STATUS.REJECTED)
            this.updateProjectStatus(projectID, PROJECT_STATUS.REJECTED)
            this.assignCriteriasForProject(projectID, criteriaID, REVIEW_STATUS.REJECTED, true, semesterID)
            break
          default:
            throw new Error('Invalid type')
        }
        return
      } else if (acceptedCount === 1 && consideredCount === 1) {
        switch (type) {
          case 'Accept':
            this.updateReviewStatus(projectID, userID, REVIEW_STATUS.ACCEPTED)
            this.updateProjectStatus(projectID, PROJECT_STATUS.ACCEPTED)
            this.assignCriteriasForProject(projectID, criteriaID, REVIEW_STATUS.ACCEPTED, true, semesterID)
            break
          case 'Consider':
            this.updateReviewStatus(projectID, userID, REVIEW_STATUS.CONSIDERED)
            this.updateProjectStatus(projectID, PROJECT_STATUS.CONSIDERED)
            this.assignCriteriasForProject(projectID, criteriaID, REVIEW_STATUS.CONSIDERED, false, semesterID)
            break
          case 'Reject':
            this.updateReviewStatus(projectID, userID, REVIEW_STATUS.REJECTED)
            this.assignCriteriasForProject(projectID, criteriaID, REVIEW_STATUS.REJECTED, false, semesterID)
            break
          default:
            throw new Error('Invalid type')
        }
        return
      }

      if (rejectedCount === 1) {
        const otherMentorID = fitleredReviewTypes.filter((rt) => rt.status !== REVIEW_STATUS.REJECTED)
        switch (type) {
          case 'Accept':
            this.updateReviewStatus(projectID, userID, REVIEW_STATUS.ACCEPTED)
            this.assignCriteriasForProject(projectID, criteriaID, REVIEW_STATUS.ACCEPTED, false, semesterID)
            break
          case 'Consider':
            this.updateReviewStatus(projectID, userID, REVIEW_STATUS.CONSIDERED)
            this.assignCriteriasForProject(projectID, criteriaID, REVIEW_STATUS.CONSIDERED, false, semesterID)
            break
          case 'Reject':
            this.updateReviewStatus(projectID, userID, REVIEW_STATUS.REJECTED)
            if (otherMentorID[0].status === REVIEW_STATUS.PENDING) {
              this.updateReviewStatus(projectID, String(otherMentorID[0].userID), REVIEW_STATUS.WITHDRAWN)
            }
            this.updateProjectStatus(projectID, PROJECT_STATUS.REJECTED)
            this.assignCriteriasForProject(projectID, criteriaID, REVIEW_STATUS.REJECTED, true, semesterID)
            break
          default:
            throw new Error('Invalid type')
        }
      } else if (acceptedCount === 1) {
        const otherMentorID = fitleredReviewTypes.filter(
          (rt) => rt.status !== REVIEW_STATUS.ACCEPTED && String(rt.userID) !== String(userID)
        )
        switch (type) {
          case 'Accept':
            this.updateReviewStatus(projectID, userID, REVIEW_STATUS.ACCEPTED)
            if (otherMentorID[0].status === REVIEW_STATUS.PENDING) {
              this.updateReviewStatus(projectID, String(otherMentorID[0].userID), REVIEW_STATUS.WITHDRAWN)
            }
            this.updateProjectStatus(projectID, PROJECT_STATUS.ACCEPTED)
            this.assignCriteriasForProject(projectID, criteriaID, REVIEW_STATUS.ACCEPTED, true, semesterID)
            break
          case 'Consider':
            this.updateReviewStatus(projectID, userID, REVIEW_STATUS.CONSIDERED)
            this.assignCriteriasForProject(projectID, criteriaID, REVIEW_STATUS.CONSIDERED, false, semesterID)
            break
          case 'Reject':
            this.updateReviewStatus(projectID, userID, REVIEW_STATUS.REJECTED)
            this.assignCriteriasForProject(projectID, criteriaID, REVIEW_STATUS.REJECTED, false, semesterID)
            break
          default:
            throw new Error('Invalid type')
        }
      } else {
        const otherMentorID = fitleredReviewTypes.filter(
          (rt) => rt.status !== REVIEW_STATUS.CONSIDERED && String(rt.userID) !== String(userID)
        )
        switch (type) {
          case 'Accept':
            this.updateReviewStatus(projectID, userID, REVIEW_STATUS.ACCEPTED)
            this.assignCriteriasForProject(projectID, criteriaID, REVIEW_STATUS.ACCEPTED, false, semesterID)
            break
          case 'Consider':
            this.updateReviewStatus(projectID, userID, REVIEW_STATUS.CONSIDERED)
            if (otherMentorID[0].status === REVIEW_STATUS.PENDING) {
              this.updateReviewStatus(projectID, String(otherMentorID[0].userID), REVIEW_STATUS.WITHDRAWN)
            }
            this.updateProjectStatus(projectID, PROJECT_STATUS.CONSIDERED)
            this.assignCriteriasForProject(projectID, criteriaID, REVIEW_STATUS.CONSIDERED, false, semesterID)
            break
          case 'Reject':
            this.updateReviewStatus(projectID, userID, REVIEW_STATUS.REJECTED)
            this.assignCriteriasForProject(projectID, criteriaID, REVIEW_STATUS.REJECTED, false, semesterID)
            break
          default:
            throw new Error('Invalid type')
        }
      }
    }
  }

  async reviewProject(
    projectID: number | undefined,
    criteriaID: number[],
    semesterID: string | null | undefined,
    type: 'Accept' | 'Reject' | 'Consider',
    userID: string
  ) {
    const reviewTypes = await databaseService.query<UserReviewProject[]>(
      `SELECT userID, type, status FROM ${DatabaseTable.User_Review_Project} WHERE projectID = ?`,
      [projectID]
    )

    if (reviewTypes.length === 1) {
      if (reviewTypes[0].type === TokenRole.Mentor && reviewTypes[0].status === REVIEW_STATUS.PENDING) {
        await this.handleSingleMentorReview(type, projectID, semesterID, userID)
      } else {
        throw new Error('Project is not in review phase')
      }
    } else if (reviewTypes.length > 1) {
      if (reviewTypes.every((rt) => rt.type === TokenRole.Mentor)) {
        await this.handleMultipleMentorReviews(type, reviewTypes, projectID, semesterID, userID)
      } else {
        await this.handleMultipleReviewerReviews(type, reviewTypes, projectID, userID, criteriaID, semesterID)
      }
    }
  }
}

const projectServices = new ProjectServices()
export default projectServices
