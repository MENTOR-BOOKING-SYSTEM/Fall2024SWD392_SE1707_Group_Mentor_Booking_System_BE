import { v4 as uuidv4 } from 'uuid'

export const handleRandomId = () => {
  return uuidv4().replace('-', '').slice(0, 10)
}
