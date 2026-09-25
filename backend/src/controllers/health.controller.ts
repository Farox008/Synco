import { Request, Response } from 'express';
import { supabase } from '../utils/supabase';

export const checkHealth = (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', timestamp: new Date() });
};

export const testSupabase = async (req: Request, res: Response) => {
  try {
    // Attempt to query a generic or system table, or just checking auth config
    // We'll just do a simple query to verify connection (or check an arbitrary table)
    // Supabase JS doesn't have a direct 'ping', but we can try to get the auth config or a basic select.
    const { data, error } = await supabase.from('_dummy_table_check_').select('*').limit(1);
    
    // As long as the error isn't related to connection/authentication (e.g. table not found is fine, means connection succeeded)
    if (error && error.code !== '42P01') { 
        // 42P01 is Postgres "undefined_table", which means connection succeeded but table doesn't exist
        throw error;
    }
    
    res.status(200).json({ status: 'success', message: 'Successfully connected to Supabase API.' });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: 'Failed to connect to Supabase API.', error: error.message });
  }
};
