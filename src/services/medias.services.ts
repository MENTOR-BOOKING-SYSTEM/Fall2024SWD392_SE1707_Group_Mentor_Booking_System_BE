import { Request } from 'express'
import path from 'path'
import sharp from 'sharp'
import { UPLOAD_IMAGE_DIR } from '~/constants/dir'
import { Media } from '~/models/Other'
import { getNameFromFullName, handleUploadImage } from '~/utils/file'
import fsPromise from 'fs/promises'
import { MediaType } from '~/constants/enums'
import { uploadFileToS3 } from '~/utils/s3'
import { log } from 'util'

class MediasService {
  async uploadImage(req: Request) {
    const files = await handleUploadImage(req)
    const result: Media[] = await Promise.all(
      files.map(async (file) => {
        const newName = getNameFromFullName(file.newFilename)
        const newFullFileName = `${newName}.jpg`
        const newPath = path.resolve(UPLOAD_IMAGE_DIR, newFullFileName)
        await sharp(file.filepath).jpeg().toFile(newPath)

        const mime = (await import('mime')).default

        const s3 = await uploadFileToS3({
          filename: newFullFileName,
          filepath: newPath,
          contentType: mime.getType(newPath) as string
        })

        await Promise.all([fsPromise.unlink(file.filepath), fsPromise.unlink(newPath)])
        return { url: s3.Location as string, type: MediaType.Image }
      })
    )
    return result
  }
}
const mediasService = new MediasService()
export default mediasService
