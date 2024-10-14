import { v4 as uuidv4 } from 'uuid';
import databaseService from './database.services';
import Criteria from '~/models/schemas/Criteria.schema';

class CriteriaService {
  async createCriteria(name: string, type: string, description?: string): Promise<Criteria> {
    const criteriaID = uuidv4();
    const createdAt = new Date();
    const updatedAt = new Date();

    const [result] = await databaseService.query<Criteria[]>(
      'INSERT INTO Criteria (criteriaID, name, description, type, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)',
      [criteriaID, name, description, type, createdAt, updatedAt]
    );

    return {
      criteriaID,
      name,
      description,
      type,
      createdAt,
      updatedAt
    };
  }

  async getCriteriaByName(name: string): Promise<Criteria | null> {
    const [criteria] = await databaseService.query<Criteria[]>(
      'SELECT * FROM Criteria WHERE name = ?',
      [name]
    );
    return criteria || null;
  }

  async getAllCriteria(): Promise<Criteria[]> {
    const criteria = await databaseService.query<Criteria[]>('SELECT * FROM Criteria');
    return criteria;
  }
}

const criteriaService = new CriteriaService();
export default criteriaService;

