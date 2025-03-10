import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Param,
  UseGuards,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TarotService } from './tarot.service';
import { RandomCardsDto } from './dto/random-cards.dto';
import { ShuffleDeckDto } from './dto/shuffle-deck.dto';

@ApiTags('Tarot')
@Controller('tarot')
export class TarotController {
  constructor(private readonly tarotService: TarotService) {}

  @Get('spreads')
  @ApiOperation({
    summary: 'Obtener todas las tiradas disponibles',
    description: 'Devuelve una lista de todas las tiradas de tarot disponibles',
  })
  async getAllSpreads() {
    return this.tarotService.findAllSpreads();
  }

  @Get('spreads/:id')
  @ApiOperation({
    summary: 'Obtener detalles de una tirada específica',
    description: 'Devuelve los detalles de una tirada de tarot específica',
  })
  @ApiParam({ name: 'id', description: 'ID de la tirada' })
  async getSpreadById(@Param('id', ParseIntPipe) id: number) {
    return this.tarotService.findSpreadById(id);
  }

  @Get('random-cards')
  @ApiOperation({
    summary: 'Obtener cartas aleatorias',
    description: 'Selecciona cartas aleatorias de un mazo especificado',
  })
  @ApiQuery({ name: 'count', required: false, type: Number })
  @ApiQuery({ name: 'deckId', required: false, type: Number })
  async getRandomCards(@Query() options: RandomCardsDto) {
    return this.tarotService.getRandomCards(options);
  }

  @Post('shuffle')
  @ApiOperation({
    summary: 'Barajar y cortar un mazo',
    description: 'Simula el barajado y corte de un mazo de tarot',
  })
  @ApiBody({ type: ShuffleDeckDto })
  async shuffleDeck(@Body() shuffleDto: ShuffleDeckDto) {
    // Este método simplemente devuelve un indicador de éxito
    // El barajado real ocurre cuando se seleccionan cartas aleatorias
    return {
      success: true,
      message: `Mazo ${shuffleDto.deckId} barajado ${shuffleDto.shuffleCount || 3} veces${
        shuffleDto.performCut ? ' y cortado' : ''
      }`,
      readyForReading: true,
    };
  }

  @Get('reading-types')
  @ApiOperation({
    summary: 'Obtener tipos de lectura disponibles',
    description:
      'Devuelve una lista de categorías de lectura (amor, trabajo, salud, etc.)',
  })
  async getReadingTypes() {
    // Esta es una lista predefinida, podría venir de la base de datos en una implementación real
    return [
      { id: 'love', name: 'Amor y Relaciones', icon: 'heart' },
      { id: 'career', name: 'Carrera y Trabajo', icon: 'briefcase' },
      { id: 'finance', name: 'Dinero y Finanzas', icon: 'money-bill' },
      { id: 'health', name: 'Salud y Bienestar', icon: 'heart-pulse' },
      { id: 'spiritual', name: 'Crecimiento Espiritual', icon: 'yin-yang' },
      { id: 'general', name: 'Consulta General', icon: 'star' },
    ];
  }
}
