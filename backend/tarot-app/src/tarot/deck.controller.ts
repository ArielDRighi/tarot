import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
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
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DeckService } from './deck.service';
import { CreateDeckDto } from './dto/create-deck.dto';
import { UpdateDeckDto } from './dto/update-deck.dto';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { TarotDeck } from './entities/tarot-deck.entity';
import { TarotCard } from './entities/tarot-card.entity';

@ApiTags('Mazos y Cartas')
@Controller('decks')
export class DeckController {
  constructor(private readonly deckService: DeckService) {}

  // Endpoints para mazos
  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear un nuevo mazo (solo admin)' })
  @ApiResponse({
    status: 201,
    description: 'Mazo creado con éxito',
    type: TarotDeck,
  })
  @ApiResponse({
    status: 403,
    description: 'Acceso denegado - Solo administradores',
  })
  async createDeck(@Request() req, @Body() createDeckDto: CreateDeckDto) {
    // Verificar si es administrador
    if (!req.user.isAdmin) {
      throw new ForbiddenException('Solo administradores pueden crear mazos');
    }
    return this.deckService.createDeck(createDeckDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los mazos disponibles' })
  @ApiResponse({
    status: 200,
    description: 'Lista de mazos',
    type: [TarotDeck],
  })
  async getAllDecks() {
    return this.deckService.findAllDecks();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un mazo específico' })
  @ApiParam({ name: 'id', description: 'ID del mazo' })
  @ApiResponse({ status: 200, description: 'Mazo encontrado', type: TarotDeck })
  @ApiResponse({ status: 404, description: 'Mazo no encontrado' })
  async getDeckById(@Param('id', ParseIntPipe) id: number) {
    return this.deckService.findDeckById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar un mazo (solo admin)' })
  @ApiParam({ name: 'id', description: 'ID del mazo a actualizar' })
  @ApiResponse({
    status: 200,
    description: 'Mazo actualizado con éxito',
    type: TarotDeck,
  })
  @ApiResponse({
    status: 403,
    description: 'Acceso denegado - Solo administradores',
  })
  @ApiResponse({ status: 404, description: 'Mazo no encontrado' })
  async updateDeck(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDeckDto: UpdateDeckDto,
  ) {
    // Verificar si es administrador
    if (!req.user.isAdmin) {
      throw new ForbiddenException(
        'Solo administradores pueden actualizar mazos',
      );
    }
    return this.deckService.updateDeck(id, updateDeckDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Eliminar un mazo (solo admin)' })
  @ApiParam({ name: 'id', description: 'ID del mazo a eliminar' })
  @ApiResponse({ status: 200, description: 'Mazo eliminado con éxito' })
  @ApiResponse({
    status: 403,
    description: 'Acceso denegado - Solo administradores',
  })
  @ApiResponse({ status: 404, description: 'Mazo no encontrado' })
  async removeDeck(@Request() req, @Param('id', ParseIntPipe) id: number) {
    // Verificar si es administrador
    if (!req.user.isAdmin) {
      throw new ForbiddenException(
        'Solo administradores pueden eliminar mazos',
      );
    }
    await this.deckService.removeDeck(id);
    return { message: 'Mazo eliminado con éxito' };
  }

  // Endpoints para cartas
  @UseGuards(JwtAuthGuard)
  @Post('cards')
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
    // Verificar si es administrador
    if (!req.user.isAdmin) {
      throw new ForbiddenException('Solo administradores pueden crear cartas');
    }
    return this.deckService.createCard(createCardDto);
  }

  @Get('cards')
  @ApiOperation({ summary: 'Obtener todas las cartas' })
  @ApiResponse({
    status: 200,
    description: 'Lista de todas las cartas',
    type: [TarotCard],
  })
  async getAllCards() {
    return this.deckService.findAllCards();
  }

  @Get(':id/cards')
  @ApiOperation({ summary: 'Obtener todas las cartas de un mazo específico' })
  @ApiParam({ name: 'id', description: 'ID del mazo' })
  @ApiResponse({
    status: 200,
    description: 'Lista de cartas del mazo',
    type: [TarotCard],
  })
  @ApiResponse({ status: 404, description: 'Mazo no encontrado' })
  async getCardsByDeck(@Param('id', ParseIntPipe) id: number) {
    return this.deckService.findCardsByDeck(id);
  }

  @Get('cards/:id')
  @ApiOperation({ summary: 'Obtener una carta específica' })
  @ApiParam({ name: 'id', description: 'ID de la carta' })
  @ApiResponse({
    status: 200,
    description: 'Carta encontrada',
    type: TarotCard,
  })
  @ApiResponse({ status: 404, description: 'Carta no encontrada' })
  async getCardById(@Param('id', ParseIntPipe) id: number) {
    return this.deckService.findCardById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('cards/:id')
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
  @ApiResponse({ status: 404, description: 'Carta no encontrada' })
  async updateCard(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCardDto: UpdateCardDto,
  ) {
    // Verificar si es administrador
    if (!req.user.isAdmin) {
      throw new ForbiddenException(
        'Solo administradores pueden actualizar cartas',
      );
    }
    return this.deckService.updateCard(id, updateCardDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('cards/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Eliminar una carta (solo admin)' })
  @ApiParam({ name: 'id', description: 'ID de la carta a eliminar' })
  @ApiResponse({ status: 200, description: 'Carta eliminada con éxito' })
  @ApiResponse({
    status: 403,
    description: 'Acceso denegado - Solo administradores',
  })
  @ApiResponse({ status: 404, description: 'Carta no encontrada' })
  async removeCard(@Request() req, @Param('id', ParseIntPipe) id: number) {
    // Verificar si es administrador
    if (!req.user.isAdmin) {
      throw new ForbiddenException(
        'Solo administradores pueden eliminar cartas',
      );
    }
    await this.deckService.removeCard(id);
    return { message: 'Carta eliminada con éxito' };
  }
}
