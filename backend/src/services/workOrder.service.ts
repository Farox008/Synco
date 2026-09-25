import { supabase } from '../utils/supabase';

export const WorkOrderService = {
  async getAllWorkOrders() {
    const { data, error } = await supabase
      .from('WorkOrder')
      .select('*, metadata:WorkOrderMetadata(*), jobs:Job(*), purchases:Purchase(*)');
    if (error) throw error;
    return data;
  },

  async getWorkOrderById(id: string) {
    const { data, error } = await supabase
      .from('WorkOrder')
      .select('*, metadata:WorkOrderMetadata(*), jobs:Job(*), purchases:Purchase(*)')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  async createWorkOrder(workOrderData: any) {
    const { data, error } = await supabase
      .from('WorkOrder')
      .insert(workOrderData)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateWorkOrder(id: string, updates: any) {
    const { data, error } = await supabase
      .from('WorkOrder')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteWorkOrder(id: string) {
    const { error } = await supabase
      .from('WorkOrder')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  }
};
