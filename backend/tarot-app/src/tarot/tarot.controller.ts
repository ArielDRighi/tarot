import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  ForbiddenException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TarotService } from './tarot.service';
import { CreateReadingDto } from './dto/create-reading.dto';
import { RandomCardsDto } from './dto/random-cards.dto';
import { CreateSpreadDto } from './dto/create-spread.dto';
import { TarotReading } from './entities/tarot-reading.entity';
import { TarotCard } from './entities/tarot-card.entity';
import { TarotSpread } from './entities/tarot-spread.entity';

@ApiTags('Tarot')
@Controller('tarot')
export class TarotController {
  constructor(private readonly tarotService: TarotService) {}

  // Endpoints para tiradas (spreads)
  @UseGuards(JwtAuthGuard)
  @Post('spreads')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear una nueva tirada (solo admin)' })
  @ApiResponse({
    status: 201,
    description: 'Tirada creada con éxito',
    type: TarotSpread,
  })
  @ApiResponse({
    status: 403,
    description: 'Acceso denegado - Solo administradores',
  })
  async createSpread(@Request() req, @Body() createSpreadDto: CreateSpreadDto) {
    // Verificar si es administrador
    if (!req.user.isAdmin) {
      throw new ForbiddenException('Solo administradores pueden crear tiradas');
    }
    return this.tarotService.createSpread(createSpreadDto);
  }

  @Get('spreads')
  @ApiOperation({ summary: 'Obtener todas las tiradas disponibles' })
  @ApiResponse({
    status: 200,
    description: 'Lista de tiradas',
    type: [TarotSpread],
  })
  async getAllSpreads() {
    return this.tarotService.findAllSpreads();
  }

  @Get('spreads/:id')
  @ApiOperation({ summary: 'Obtener una tirada específica' })
  @ApiParam({ name: 'id', description: 'ID de la tirada' })
  @ApiResponse({
    status: 200,
    description: 'Tirada encontrada',
    type: TarotSpread,
  })
  @ApiResponse({ status: 404, description: 'Tirada no encontrada' })
  async getSpreadById(@Param('id', ParseIntPipe) id: number) {
    return this.tarotService.findSpreadById(id);
  }

  // Endpoint para obtener cartas aleatorias
  @Get('cards/random')
  @ApiOperation({ summary: 'Obtener cartas aleatorias' })
  @ApiQuery({
    name: 'count',
    required: false,
    type: Number,
    description: 'Número de cartas a devolver (por defecto: 3)',
  })
  @ApiQuery({
    name: 'deckId',
    required: false,
    type: Number,
    description: 'ID del mazo (opcional)',
  })
  @ApiResponse({
    status: 200,
    description: 'Cartas aleatorias',
    type: [TarotCard],
  })
  async getRandomCards(@Query() randomCardsDto: RandomCardsDto) {
    return this.tarotService.getRandomCards(randomCardsDto);
  }

  // Endpoints para lecturas
  @UseGuards(JwtAuthGuard)
  @Post('readings')
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear una nueva lectura de tarot' })
  @ApiResponse({
    status: 201,
    description: 'Lectura creada con éxito',
    type: TarotReading,
  })
  async createReading(
    @Request() req,
    @Body() createReadingDto: CreateReadingDto,
  ) {
    return this.tarotService.createReading(req.user.userId, createReadingDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('readings')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener lecturas del usuario actual' })
  @ApiResponse({
    status: 200,
    description: 'Lista de lecturas del usuario',
    type: [TarotReading],
  })
  async getUserReadings(@Request() req) {
    return this.tarotService.findUserReadings(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('readings/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener una lectura específica' })
  @ApiParam({ name: 'id', description: 'ID de la lectura' })
  @ApiResponse({
    status: 200,
    description: 'Lectura encontrada',
    type: TarotReading,
  })
  @ApiResponse({ status: 404, description: 'Lectura no encontrada' })
  @ApiResponse({ status: 403, description: 'Acceso denegado' })
  async getReadingById(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.tarotService.findReadingById(
      id,
      req.user.userId,
      req.user.isAdmin,
    );
  }
}
