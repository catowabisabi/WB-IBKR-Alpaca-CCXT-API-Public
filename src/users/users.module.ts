import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User, UserSchema } from '../mongodb/models/users.model';
import { UserValidationService } from '../user-validation/user-validation.service';
import { MongodbModule } from '../mongodb/mongodb.module';
import { UserValidationModule } from '../user-validation/user-validation.module';


@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    UserValidationModule,
    MongodbModule
  ],
  providers: [UsersService, UserValidationService],
  controllers: [UsersController],
  exports:[UsersService]
})
export class UsersModule {}