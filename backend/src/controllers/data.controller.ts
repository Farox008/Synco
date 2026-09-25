import { Request, Response } from 'express';
import prisma from '../utils/prisma';

export const getInitialData = async (req: Request, res: Response) => {
  try {
    const workOrders = await prisma.workOrder.findMany({
      include: {
        metadata: true,
        jobs: {
          include: {
            processes: true
          }
        },
        purchases: true
      }
    });

    const machines = await prisma.machine.findMany();

    const metrics = [
      { title: 'Total Work Orders', value: workOrders.length.toString(), sub: 'From DB', trend: 'up' },
      { title: 'In Progress', value: workOrders.filter(w => w.status === 'In Progress').length.toString(), sub: '', trend: 'up' },
      { title: 'Active Machines', value: machines.filter(m => m.status === 'running').length.toString(), sub: '', trend: 'up' }
    ];

    res.json({
      workOrders,
      machines,
      metrics,
      jobs: []
    });
  } catch (error) {
    console.error('Error fetching initial data:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getAuditLogs = async (req: Request, res: Response) => {
  try {
    const logs = await prisma.auditLog.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(logs);
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
