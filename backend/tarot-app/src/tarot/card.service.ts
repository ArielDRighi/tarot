import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TarotCard } from './entities/tarot-card.entity';
import { TarotDeck } from './entities/tarot-deck.entity';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';

@Injectable()
export class CardService {
  constructor(
    @InjectRepository(TarotCard)
    private cardRepository: Repository<TarotCard>,
    @InjectRepository(TarotDeck)
    private deckRepository: Repository<TarotDeck>,
  ) {}

  async findAll(): Promise<TarotCard[]> {
    return this.cardRepository.find({ relations: ['deck'] });
  }

  async findById(id: number): Promise<TarotCard> {
    const card = await this.cardRepository.findOne({
      where: { id },
      relations: ['deck'],
    });

    if (!card) {
      throw new NotFoundException(`Carta con ID ${id} no encontrada`);
    }

    return card;
  }

  async findByDeck(deckId: number): Promise<TarotCard[]> {
    // Verificar que el mazo existe
    const deck = await this.deckRepository.findOne({ where: { id: deckId } });
    if (!deck) {
      throw new NotFoundException(`Mazo con ID ${deckId} no encontrado`);
    }

    return this.cardRepository.find({
      where: { deckId },
      relations: ['deck'],
    });
  }

  async create(createCardDto: CreateCardDto): Promise<TarotCard> {
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
        deckId: createCardDto.deckId,
      },
    });

    if (existingCard) {
      throw new ConflictException(
        `Ya existe una carta con el nombre '${createCardDto.name}' en este mazo`,
      );
    }

    const card = this.cardRepository.create(createCardDto);
    return this.cardRepository.save(card);
  }

  async update(id: number, updateCardDto: UpdateCardDto): Promise<TarotCard> {
    const card = await this.findById(id);
    Object.assign(card, updateCardDto);
    return this.cardRepository.save(card);
  }

  async remove(id: number): Promise<void> {
    const result = await this.cardRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Carta con ID ${id} no encontrada`);
    }
  }
}
