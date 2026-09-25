import { Controller, Get, Res, HttpStatus } from '@nestjs/common';
import { AppService } from './app.service';
import { SupabaseService } from './supabase/supabase.service';
import { Response } from 'express';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly supabaseService: SupabaseService
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('supabase-test')
  async testSupabase(@Res() res: Response) {
    try {
      const client = this.supabaseService.getClient();
      // Test the connection by doing a lightweight query
      const { data, error } = await client.from('_dummy_table_check_').select('*').limit(1);
      
      if (error && error.code !== '42P01') { 
        // 42P01 is Postgres "undefined_table", which means connection succeeded but table doesn't exist
        throw error;
      }
      
      return res.status(HttpStatus.OK).json({ 
        status: 'success', 
        message: 'NestJS successfully connected to Supabase API.' 
      });
    } catch (error: any) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ 
        status: 'error', 
        message: 'Failed to connect to Supabase API from NestJS.', 
        error: error.message 
      });
    }
  }
}
