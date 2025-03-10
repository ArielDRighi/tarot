import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
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
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CardService } from './card.service';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { TarotCard } from './entities/tarot-card.entity';

@ApiTags('Cartas')
@Controller('cards')
export class CardController {
  constructor(private readonly cardService: CardService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener todas las cartas' })
  @ApiResponse({
    status: 200,
    description: 'Lista de todas las cartas',
    type: [TarotCard],
  })
  async getAllCards() {
    return this.cardService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una carta específica' })
  @ApiParam({ name: 'id', description: 'ID de la carta' })
  @ApiResponse({
    status: 200,
    description: 'Carta encontrada',
    type: TarotCard,
  })
  @ApiResponse({ status: 404, description: 'Carta no encontrada' })
  async getCardById(@Param('id', ParseIntPipe) id: number) {
    return this.cardService.findById(id);
  }

  @Get('deck/:deckId')
  @ApiOperation({ summary: 'Obtener todas las cartas de un mazo específico' })
  @ApiParam({ name: 'deckId', description: 'ID del mazo' })
  @ApiResponse({
    status: 200,
    description: 'Lista de cartas del mazo',
    type: [TarotCard],
  })
  @ApiResponse({ status: 404, description: 'Mazo no encontrado' })
  async getCardsByDeck(@Param('deckId', ParseIntPipe) deckId: number) {
    return this.cardService.findByDeck(deckId);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear una nueva carta (solo admin)' })
  @ApiResponse({
    status: 201,
    description: 'Carta creada con éxito',
    type: TarotCard,
  })
  @ApiResponse({
    status: 403,
    description: 'Acceso denegado - Solo administradores',
  })
  async createCard(@Request() req, @Body() createCardDto: CreateCardDto) {
    if (!req.user.isAdmin) {
      throw new ForbiddenException('Solo administradores pueden crear cartas');
    }
    return this.cardService.create(createCardDto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar una carta (solo admin)' })
  @ApiParam({ name: 'id', description: 'ID de la carta a actualizar' })
  @ApiResponse({
    status: 200,
    description: 'Carta actualizada con éxito',
    type: TarotCard,
  })
  @ApiResponse({
    status: 403,
    description: 'Acceso denegado - Solo administradores',
  })
  async updateCard(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCardDto: UpdateCardDto,
  ) {
    if (!req.user.isAdmin) {
      throw new ForbiddenException(
        'Solo administradores pueden actualizar cartas',
      );
    }
    return this.cardService.update(id, updateCardDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Eliminar una carta (solo admin)' })
  @ApiParam({ name: 'id', description: 'ID de la carta a eliminar' })
  @ApiResponse({ status: 200, description: 'Carta eliminada con éxito' })
  @ApiResponse({
    status: 403,
    description: 'Acceso denegado - Solo administradores',
  })
  async removeCard(@Request() req, @Param('id', ParseIntPipe) id: number) {
    if (!req.user.isAdmin) {
      throw new ForbiddenException(
        'Solo administradores pueden eliminar cartas',
      );
    }
    await this.cardService.remove(id);
    return { message: 'Carta eliminada con éxito' };
  }
}
