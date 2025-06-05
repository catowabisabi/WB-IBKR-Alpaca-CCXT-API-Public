import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { GoogleStrategy } from './strategies/google.strategy';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../mongodb/models/users.model';
import { MongodbModule } from '../mongodb/mongodb.module';
import { UsersService } from '../users/users.service';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { UserValidationModule } from '../user-validation/user-validation.module';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]) ,
    UserValidationModule,
    MongodbModule,
    JwtModule.register({
      secret: process.env.JWT_KEY,
      signOptions: { expiresIn: '2000h' },
    }),
    
],
  controllers: [AuthController],
  providers: [AuthService, UsersService, GoogleStrategy, JwtStrategy],
  exports:[AuthService]
})
export class AuthModule {}
