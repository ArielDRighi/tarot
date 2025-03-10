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
import { TarotDeck } from './entities/tarot-deck.entity';

@ApiTags('Mazos')
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
}
