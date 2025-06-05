import { Injectable ,BadRequestException, forwardRef, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../mongodb/models/users.model';
import { MongodbService } from '../mongodb/mongodb.service';

@Injectable()
export class UserValidationService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>,
  @Inject(forwardRef(() => MongodbService)) private mongodbService: MongodbService
) {}

  async validateUser(username: string, email: string): Promise<void> {
    if (!this.isValidUsername(username)) {
      throw new BadRequestException('無效的使用者名稱格式。使用者名稱必須為3到50個字元,只能包含字母、數字、底線和連字號。');
    }

    if (!this.isValidEmail(email)) {
      throw new BadRequestException('無效的電子郵件格式。');
    }

    const existingUserByUsername = await this.mongodbService.findUserByUsername(username);
    if (existingUserByUsername) {
      throw new BadRequestException('使用者名稱已被使用。');
    }

    const existingUserByEmail = await this.mongodbService.findUserByEmail(email);
    if (existingUserByEmail) {
      throw new BadRequestException('電子郵件已被註冊。');
    }
  }

  private isValidUsername(username: string): boolean {
    const usernameRegex = /^[a-zA-Z0-9_-]{3,50}$/;
    return usernameRegex.test(username);
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  
}