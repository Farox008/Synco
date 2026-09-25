import { Request, Response } from 'express';
import prisma from '../utils/prisma';

export const getEmployees = async (req: Request, res: Response) => {
  try {
    const employees = await prisma.employee.findMany({
      include: {
        department: true,
        productionLine: true,
        employmentType: true,
        shift: true,
      }
    });
    res.json(employees);
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
