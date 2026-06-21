import { Module } from '@nestjs/common';
import { KothaIvrService } from './kotha-ivr.service';

@Module({
  providers: [KothaIvrService],
  exports: [KothaIvrService],
})
export class KothaIvrModule {}
