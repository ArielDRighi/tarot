import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TarotCard } from './entities/tarot-card.entity';
import { TarotReading } from './entities/tarot-reading.entity';
import { TarotSpread } from './entities/tarot-spread.entity';
import { User } from '../users/entities/user.entity';
import { CreateReadingDto } from './dto/create-reading.dto';
import { CreateSpreadDto } from './dto/create-spread.dto';
import { RandomCardsDto } from './dto/random-cards.dto';
import { DeckService } from './deck.service';
import { InterpretationService } from './interpretation.service';

@Injectable()
export class TarotService {
  constructor(
    @InjectRepository(TarotCard)
    private cardRepository: Repository<TarotCard>,
    @InjectRepository(TarotReading)
    private readingRepository: Repository<TarotReading>,
    @InjectRepository(TarotSpread)
    private spreadRepository: Repository<TarotSpread>,
    private deckService: DeckService,
    private interpretationService: InterpretationService,
  ) {}

  // Métodos para gestionar tiradas (spreads)
  async createSpread(createSpreadDto: CreateSpreadDto): Promise<TarotSpread> {
    const spread = this.spreadRepository.create(createSpreadDto);
    return this.spreadRepository.save(spread);
  }

  async findAllSpreads(): Promise<TarotSpread[]> {
    return this.spreadRepository.find();
  }

  async findSpreadById(id: number): Promise<TarotSpread> {
    const spread = await this.spreadRepository.findOne({ where: { id } });
    if (!spread) {
      throw new NotFoundException(`Tirada con ID ${id} no encontrada`);
    }
    return spread;
  }

  // Método para obtener cartas aleatorias
  async getRandomCards(options: RandomCardsDto): Promise<TarotCard[]> {
    const { count = 3, deckId } = options;

    let query = this.cardRepository.createQueryBuilder('card');

    // Filtrar por mazo si se proporciona un ID
    if (deckId) {
      await this.deckService.findDeckById(deckId); // Verifica que el mazo exista
      query = query.where('card.deckId = :deckId', { deckId });
    }

    // Obtener todas las cartas del mazo o de todos los mazos
    const cards = await query.getMany();

    if (cards.length < count) {
      throw new BadRequestException(
        `No hay suficientes cartas disponibles. Se solicitaron ${count} pero solo hay ${cards.length}.`,
      );
    }

    // Mezclar las cartas y tomar la cantidad solicitada
    return this.shuffleArray([...cards]).slice(0, count);
  }

  // Método auxiliar para mezclar un array (cartas)
  private shuffleArray<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  // Métodos para gestionar lecturas
  async createReading(
    userId: number,
    createReadingDto: CreateReadingDto,
  ): Promise<TarotReading> {
    // Verificar que existe el mazo
    const deck = await this.deckService.findDeckById(createReadingDto.deckId);

    // Verificar que existe la tirada
    const spread = await this.findSpreadById(createReadingDto.spreadId);

    // Verificar que la cantidad de cartas seleccionadas coincide con la tirada
    if (createReadingDto.cardIds.length !== spread.cardCount) {
      throw new BadRequestException(
        `La tirada "${spread.name}" requiere exactamente ${spread.cardCount} cartas, pero se seleccionaron ${createReadingDto.cardIds.length}.`,
      );
    }

    // Obtener las cartas seleccionadas
    const cards = await Promise.all(
      createReadingDto.cardIds.map((id) => this.deckService.findCardById(id)),
    );

    // Crear la nueva lectura
    const reading = this.readingRepository.create({
      question: createReadingDto.question,
      user: { id: userId } as User,
      deck,
      cards,
      cardPositions: createReadingDto.cardPositions,
    });

    // Generar interpretación si se solicita
    if (createReadingDto.generateInterpretation) {
      const interpretation =
        await this.interpretationService.generateInterpretation(
          cards,
          createReadingDto.cardPositions,
          createReadingDto.question,
          spread,
        );

      reading.interpretation = interpretation;
    }

    return this.readingRepository.save(reading);
  }

  async findUserReadings(userId: number): Promise<TarotReading[]> {
    return this.readingRepository.find({
      where: { user: { id: userId } },
      relations: ['cards', 'deck', 'user'],
      order: { createdAt: 'DESC' },
    });
  }

  async findReadingById(
    id: number,
    userId?: number,
    isAdmin?: boolean,
  ): Promise<TarotReading> {
    const reading = await this.readingRepository.findOne({
      where: { id },
      relations: ['cards', 'deck', 'user'],
    });

    if (!reading) {
      throw new NotFoundException(`Lectura con ID ${id} no encontrada`);
    }

    // Verificar permisos solo si se proporcionan userId e isAdmin
    if (userId !== undefined && isAdmin !== undefined) {
      // Solo permitir acceso al usuario que creó la lectura o a administradores
      if (reading.user.id !== userId && !isAdmin) {
        throw new ForbiddenException(
          'No tienes permiso para acceder a esta lectura',
        );
      }
    }

    return reading;
  }

  async updateReading(
    id: number,
    updateData: Partial<TarotReading>,
  ): Promise<TarotReading> {
    const reading = await this.findReadingById(id);

    // Actualizar solo los campos proporcionados
    Object.assign(reading, updateData);

    // Guardar los cambios
    return this.readingRepository.save(reading);
  }

  // Método auxiliar para encontrar una carta por ID (delegando a DeckService)
  async findCardById(id: number): Promise<TarotCard> {
    return this.deckService.findCardById(id);
  }

  // Método para enviar una lectura por correo
  async shareReadingByEmail(
    readingId: number,
    emailDetails: {
      recipientEmail: string;
      subject?: string;
      additionalMessage?: string;
    },
    userId: number,
  ) {
    // Verificar que el usuario tiene acceso a esta lectura
    const reading = await this.findReadingById(readingId, userId);

    // Aquí implementarías la lógica para enviar el email
    // Esto es un placeholder - en una implementación real, usarías un servicio de email
    console.log(
      `Enviando lectura ${readingId} a ${emailDetails.recipientEmail}`,
    );

    return {
      success: true,
      message: `Lectura enviada a ${emailDetails.recipientEmail}`,
    };
  }

  // Método para compartir en redes sociales (placeholder)
  async shareReadingSocial(
    readingId: number,
    socialNetwork: string,
    userId: number,
  ) {
    // Verificar que el usuario tiene acceso a esta lectura
    const reading = await this.findReadingById(readingId, userId);

    // Placeholder para la funcionalidad de compartir en redes sociales
    return {
      success: true,
      message: `Compartido en ${socialNetwork}`,
      shareUrl: `https://example.com/share/${readingId}`,
    };
  }
}
