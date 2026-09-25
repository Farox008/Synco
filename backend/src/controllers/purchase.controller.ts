import { Request, Response } from 'express';
import prisma from '../utils/prisma';

export const getPurchases = async (req: Request, res: Response) => {
  try {
    const purchases = await prisma.purchase.findMany({ include: { workOrder: true } });
    res.json(purchases);
  } catch (error) {
    res.status(500).json({ message: 'Error' });
  }
};
