import { Controller, Get, Post, Patch, Param, Body, UseGuards, Query, BadRequestException, HttpCode, HttpStatus, Req } from '@nestjs/common';
import { UserSettingsService } from './user-settings.service';
import { JwtAuthGuard } from '../auth/guards/jwt_auth.guard';
import { Keys, Settings } from '../mongodb/models/users.model';
import { AdminApiKeyGuard } from 'src/guards/app-api-key.guard';
import { ApiTags, ApiOperation, ApiParam, ApiQuery, ApiBody, ApiResponse, ApiBearerAuth, ApiSecurity } from '@nestjs/swagger';
import { Request } from 'express';

@ApiSecurity('X-API-Key')
@ApiBearerAuth('JWT-auth')
@ApiTags('User Settings')
@Controller('user-settings')
export class UserSettingsController {
  constructor(private readonly userSettingsService: UserSettingsService) {}

  // 獲取完整設置（不包括 keys）
  @Get('mysettings')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all settings for the authenticated user', description: 'Retrieves all settings (excluding API keys) for the user identified by the JWT token.' })
  @ApiResponse({ status: HttpStatus.OK, description: 'User settings retrieved successfully.', schema: { $ref: '#/components/schemas/Settings' } })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User or settings not found.' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized.' })
  async getSettings(@Req() request: Request): Promise<Settings> {
    const user = request.user as { userId: string; email: string };
    return this.userSettingsService.findSettingsByUsernameOrEmail(user.email);
  }

  // 獲取單個設置
  @Get('mysettings/:setting')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get a specific setting for the authenticated user', description: 'Retrieves a single setting value by its key for the user identified by JWT.' })
  @ApiParam({ name: 'setting', type: 'string', description: 'The key of the setting to retrieve (e.g., useFixAmount)', example: 'useFixAmount' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Setting value retrieved successfully.', schema: { type: 'any' } })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Setting key not found.' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized.' })
  async getOneSetting(@Param('setting') settingKey: string, @Req() request: Request): Promise<any> {
    const user = request.user as { userId: string; email: string };
    return this.userSettingsService.findOneSetting(user.email, settingKey);
  }

  // 更新設置
  @Patch('mysettings')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update settings for the authenticated user', description: 'Updates one or more settings for the user identified by JWT.' })
  @ApiBody({ description: 'Partial settings to update.', schema: { $ref: '#/components/schemas/Settings' } /* Or provide a Partial<SettingsDto> */ })
  @ApiResponse({ status: HttpStatus.OK, description: 'Settings updated successfully.' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid settings data.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found.' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized.' })
  async updateSettings(@Req() request: Request, @Body() newSettings: Partial<Settings>): Promise<void> {
    const user = request.user as { userId: string; email: string };
    return this.userSettingsService.updateSettings(user.email, newSettings);
  }

  // 獲取 keys（僅用於授權用戶） 
  @Get('keys')
  @UseGuards(JwtAuthGuard) 
  @ApiOperation({ summary: "Get authenticated user's API keys", description: "Retrieves API keys for the currently authenticated user (requires JWT auth)." })
  @ApiResponse({ status: HttpStatus.OK, description: 'API keys retrieved successfully.', schema: { $ref: '#/components/schemas/Keys' } })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found.' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized.' })
  async getKeys(@Req() request: Request): Promise<Keys> {
    const user = request.user as { userId: string; email: string };
    const keys = await this.userSettingsService.getKeysOfUser(user.email);
    return keys;
  }

  // 更新 keys
  @Patch('keys')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Update user's API keys", description: "Updates API keys for the authenticated user (requires JWT auth)." })
  @ApiBody({
    description: "Payload to update API keys. It should be an object with a top-level 'keys' property which contains the partial API key data.",
    schema: {
      type: 'object',
      properties: {
        keys: {
          type: 'object',
          example: {
            binance: { key: 'new_binance_key', secret: 'new_binance_secret' },
            bybit: { key: 'new_bybit_key' }
          },
        }
      },
      required: ['keys']
    }
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'API keys updated successfully.', schema: { $ref: '#/components/schemas/Keys' } })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized.' })
  async updateKeys(@Body('keys') newKeys: Partial<Keys>, @Req() req): Promise<Keys> {
    // Get the user's email from the JWT token
    const userEmail = req.user.email;
    return this.userSettingsService.updateKeys(userEmail, newKeys);
  }
}


