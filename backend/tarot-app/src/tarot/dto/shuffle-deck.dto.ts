import { IsInt, Min, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ShuffleDeckDto {
  @ApiProperty({
    example: 1,
    description: 'ID del mazo a barajar',
  })
  @IsInt()
  @IsNotEmpty({ message: 'El ID del mazo es requerido' })
  deckId: number;

  @ApiProperty({
    example: 3,
    description: 'Número de veces para barajar el mazo (predeterminado: 3)',
    required: false,
  })
  @IsInt()
  @Min(1)
  @IsOptional()
  shuffleCount?: number = 3;

  @ApiProperty({
    example: true,
    description: 'Si se debe cortar el mazo después de barajar',
    required: false,
  })
  @IsOptional()
  performCut?: boolean = true;
}
