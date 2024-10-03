import mysql, { Connection, Pool } from 'mysql2'
import { envConfig } from '~/constants/config';
import User from '~/schemas/User.schema'

class DatabaseService {
  private connection: Pool
  constructor() {
    this.connection = mysql.createPool({
      host: "bzjyg0s1aiyqx76l27tw-mysql.services.clever-cloud.com",
      port: 20345,
      user: envConfig.dbUserName,
      password: envConfig.dbPassword,
      database: envConfig.dbName,
      connectTimeout: 10000
    })
  }

  async connect() {

    return new Promise((resolve, reject) => {
      this.connection.getConnection((err) => {
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
          resolve(results as T)
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
