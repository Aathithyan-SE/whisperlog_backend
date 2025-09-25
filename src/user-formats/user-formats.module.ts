import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserFormatsService } from './user-formats.service';
import { UserFormatsController } from './user-formats.controller';
import { UserFormat, UserFormatSchema } from '../schemas/user-format.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserFormat.name, schema: UserFormatSchema },
    ]),
  ],
  controllers: [UserFormatsController],
  providers: [UserFormatsService],
  exports: [UserFormatsService],
})
export class UserFormatsModule {}
