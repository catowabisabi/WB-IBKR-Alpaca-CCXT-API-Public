import { Module } from '@nestjs/common';
import { AlpacaService } from './alpaca.service';
import { AlpacaController } from './alpaca.controller';
import { UserSettingsModule } from 'src/user-settings/user-settings.module';

import { MongooseModule } from '@nestjs/mongoose';
import { UserValidationModule } from 'src/user-validation/user-validation.module';
import { MongodbModule } from 'src/mongodb/mongodb.module';
import { User, UserSchema } from 'src/mongodb/models/users.model';


//直接連接ALPACA MARKET API
@Module({
  imports: [

    UserSettingsModule
], // 使用导入的 User 和 UserSchema;,
  
  controllers: [AlpacaController],
  providers: [AlpacaService, ],
})
export class AlpacaModule {}
