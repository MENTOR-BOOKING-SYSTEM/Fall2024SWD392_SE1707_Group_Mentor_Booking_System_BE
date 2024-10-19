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

  async getAllCriteria(): Promise<ApprovalCriteria[]> {
    const criteria = await databaseService.query<ApprovalCriteria[]>('SELECT * FROM Approval_Criteria')
    return criteria
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
      'SELECT c.* FROM Approval_Criteria c JOIN SemesterCriteria sc ON c.criteriaID = sc.criteriaID WHERE sc.semesterID = ?',
      [semesterID]
    )
    return criteria
  }

  async getCriteriaTypes(): Promise<ApprovalCriteriaType[]> {
    const criteriaTypes = await databaseService.query<ApprovalCriteriaType[]>(
      `SELECT criteriaTypeID, type FROM ${DatabaseTable.Criteria_Type}`
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
