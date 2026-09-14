import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { EstimateResponseDto } from '@service-orders/application/dto/estimate/estimate-response.dto';

export class CustomerRefDto {
  @ApiProperty() @Expose() id: string;
  @ApiProperty() @Expose() name: string;
}

export class VehicleRefDto {
  @ApiProperty() @Expose() id: string;
  @ApiProperty() @Expose() plate: string;
  @ApiProperty() @Expose() brand: string;
  @ApiProperty() @Expose() model: string;
  @ApiProperty() @Expose() year: number;
}

export class MechanicRefDto {
  @ApiProperty() @Expose() id: string;
  @ApiProperty() @Expose() name: string;
  @ApiProperty() @Expose() role: string;
}

export class StatusHistoryDto {
  @ApiProperty() @Expose() id: string;
  @ApiPropertyOptional() @Expose() previousStatus: string | null;
  @ApiProperty() @Expose() newStatus: string;
  @ApiPropertyOptional() @Expose() changedBy: string | null;
  @ApiPropertyOptional() @Expose() notes: string | null;
  @ApiProperty() @Expose() changedAt: Date;
}

export class ServiceOrderResponseDto {
  @ApiProperty() @Expose() id: string;
  @ApiProperty() @Expose() status: string;
  @ApiPropertyOptional() @Expose() mileage: number | null;
  @ApiPropertyOptional() @Expose() notes: string | null;
  @ApiPropertyOptional()
  @Expose()
  closedAt: Date | null;
  @ApiProperty() @Expose() createdAt: Date;
  @ApiProperty() @Expose() updatedAt: Date;

  @ApiProperty({ type: CustomerRefDto })
  @Expose()
  @Type(() => CustomerRefDto)
  customer?: CustomerRefDto;

  @ApiProperty({ type: VehicleRefDto })
  @Expose()
  @Type(() => VehicleRefDto)
  vehicle?: VehicleRefDto;

  @ApiPropertyOptional({ type: MechanicRefDto })
  @Expose()
  @Type(() => MechanicRefDto)
  mechanic?: MechanicRefDto;

  @ApiProperty({ type: [EstimateResponseDto] })
  @Expose()
  @Type(() => EstimateResponseDto)
  estimates?: EstimateResponseDto[];

  @ApiProperty({ type: [StatusHistoryDto] })
  @Expose()
  @Type(() => StatusHistoryDto)
  statusHistory?: StatusHistoryDto[];
}
