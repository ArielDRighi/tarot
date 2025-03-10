import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
  ForbiddenException,
  NotFoundException,
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
import { InterpretationService } from './interpretation.service';
import { TarotService } from './tarot.service';
import { GenerateInterpretationDto } from './dto/generate-interpretation.dto';
import { CreateReadingDto } from './dto/create-reading.dto';
import { RandomCardsDto } from './dto/random-cards.dto';

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
  @ApiOperation({
    summary: 'Generar interpretación para un conjunto de cartas',
    description:
      'Genera una interpretación basada en las cartas seleccionadas y sus posiciones',
  })
  @ApiBody({ type: GenerateInterpretationDto })
  @ApiResponse({
    status: 200,
    description: 'Interpretación generada con éxito',
  })
  async generateInterpretation(@Body() generateDto: GenerateInterpretationDto) {
    // Obtener las cartas por los IDs proporcionados
    const cards = await Promise.all(
      generateDto.cardIds.map((id) => this.tarotService.findCardById(id)),
    );

    // Mapear posiciones para que coincidan con el formato esperado por el servicio
    const positions = generateDto.positions.map((pos, index) => ({
      cardId: generateDto.cardIds[index],
      position: pos.position,
      isReversed: pos.isReversed,
    }));

    // Generar la interpretación
    const interpretation =
      await this.interpretationService.generateInterpretation(
        cards,
        positions,
        generateDto.question,
      );

    return { interpretation };
  }

  @UseGuards(JwtAuthGuard)
  @Post('reading')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Crear una nueva lectura de tarot',
    description:
      'Crea una lectura completa con cartas, posiciones e interpretación',
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

  @Get('random-cards')
  @ApiOperation({
    summary: 'Obtener cartas aleatorias para una lectura',
    description:
      'Selecciona cartas aleatorias de un mazo, opcionalmente con posiciones invertidas',
  })
  @ApiQuery({
    name: 'count',
    required: false,
    type: Number,
    description: 'Número de cartas a seleccionar (predeterminado: 3)',
  })
  @ApiQuery({
    name: 'deckId',
    required: false,
    type: Number,
    description: 'ID del mazo del que seleccionar las cartas',
  })
  @ApiQuery({
    name: 'includeReversed',
    required: false,
    type: Boolean,
    description: 'Si se deben incluir cartas invertidas (predeterminado: true)',
  })
  async getRandomCards(
    @Query() options: RandomCardsDto & { includeReversed?: boolean },
  ) {
    // Obtener cartas aleatorias
    const cards = await this.tarotService.getRandomCards(options);

    // Si se solicita incluir cartas invertidas (predeterminado: true)
    const includeReversed = options.includeReversed !== false;

    // Preparar respuesta con información de orientación (normal o invertida)
    return cards.map((card) => ({
      ...card,
      isReversed: includeReversed ? Math.random() > 0.5 : false,
    }));
  }

  @UseGuards(JwtAuthGuard)
  @Get('history')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Obtener historial de lecturas del usuario',
    description:
      'Recupera todas las lecturas pasadas realizadas por el usuario autenticado',
  })
  async getReadingHistory(@Request() req) {
    const userId = req.user.userId;
    return this.tarotService.findUserReadings(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('reading/:id')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Obtener una lectura específica',
    description: 'Recupera los detalles completos de una lectura específica',
  })
  @ApiParam({ name: 'id', description: 'ID de la lectura' })
  async getReading(@Request() req, @Param('id', ParseIntPipe) id: number) {
    const userId = req.user.userId;
    const isAdmin = req.user.isAdmin;

    return this.tarotService.findReadingById(id, userId, isAdmin);
  }
}
