import { randomUUID } from "crypto";
export const handlRandomId = () => {
  const data = randomUUID()
  return data.slice(0, 10)
}

export const sprearObjectToArray = (data: object) => {
  return Object.values(data)
}