import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from './config/typeorm.config';
import { ConfigModule } from '@nestjs/config';
import { EventModule } from './event/event.module';
import { UsersModule } from './users/users.module';
import { AdminModule } from './admin/admin.module';
import { LikeModule } from './like/like.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(typeOrmConfig),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    EventModule,
    UsersModule,
    AdminModule,
    LikeModule
  ]
})
export class AppModule {}
