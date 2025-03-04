import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TarotDeck } from './entities/tarot-deck.entity';
import { TarotCard } from './entities/tarot-card.entity';
import { CreateDeckDto } from './dto/create-deck.dto';
import { UpdateDeckDto } from './dto/update-deck.dto';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';

@Injectable()
export class DeckService {
  constructor(
    @InjectRepository(TarotDeck)
    private deckRepository: Repository<TarotDeck>,
    @InjectRepository(TarotCard)
    private cardRepository: Repository<TarotCard>,
  ) {}

  // Métodos para gestionar mazos
  async createDeck(createDeckDto: CreateDeckDto): Promise<TarotDeck> {
    // Verificar si ya existe un mazo con el mismo nombre
    const existingDeck = await this.deckRepository.findOne({
      where: { name: createDeckDto.name },
    });

    if (existingDeck) {
      throw new ConflictException(
        `Ya existe un mazo con el nombre: ${createDeckDto.name}`,
      );
    }

    const deck = this.deckRepository.create(createDeckDto);

    try {
      return await this.deckRepository.save(deck);
    } catch (error) {
      throw new InternalServerErrorException(
        'Error al crear el mazo de tarot',
        error.message,
      );
    }
  }

  async findAllDecks(): Promise<TarotDeck[]> {
    return this.deckRepository.find();
  }

  async findDeckById(id: number): Promise<TarotDeck> {
    const deck = await this.deckRepository.findOne({
      where: { id },
      relations: ['cards'],
    });

    if (!deck) {
      throw new NotFoundException(`Mazo con ID ${id} no encontrado`);
    }

    return deck;
  }

  async updateDeck(
    id: number,
    updateDeckDto: UpdateDeckDto,
  ): Promise<TarotDeck> {
    const deck = await this.findDeckById(id);

    // Verificar si el nuevo nombre ya existe (si se está modificando)
    if (updateDeckDto.name && updateDeckDto.name !== deck.name) {
      const existingDeck = await this.deckRepository.findOne({
        where: { name: updateDeckDto.name },
      });

      if (existingDeck) {
        throw new ConflictException(
          `Ya existe un mazo con el nombre: ${updateDeckDto.name}`,
        );
      }
    }

    // Actualizar propiedades
    Object.assign(deck, updateDeckDto);

    try {
      return await this.deckRepository.save(deck);
    } catch (error) {
      throw new InternalServerErrorException(
        'Error al actualizar el mazo de tarot',
        error.message,
      );
    }
  }

  async removeDeck(id: number): Promise<void> {
    const result = await this.deckRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`Mazo con ID ${id} no encontrado`);
    }
  }

  // Métodos para gestionar cartas dentro de un mazo
  async createCard(createCardDto: CreateCardDto): Promise<TarotCard> {
    // Verificar que el mazo existe
    const deck = await this.deckRepository.findOne({
      where: { id: createCardDto.deckId },
    });

    if (!deck) {
      throw new NotFoundException(
        `Mazo con ID ${createCardDto.deckId} no encontrado`,
      );
    }

    // Verificar si ya existe una carta con el mismo nombre en el mazo
    const existingCard = await this.cardRepository.findOne({
      where: {
        name: createCardDto.name,
        deck: { id: createCardDto.deckId },
      },
      relations: ['deck'],
    });

    if (existingCard) {
      throw new ConflictException(
        `Ya existe una carta con el nombre '${createCardDto.name}' en este mazo`,
      );
    }

    const card = this.cardRepository.create({
      ...createCardDto,
      deck,
    });

    try {
      return await this.cardRepository.save(card);
    } catch (error) {
      throw new InternalServerErrorException(
        'Error al crear la carta de tarot',
        error.message,
      );
    }
  }

  async findAllCards(): Promise<TarotCard[]> {
    return this.cardRepository.find({ relations: ['deck'] });
  }

  async findCardsByDeck(deckId: number): Promise<TarotCard[]> {
    // Verificar que el mazo existe
    await this.findDeckById(deckId);

    return this.cardRepository.find({
      where: { deck: { id: deckId } },
      relations: ['deck'],
    });
  }

  async findCardById(id: number): Promise<TarotCard> {
    const card = await this.cardRepository.findOne({
      where: { id },
      relations: ['deck'],
    });

    if (!card) {
      throw new NotFoundException(`Carta con ID ${id} no encontrada`);
    }

    return card;
  }

  async updateCard(
    id: number,
    updateCardDto: UpdateCardDto,
  ): Promise<TarotCard> {
    const card = await this.findCardById(id);

    // Actualizar propiedades
    Object.assign(card, updateCardDto);

    try {
      return await this.cardRepository.save(card);
    } catch (error) {
      throw new InternalServerErrorException(
        'Error al actualizar la carta de tarot',
        error.message,
      );
    }
  }

  async removeCard(id: number): Promise<void> {
    const result = await this.cardRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`Carta con ID ${id} no encontrada`);
    }
  }
}
