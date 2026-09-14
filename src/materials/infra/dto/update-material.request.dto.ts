import { PartialType } from '@nestjs/swagger';
import type { UpdateMaterialInput } from '@materials/application/usecases/update-material.usecase';
import CreateMaterialRequestDto from '@materials/infra/dto/create-material.request.dto';

export default class UpdateMaterialRequestDto
  extends PartialType(CreateMaterialRequestDto)
  implements Omit<UpdateMaterialInput, 'id'> {}
