import { Module } from '@nestjs/common';
import { SupabaseAuthGuard } from './supabase.guard';
import { RolesGuard } from './roles.guard';

@Module({
  providers: [SupabaseAuthGuard, RolesGuard],
  exports: [SupabaseAuthGuard, RolesGuard],
})
export class AuthModule {}
