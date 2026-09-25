import { Request, Response } from 'express';
import { WorkOrderService } from '../services/workOrder.service';

export const getWorkOrders = async (req: Request, res: Response) => {
  try {
    const orders = await WorkOrderService.getAllWorkOrders();
    res.json(orders);
  } catch (error: any) {
    res.status(500).json({ message: 'Error', details: error.message });
  }
};

export const addWorkOrder = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    const wo = await WorkOrderService.createWorkOrder({ id: data.id, customer: data.customer, priority: data.priority, status: data.status });
    res.json(wo);
  } catch (error: any) {
    res.status(500).json({ message: 'Error', details: error.message });
  }
};

export const updateWorkOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const wo = await WorkOrderService.updateWorkOrder(id, data);
    res.json(wo);
  } catch (error: any) {
    res.status(500).json({ message: 'Error', details: error.message });
  }
};

export const deleteWorkOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await WorkOrderService.deleteWorkOrder(id);
    res.json({ message: 'Deleted' });
  } catch (error: any) {
    res.status(500).json({ message: 'Error', details: error.message });
  }
};
