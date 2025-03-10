import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Request,
  Query,
  ParseIntPipe,
  ForbiddenException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TarotService } from './tarot.service';
import { InterpretationService } from './interpretation.service';
import { CreateReadingDto } from './dto/create-reading.dto';

@ApiTags('Lecturas de Tarot')
@Controller('readings')
export class ReadingController {
  constructor(
    private tarotService: TarotService,
    private interpretationService: InterpretationService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Crear una nueva lectura de tarot',
    description:
      'Procesa una lectura completa con cartas seleccionadas, generando interpretación',
  })
  @ApiBody({ type: CreateReadingDto })
  @ApiResponse({
    status: 201,
    description: 'Lectura creada con éxito',
  })
  async createReading(
    @Request() req,
    @Body() createReadingDto: CreateReadingDto,
  ) {
    const userId = req.user.userId;
    return this.tarotService.createReading(userId, createReadingDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Obtener historial de lecturas del usuario',
    description:
      'Recupera todas las lecturas realizadas por el usuario autenticado',
  })
  async getUserReadings(@Request() req) {
    const userId = req.user.userId;
    return this.tarotService.findUserReadings(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Obtener detalles de una lectura específica',
    description: 'Recupera todos los detalles de una lectura de tarot',
  })
  @ApiParam({ name: 'id', description: 'ID de la lectura' })
  async getReadingById(@Request() req, @Param('id', ParseIntPipe) id: number) {
    const userId = req.user.userId;
    const isAdmin = req.user.isAdmin;

    return this.tarotService.findReadingById(id, userId, isAdmin);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/regenerate')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Regenerar la interpretación de una lectura',
    description: 'Genera una nueva interpretación para una lectura existente',
  })
  @ApiParam({ name: 'id', description: 'ID de la lectura' })
  async regenerateInterpretation(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const userId = req.user.userId;
    const isAdmin = req.user.isAdmin;

    // Verificar acceso a la lectura
    const reading = await this.tarotService.findReadingById(
      id,
      userId,
      isAdmin,
    );

    // Regenerar interpretación
    const newInterpretation =
      await this.interpretationService.regenerateInterpretation(reading);

    // Actualizar la lectura con la nueva interpretación
    await this.tarotService.updateReading(id, {
      interpretation: newInterpretation,
    });

    return {
      id: reading.id,
      interpretation: newInterpretation,
    };
  }
}
