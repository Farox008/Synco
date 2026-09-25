import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';
import { PermissionsModule } from './permissions/permissions.module';
import { JobsModule } from './jobs/jobs.module';
import { BomModule } from './bom/bom.module';
import { MaterialsModule } from './materials/materials.module';
import { InventoryModule } from './inventory/inventory.module';
import { PurchasingModule } from './purchasing/purchasing.module';
import { PlanningModule } from './planning/planning.module';
import { ProductionModule } from './production/production.module';
import { DocumentsModule } from './documents/documents.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AuditModule } from './audit/audit.module';
import { SupabaseModule } from './supabase/supabase.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule, UsersModule, RolesModule, PermissionsModule, JobsModule, BomModule, MaterialsModule, InventoryModule, PurchasingModule, PlanningModule, ProductionModule, DocumentsModule, NotificationsModule, AuditModule, SupabaseModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
