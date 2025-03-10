import { Controller, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { InterpretationService } from './interpretation.service';
import { TarotService } from './tarot.service';

@ApiTags('Interpretaciones')
@Controller('interpretations')
export class InterpretationController {
  constructor(
    private interpretationService: InterpretationService,
    private tarotService: TarotService,
  ) {}

  // Se han eliminado todos los endpoints para repensar la lógica
  // Aquí puedes agregar tus nuevos endpoints
}
