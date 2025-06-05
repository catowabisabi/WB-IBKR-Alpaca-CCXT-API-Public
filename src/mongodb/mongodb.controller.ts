import { Controller, Get, Post, Body, Param, Put, Query, UseGuards, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { MongodbService } from './mongodb.service';
import { CreateUsersDto } from './dto/create-users.dto';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { CreateTradeSignalDto } from './dto/create-trade-signal.dto';
import { TradeSignalIB } from './models/trade-signal-ib.model';
import { User, Settings } from './models/users.model'; // Assuming User and Settings are Mongoose models, consider DTOs for responses
import { UserDto } from './dto/user.dto';

import { JwtAuthGuard } from '../auth/guards/jwt_auth.guard';
import { Request } from 'express';
import { AdminApiKeyGuard } from '../guards/app-api-key.guard';
import { ApiTags, ApiOperation, ApiParam, ApiBody, ApiResponse, ApiQuery, ApiSecurity, ApiBearerAuth } from '@nestjs/swagger';


@ApiBearerAuth('JWT-auth')
@ApiSecurity('X-API-Key')
@ApiTags('MongoDB Operations')

@UseGuards(AdminApiKeyGuard)
@Controller('mongodb')
export class MongodbController {
  constructor(private readonly mongodbService: MongodbService) { }

  @Post('users')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a user (direct DB operation)', description: 'Directly creates a user in MongoDB. Typically, user creation should go through the auth/register endpoint.' })
  @ApiBody({ type: CreateUsersDto })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'User created successfully in DB.', type: CreateUsersDto })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid user data.' })
  async createUser(@Body() createUserDto: CreateUsersDto): Promise<User> {
    return this.mongodbService.createUser(createUserDto);
  }

  @Get('users/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '獲取用戶資訊', description: '根據用戶電子郵件獲取用戶資訊' })
  @ApiParam({ name: 'id', description: '用戶電子郵件' })
  @ApiResponse({ status: HttpStatus.OK, description: '成功獲取用戶資訊', type: UserDto })
  async getUser(@Param('id') email: string): Promise<User | null> {
    
    return this.mongodbService.findUserByEmail(email);
  }

  @Get('settings/:identifier')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Find user settings by username or email (direct DB operation)', description: 'Directly retrieves user settings by username or email from MongoDB.' })
  @ApiParam({ name: 'identifier', type: 'string', description: 'Username or email of the user' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Settings found.', type: Settings /* Consider SettingsDto */ })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User or settings not found.' })
  async findSettingsByUsernameOrEmail(@Param('identifier') identifier: string): Promise<Settings | undefined> {
    return this.mongodbService.findSettingsByUsernameOrEmail(identifier);
  }

  @Put('settings')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update user settings (direct DB operation)', description: 'Directly updates user settings in MongoDB based on the identifier in the DTO.' })
  @ApiBody({ type: UpdateSettingsDto })
  @ApiResponse({ status: HttpStatus.OK, description: 'Settings updated successfully.', type: Settings /* Consider SettingsDto */ })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found to update settings.' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid settings data.' })
  async updateSettingsByUsernameOrEmail(@Body() updateSettingsDto: UpdateSettingsDto): Promise<Settings> {
    return this.mongodbService.updateSettingsByUsernameOrEmail(updateSettingsDto);
  }

  @Post('trade-signals')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a trade signal (direct DB operation)', description: 'Directly creates a trade signal entry in MongoDB.' })
  @ApiBody({ type: CreateTradeSignalDto })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Trade signal created successfully.', schema: { $ref: '#/components/schemas/TradeSignal' } /* Replace with actual model/DTO if TradeSignal is defined */ })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid trade signal data.' })
  async createTradeSignal(@Body() createTradeSignalDto: CreateTradeSignalDto): Promise<any> { // Return type is TradeSignal, but not imported in this snippet
    return this.mongodbService.createTradeSignal(createTradeSignalDto);
  }

  @Get('trade-signals')
  @ApiBearerAuth() // JWT authentication for this specific endpoint
  @UseGuards(JwtAuthGuard) // Overrides the controller-level ApiKeyGuard for this endpoint
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Find trade signals for the authenticated user', description: 'Retrieves paginated trade signals for the authenticated user (identified by JWT), with optional filtering.' })
  @ApiQuery({ name: 'strategy', type: 'string', required: false, description: 'Filter by strategy name (case-insensitive regex match).' })
  @ApiQuery({ name: 'symbol', type: 'string', required: false, description: 'Filter by symbol (case-insensitive regex match).' })
  @ApiQuery({ name: 'strategyTimeFrame', type: 'string', required: false, description: 'Filter by strategy time frame (e.g., 1D, 4h).' })
  @ApiQuery({ name: 'currency', type: 'string', required: false, description: 'Filter by currency (e.g., USD).' })
  @ApiQuery({ name: 'startDate', type: 'string', format: 'date-time', required: false, description: 'Filter signals from this date (ISO format e.g., 2023-01-01).' })
  @ApiQuery({ name: 'endDate', type: 'string', format: 'date-time', required: false, description: 'Filter signals up to this date (ISO format e.g., 2023-12-31).' })
  @ApiQuery({ name: 'page', type: 'number', required: false, description: 'Page number for pagination.', example: 1, schema: { default: 1 } })
  @ApiQuery({ name: 'limit', type: 'number', required: false, description: 'Number of signals per page.', example: 10, schema: { default: 10 } })
  @ApiResponse({ status: HttpStatus.OK, description: 'Trade signals retrieved successfully.', schema: {
    type: 'object',
    properties: {
      signals: { type: 'array', items: { $ref: '#/components/schemas/TradeSignalIB' } }, // Assuming TradeSignalIB is the correct model for signals
      totalCount: { type: 'number' }
    }
  } })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'JWT token is missing or invalid.' })
  async findTradeSignalsByUser(
    @Req() request: Request,
    @Query('strategy') strategy?: string,
    @Query('symbol') symbol?: string,
    @Query('strategyTimeFrame') strategyTimeFrame?: string,
    @Query('currency') currency?: string,
    @Query('startDate') startDate?: Date,
    @Query('endDate') endDate?: Date,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ): Promise<{ signals: TradeSignalIB[], totalCount: number }> {
    const user = request.user as { email: string };
    const { signals, totalCount } = await this.mongodbService.findTradeSignalsByUsernameOrEmail(
      user.email,
      strategy,
      symbol,
      strategyTimeFrame,
      currency,
      startDate,
      endDate,
      page,
      limit,
    );
    return { signals, totalCount };
  }
  /*  现在可以使用以下 URL 模式来查询交易信号:

/mongodb/trade-signals/example@gmail.com?strategyTimeFrame=1D&currency=USD: 查找 example@gmail.com 的所有 1D 时间框架和 USD 货币的交易信号
/mongodb/trade-signals/example@gmail.com?startDate=2023-01-01&endDate=2023-12-31: 查找 example@gmail.com 在2023年的所有交易信号

你可以在前端收集用户的输入(如起始日期和结束日期),然后构造相应的 URL 来查询所需的交易信号。
请注意,这里的 startDate 和 endDate 是 Date 类型。在实际的 HTTP 请求中,你需要以 ISO 格式(如 '2023-01-01') 传递日期。NestJS 会自动将其转换为 Date 对象。 */
}