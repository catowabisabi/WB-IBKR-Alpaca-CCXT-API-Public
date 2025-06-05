import { Module,OnModuleInit } from '@nestjs/common';
import { UserSettingsService } from './user-settings.service';
import { UserSettingsController } from './user-settings.controller';
import { UsersService } from '../users/users.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../mongodb/models/users.model';  // 导入 User 和 UserSchema
import { UserValidationModule } from '../user-validation/user-validation.module';
import { MongodbModule } from '../mongodb/mongodb.module';





@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]) ,
    UserValidationModule,
    MongodbModule
], // 使用导入的 User 和 UserSchema;,
  providers:[UserSettingsService, UsersService,],
  controllers: [UserSettingsController],
  exports:[UserSettingsService]
})


export class UserSettingsModule implements OnModuleInit {
  constructor(private userSettingsService: UserSettingsService) {}

  async onModuleInit(): Promise<void> {
    //await this.userSettingsService.init(process.env.USER);
  }
}