import { Request, Response } from 'express';
import prisma from '../utils/prisma';

export const getMachines = async (req: Request, res: Response) => {
  try {
    const machines = await prisma.machine.findMany();
    res.json(machines);
  } catch (error) {
    res.status(500).json({ message: 'Error' });
  }
};

export const addMachine = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    const m = await prisma.machine.create({ data: { id: data.id, name: data.name, type: data.type, status: data.status, activeJobId: data.activeJobId } });
    res.json(m);
  } catch (error) {
    res.status(500).json({ message: 'Error' });
  }
};

export const updateMachine = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const m = await prisma.machine.update({ where: { id }, data });
    res.json(m);
  } catch (error) {
    res.status(500).json({ message: 'Error' });
  }
};
