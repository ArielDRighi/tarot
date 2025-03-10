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
import { CardController } from './card.controller';
import { CardService } from './card.service';
import { ReadingController } from './reading.controller';
import { ShareController } from './share.controller';

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
  controllers: [
    TarotController,
    DeckController,
    CardController,
    InterpretationController,
    ReadingController,
    ShareController,
  ],
  providers: [TarotService, DeckService, CardService, InterpretationService],
  exports: [TarotService, DeckService, CardService, InterpretationService],
})
export class TarotModule {}
