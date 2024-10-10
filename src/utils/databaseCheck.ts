import databaseService from '~/services/database.services'

export const databaseCheck = async (table: string, valueToCheck: number[]) => {
  const techName = await databaseService.query<{ techID: number }[]>(`SELECT techID FROM ${table}`)
  const notExist: number[] = valueToCheck.filter((item: number) => {
    return !techName.some((tech) => tech.techID === item)
  })
  return notExist
}
