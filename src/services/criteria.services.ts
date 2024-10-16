import { v4 as uuidv4 } from 'uuid'
import databaseService from './database.services'
import Criteria from '~/models/schemas/Criteria.schema'

class CriteriaService {
  async createCriteria(name: string, type: string, description?: string): Promise<Criteria> {
    const criteriaID = uuidv4()
    const createdAt = new Date()
    const updatedAt = new Date()

    const [result] = await databaseService.query<Criteria[]>(
      'INSERT INTO Approval_Criteria (criteriaID, name, description, type, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)',
      [criteriaID, name, description, type, createdAt, updatedAt]
    )

    return {
      criteriaID,
      name,
      description,
      type,
      createdAt,
      updatedAt
    }
  }

  async getCriteriaByName(name: string): Promise<Criteria | null> {
    const [criteria] = await databaseService.query<Criteria[]>('SELECT * FROM Approval_Criteria WHERE name = ?', [name])
    return criteria || null
  }

  async getAllCriteria(): Promise<Criteria[]> {
    const criteria = await databaseService.query<Criteria[]>('SELECT * FROM Approval_Criteria')
    return criteria
  }

  async getCriteriaById(criteriaID: string): Promise<Criteria | null> {
    const [criteria] = await databaseService.query<Criteria[]>('SELECT * FROM Approval_Criteria WHERE criteriaID = ?', [
      criteriaID
    ])
    return criteria || null
  }

  async getCriteriaBySemesterId(semesterID: string): Promise<Criteria[]> {
    const criteria = await databaseService.query<Criteria[]>(
      'SELECT c.* FROM Approval_Criteria c JOIN SemesterCriteria sc ON c.criteriaID = sc.criteriaID WHERE sc.semesterID = ?',
      [semesterID]
    )
    return criteria
  }
}

const criteriaService = new CriteriaService()
export default criteriaService
