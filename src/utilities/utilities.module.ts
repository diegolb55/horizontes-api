import { Module } from '@nestjs/common';
import { S3Service } from './s3.service';
import { ResendService } from './resend.service';


@Module({
  providers: [S3Service, ResendService],
  exports: [S3Service, ResendService], 
})
export class UtilitiesModule {}