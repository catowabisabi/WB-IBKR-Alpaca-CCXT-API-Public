import { Module } from '@nestjs/common';
import { UserValidationService } from './user-validation.service';
import { User, UserSchema } from '../mongodb/models/users.model'; // 確保路徑正確
import { MongooseModule } from '@nestjs/mongoose';
import { MongodbModule } from '../mongodb/mongodb.module';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]), // 正確配置 User 模型
        MongodbModule,  // 匯入 MongodbModule
      ],
    providers: [UserValidationService],
    exports: [UserValidationService]
})
export class UserValidationModule {}




