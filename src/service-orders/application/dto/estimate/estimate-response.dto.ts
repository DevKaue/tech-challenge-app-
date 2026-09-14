import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

export class EstimateItemDto {
  @ApiProperty() @Expose() id: string;
  @ApiProperty() @Expose() itemType: string;
  @ApiProperty() @Expose() referenceId: string;
  @ApiProperty() @Expose() description: string;
  @ApiProperty() @Expose() quantity: number;
  @ApiProperty() @Expose() unitPrice: number;
  @ApiProperty() @Expose() totalPrice: number;
  @ApiPropertyOptional() @Expose() notes: string | null;
}

export class EstimateResponseDto {
  @ApiProperty() @Expose() id: string;
  @ApiProperty() @Expose() status: string;
  @ApiProperty() @Expose() totalAmount: number;
  @ApiPropertyOptional() @Expose() validUntil: Date | null;
  @ApiPropertyOptional() @Expose() approvedAt: Date | null;
  @ApiPropertyOptional() @Expose() notes: string | null;
  @ApiProperty() @Expose() createdAt: Date;
  @ApiProperty() @Expose() updatedAt: Date;

  @ApiProperty({ type: [EstimateItemDto] })
  @Expose()
  @Type(() => EstimateItemDto)
  items?: EstimateItemDto[];
}
