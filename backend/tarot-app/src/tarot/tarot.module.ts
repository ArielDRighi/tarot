import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { TarotCard } from './entities/tarot-card.entity';
import { TarotDeck } from './entities/tarot-deck.entity';
import { TarotReading } from './entities/tarot-reading.entity';
import { TarotSpread } from './entities/tarot-spread.entity';
import { TarotInterpretation } from './entities/tarot-interpretation.entity';
import { TarotService } from './tarot.service';
import { TarotController } from './tarot.controller';
import { DeckController } from './deck.controller';
import { DeckService } from './deck.service';
import { InterpretationService } from './interpretation.service';
import { InterpretationController } from './interpretation.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TarotCard,
      TarotDeck,
      TarotReading,
      TarotSpread,
      TarotInterpretation,
    ]),
    HttpModule,
    ConfigModule,
  ],
  controllers: [TarotController, DeckController, InterpretationController],
  providers: [TarotService, DeckService, InterpretationService],
  exports: [TarotService, DeckService, InterpretationService],
})
export class TarotModule {}
