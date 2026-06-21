import { PartialType } from '@nestjs/mapped-types';
import { CreateNavItemDto } from './create-nav-item.dto';

export class UpdateNavItemDto extends PartialType(CreateNavItemDto) {}
