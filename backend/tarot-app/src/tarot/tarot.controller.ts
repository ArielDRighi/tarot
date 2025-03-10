import { Controller, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TarotService } from './tarot.service';

@ApiTags('Tarot')
@Controller('tarot')
export class TarotController {
  constructor(private readonly tarotService: TarotService) {}

  // Se han eliminado todos los endpoints para repensar la lógica
  // Aquí puedes agregar tus nuevos endpoints
}
