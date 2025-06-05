import { Controller, Post, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { AdminApiKeyGuard } from '../guards/app-api-key.guard';
import { TelegramService } from './telegram.service';
import { ApiTags, ApiOperation, ApiBody, ApiResponse, ApiSecurity, ApiBearerAuth } from '@nestjs/swagger';
import { ApiProperty } from '@nestjs/swagger';

// Define a DTO for the request body for better Swagger documentation
class SendMessageDto {
  @ApiProperty({ example: '123456789', description: 'The chat ID to send the message to.' })
  chatId: string;

  @ApiProperty({ example: 'Hello from the API!', description: 'The message content.' })
  msg: string;
}

@ApiTags('Telegram')
@ApiBearerAuth('JWT-auth')
@ApiSecurity('X-API-Key') // Assuming ApiKeyGuard uses a security scheme named 'ApiKeyAuth'
@UseGuards(AdminApiKeyGuard)
@Controller('telegram')
export class TelegramController {
  constructor(private readonly telegramService: TelegramService) {}

  @Post('send')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send a Telegram message', description: 'Sends a message to the specified Telegram chat ID.' })
  @ApiBody({ type: SendMessageDto })
  @ApiResponse({ status: HttpStatus.OK, description: 'Message sent successfully.' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid request body (e.g., missing chatId or msg).' })
  @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Failed to send message via Telegram.' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'API Key is missing or invalid.' })
  async sendMessage(@Body() body: SendMessageDto) { // Changed to use SendMessageDto
    // The service method sendMessage is void, so this likely returns nothing or a confirmation
    // For Swagger, if it returns nothing on success, 204 No Content might be more appropriate, 
    // or a 200 OK with a simple success message object.
    // Assuming service might throw errors which will be handled by NestJS default exception filter.
    await this.telegramService.sendMessage(body.chatId, body.msg);
    return { message: 'Message processing initiated.' }; // Or return nothing if service is truly fire-and-forget
  }
}