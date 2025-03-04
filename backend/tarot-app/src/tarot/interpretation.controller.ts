import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Param,
  ParseIntPipe,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { InterpretationService } from './interpretation.service';
import { TarotService } from './tarot.service';
import { GenerateInterpretationDto } from './dto/generate-interpretation.dto';

@ApiTags('Interpretaciones')
@Controller('interpretations')
export class InterpretationController {
  constructor(
    private interpretationService: InterpretationService,
    private tarotService: TarotService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post('generate')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Generar una interpretación con OpenAI' })
  @ApiBody({ type: GenerateInterpretationDto })
  @ApiResponse({
    status: 201,
    description: 'Interpretación generada exitosamente',
  })
  @ApiResponse({ status: 400, description: 'Solicitud inválida' })
  async generateInterpretation(
    @Body() generateDto: GenerateInterpretationDto,
    @Request() req,
  ) {
    try {
      // Obtener las cartas por sus IDs
      const cards = await Promise.all(
        generateDto.cardIds.map((id) => this.tarotService.findCardById(id)),
      );

      // Validar que haya correspondencia entre cardIds y positions
      if (generateDto.cardIds.length !== generateDto.positions.length) {
        throw new BadRequestException(
          'El número de cartas no coincide con el número de posiciones',
        );
      }

      // Crear el arreglo de posiciones en el formato esperado
      const cardPositions = generateDto.cardIds.map((id, index) => ({
        cardId: id,
        position: generateDto.positions[index].position,
        isReversed: generateDto.positions[index].isReversed,
      }));

      // Generar la interpretación
      const interpretation =
        await this.interpretationService.generateInterpretation(
          cards,
          cardPositions,
          generateDto.question,
        );

      return { interpretation };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(
        `Error al generar interpretación: ${error.message}`,
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('readings/:id/regenerate')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Regenerar la interpretación de una lectura existente',
  })
  @ApiResponse({
    status: 200,
    description: 'Interpretación regenerada exitosamente',
  })
  @ApiResponse({ status: 404, description: 'Lectura no encontrada' })
  async regenerateReadingInterpretation(
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
  ) {
    // Buscar la lectura y verificar que pertenece al usuario o es administrador
    const reading = await this.tarotService.findReadingById(
      id,
      req.user.userId,
      req.user.isAdmin,
    );

    // Regenerar la interpretación
    const newInterpretation =
      await this.interpretationService.regenerateInterpretation(reading);

    // Actualizar la lectura con la nueva interpretación
    await this.tarotService.updateReading(id, {
      interpretation: newInterpretation,
    });

    return { interpretation: newInterpretation };
  }
}
