import { ColumnID } from '~/constants/enums'
import databaseService from '~/services/database.services'

export const databaseCheck = async (table: string, column: ColumnID, valueToCheck: number[]) => {
  const result = await databaseService.query<{ [key: string]: number }[]>(`SELECT ${column} FROM ${table}`)
  const existingValues = result.map((row) => row[column])
  const notExist: number[] = valueToCheck.filter((item: number) => {
    return !existingValues.includes(item)
  })

  return notExist
}
