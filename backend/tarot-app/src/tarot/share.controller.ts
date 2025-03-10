import {
  Controller,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TarotService } from './tarot.service';

class ShareEmailDto {
  recipientEmail: string;
  subject?: string;
  additionalMessage?: string;
}

class ShareSocialDto {
  network: string; // facebook, twitter, etc.
  message?: string;
}

@ApiTags('Compartir Lecturas')
@Controller('readings/:id/share')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ShareController {
  constructor(private tarotService: TarotService) {}

  @Post('email')
  @ApiOperation({
    summary: 'Compartir lectura por email',
    description:
      'Envía la interpretación de una lectura a un correo electrónico',
  })
  @ApiParam({ name: 'id', description: 'ID de la lectura a compartir' })
  @ApiBody({ type: ShareEmailDto })
  async shareByEmail(
    @Param('id', ParseIntPipe) id: number,
    @Body() emailDto: ShareEmailDto,
    @Request() req,
  ) {
    const userId = req.user.userId;
    return this.tarotService.shareReadingByEmail(id, emailDto, userId);
  }

  @Post('social')
  @ApiOperation({
    summary: 'Compartir lectura en redes sociales',
    description: 'Comparte la interpretación en una red social',
  })
  @ApiParam({ name: 'id', description: 'ID de la lectura a compartir' })
  @ApiBody({ type: ShareSocialDto })
  async shareSocial(
    @Param('id', ParseIntPipe) id: number,
    @Body() socialDto: ShareSocialDto,
    @Request() req,
  ) {
    const userId = req.user.userId;
    return this.tarotService.shareReadingSocial(id, socialDto.network, userId);
  }
}
