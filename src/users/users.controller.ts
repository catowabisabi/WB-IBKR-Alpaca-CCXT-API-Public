import { Controller, Get, Post, Body, Param, HttpCode, HttpStatus, Patch, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { User, Settings } from '../mongodb/models/users.model';  // 確保導入 Settings
import { UserDto } from './dto/user.dto';
import { AdminApiKeyGuard } from 'src/guards/app-api-key.guard';
import { ApiTags, ApiOperation, ApiParam, ApiBody, ApiResponse, ApiSecurity, ApiBearerAuth } from '@nestjs/swagger';

@ApiSecurity('X-API-Key')//this is admin api key
@ApiBearerAuth('JWT-auth')
@ApiTags('Users')
@UseGuards(AdminApiKeyGuard)
@Controller('users')
export class UsersController {
  constructor(
    private usersService: UsersService,
  
  ) {}

  @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Create a new user', description: 'Creates a new user with provided username, email, and settings.' })
    @ApiBody({
      description: 'User creation payload',
      schema: {
        type: 'object',
        properties: {
          username: { type: 'string', example: 'john_doe' },
          email: { type: 'string', example: 'john.doe@example.com' },
          settings: { type: 'object', /* Define Settings properties here if needed or reference a DTO */ },
        },
        required: ['username', 'email', 'settings'],
      },
    })
    @ApiResponse({ status: HttpStatus.CREATED, description: 'User created successfully.', type: UserDto })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input data.' })
    async createUser(@Body() createUserDto: { username: string; email: string; settings: Settings }): Promise<UserDto> {
        return this.usersService.createUser(createUserDto.username, createUserDto.email, createUserDto.settings);
    }

  @Get(':username')
  @ApiOperation({ summary: 'Get user by username', description: 'Retrieves a user by their username.' })
  @ApiParam({ name: 'username', type: 'string', description: 'The username of the user to retrieve' })
  @ApiResponse({ status: HttpStatus.OK, description: 'User found.', type: UserDto })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found.' })
  async getUserByUsername(@Param('username') username: string): Promise<UserDto | undefined> {
    return this.usersService.findUserByUsername(username);
  }

  @Get(':identifier/settings')
  @ApiOperation({ summary: 'Get user settings by username or email', description: 'Retrieves user settings using either username or email as an identifier.' })
  @ApiParam({ name: 'identifier', type: 'string', description: 'Username or email of the user' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Settings found.', /* Consider creating a SettingsDto and using type: SettingsDto */ schema: { type: 'object'} })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found.' })
  async getSettingsByUsernameOrEmail(@Param('identifier') identifier: string): Promise<Settings> {
    // Decode the URL-encoded identifier
    const decodedIdentifier = decodeURIComponent(identifier);
    return this.usersService.findSettingsByUsernameOrEmail(decodedIdentifier);
  }


/*   @Patch('settings')
async updateSettingsByUsernameOrEmail(
  @Body() userIdOrEmail:string, newSettings: Partial<Settings>,
): Promise<Settings> {
  return this.usersService.updateSettingsByUsernameOrEmail(userIdOrEmail, newSettings);
} */

@Patch('settings/:identifier')
@ApiOperation({ summary: 'Update user settings', description: 'Updates settings for a user identified by username or email.' })
@ApiParam({ name: 'identifier', type: 'string', description: 'Username or email of the user' })
@ApiBody({
  description: 'Partial settings to update',
  schema: { 
    type: 'object', 
    // Define Partial<Settings> properties here or reference a DTO
    example: { useFixAmount: true, fixAmountPrice: 100 }
  }
})
@ApiResponse({ status: HttpStatus.OK, description: 'Settings updated successfully.', /* Consider SettingsDto */ schema: { type: 'object'} })
@ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found.' })
@ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid settings data.' })
async updateSettingsByUsernameOrEmail(@Param('identifier') identifier: string, @Body() newSettings: Partial<Settings>): Promise<Settings> {
  return this.usersService.updateSettingsByUsernameOrEmail(identifier, newSettings);
}

@Patch('set-password/:identifier')
@ApiOperation({ summary: 'Update user password', description: 'Updates the password for a user identified by username or email.' })
@ApiParam({ name: 'identifier', type: 'string', description: 'Username or email of the user' })
@ApiBody({
  description: 'User partial data including new password',
  schema: { 
    type: 'object', 
    properties: { password: { type: 'string', example: 'newSecurePassword123' } },
    // Add other Partial<User> properties if they can be updated via this endpoint
  }
})
@ApiResponse({ status: HttpStatus.OK, description: 'Password updated successfully.', type: UserDto })
@ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found.' })
@ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid data for password update.' })
async updatePasswordByUsernameOrEmail(@Param('identifier') identifier: string, @Body() newUser: Partial<User>): Promise<UserDto> {
  return this.usersService.updatePasswordByUsernameOrEmail(identifier, newUser);
}


}
