import mysql, { Connection } from 'mysql'
import User from '~/schemas/User.schema'

class DatabaseService {
  private connection: Connection
  constructor() {
    this.connection = mysql.createConnection({
      host: 'localhost',
      user: process.env.DB_USER_NAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    })
  }

  connect() {
    return new Promise((resolve, reject) => {
      this.connection.connect((err) => {
        if (err) {
          console.error('Lỗi kết nối cơ sở dữ liệu:', err)
          reject(err)
        } else {
          console.log('Kết nối cơ sở dữ liệu thành công')
        }
      })
    })
  }
  query<T>(sql: string, params?: (number | string)[]): Promise<T> {
    return new Promise((resolve, reject) => {
      this.connection.query(sql, params, (err, results) => {
        if (err) {
          console.error('Lỗi truy vấn:', err)
          reject(err)
        } else {
          resolve(results)
        }
      })
    })
  }
  close() {
    return new Promise((resolve, reject) => {
      this.connection.end((err) => {
        if (err) {
          console.error('Lỗi khi đóng kết nối:', err)
          reject(err)
        } else {
          console.log('Đã đóng kết nối cơ sở dữ liệu')
        }
      })
    })
  }
}
const databaseService = new DatabaseService()
export default databaseService
