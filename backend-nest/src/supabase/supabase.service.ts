import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private readonly logger = new Logger(SupabaseService.name);
  private supabaseClient: SupabaseClient;

  constructor(private configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL') || this.configService.get<string>('NEXT_PUBLIC_SUPABASE_URL');
    const supabaseKey = this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY') || 
                        this.configService.get<string>('SUPABASE_ANON_KEY') || 
                        this.configService.get<string>('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      this.logger.warn('Supabase URL or Key is missing from environment variables.');
    }

    this.supabaseClient = createClient(supabaseUrl || '', supabaseKey || '', {
        auth: {
            persistSession: false // Since this is a backend service
        }
    });
  }

  getClient(): SupabaseClient {
    return this.supabaseClient;
  }
}
