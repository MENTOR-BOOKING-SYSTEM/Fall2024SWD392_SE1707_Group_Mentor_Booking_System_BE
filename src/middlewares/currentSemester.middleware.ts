import { Request, Response, NextFunction } from 'express';
import databaseService from '~/services/database.services';
import { NotFoundError } from '~/models/Errors';

export const checkCurrentSemester = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const currentTime = new Date();
    const semester = await databaseService.query(
      'SELECT semesterID FROM Semester WHERE startDate <= ? AND endDate >= ?',
      [currentTime.toISOString(), currentTime.toISOString()]
    );

    if (!semester.length) {
      throw new NotFoundError({ message: 'Không tìm thấy học kỳ hiện tại' });
    }

    (req as any).currentSemesterID = semester[0].semesterID; // Gán semesterID vào request
    next();
  } catch (error) {
    next(error);
  }
};
