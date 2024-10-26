import databaseService from './database.services'
import { ApprovalCriteriaType, ApprovalCriteria } from '~/models/schemas/Criteria.schema'
import { DatabaseTable } from '~/constants/databaseTable'

class CriteriaService {
  async createCriteria(name: string, type: string, description?: string) {
    await databaseService.query<ApprovalCriteria[]>(
      'INSERT INTO Approval_Criteria (criteriaName, description, type) VALUES (?, ?, ?)',
      [name, description, type]
    )
  }

  async getCriteriaByName(name: string): Promise<ApprovalCriteria | null> {
    const [criteria] = await databaseService.query<ApprovalCriteria[]>(
      'SELECT * FROM Approval_Criteria WHERE criteriaName = ?',
      [name]
    )
    return criteria || null
  }

  async getAllCriteria(page: number = 1, limit: number = 10): Promise<{criteria: ApprovalCriteria[], total: number}> {
    const [[{total}], criteria] = await Promise.all([
      databaseService.query<[{total: number}]>('SELECT COUNT(*) as total FROM Approval_Criteria'),
      databaseService.query<ApprovalCriteria[]>(
        'SELECT * FROM Approval_Criteria LIMIT ? OFFSET ?',
        [limit, (page - 1) * limit]
      )
    ])
    return {
      criteria,
      total
    }
  }

  async getCriteriaById(criteriaID: string): Promise<ApprovalCriteria | null> {
    const [criteria] = await databaseService.query<ApprovalCriteria[]>(
      'SELECT * FROM Approval_Criteria WHERE criteriaID = ?',
      [criteriaID]
    )
    return criteria || null
  }

  async getCriteriaBySemesterId(semesterID: string): Promise<ApprovalCriteria[]> {
    const criteria = await databaseService.query<ApprovalCriteria[]>(
      `SELECT c.* FROM ${DatabaseTable.Approval_Criteria} c JOIN ${DatabaseTable.Semester_Criteria} sc ON c.criteriaID = sc.criteriaID WHERE sc.semesterID = ?`,
      [semesterID]
    )
    return criteria
  }

  async getCriteriaTypes(page: number = 1, limit: number = 10): Promise<ApprovalCriteriaType[]> {
    const offset = (page - 1) * limit;
    const criteriaTypes = await databaseService.query<ApprovalCriteriaType[]>(
      `SELECT criteriaTypeID, type FROM ${DatabaseTable.Criteria_Type} LIMIT ? OFFSET ?`,
      [limit, offset]
    )
    return criteriaTypes
  }

  async editCriteria(criteriaID: string, name: string, type: string, description: string) {
    await databaseService.query<ApprovalCriteria[]>(
      `UPDATE ${DatabaseTable.Approval_Criteria} SET criteriaName = ?, description = ?, type = ? WHERE criteriaID = ?`,
      [name, description, type, criteriaID]
    )
  }
}

const criteriaService = new CriteriaService()
export default criteriaService
