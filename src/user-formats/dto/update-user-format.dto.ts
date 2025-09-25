import { PartialType } from '@nestjs/swagger';
import { CreateUserFormatDto } from './create-user-format.dto';

export class UpdateUserFormatDto extends PartialType(CreateUserFormatDto) {}
