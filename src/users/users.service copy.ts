import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Settings, User, UserDocument } from '../mongodb/models/users.model';
import { UserValidationService } from '../user-validation/user-validation.service';

@Injectable()
export class UsersService {
    constructor(
      @InjectModel(User.name) 
      private userModel: Model<UserDocument> ,
      private userValidationService: UserValidationService
    ) {}

    //開新用戶 -> MongoDB
    async createUser(username: string, email: string, settings: Settings): Promise<User> {
      await this.userValidationService.validateUser(username, email);
      const newUser = new this.userModel({
          username,
          email,
          settings,
        });
        return newUser.save();
      }
      

    async findUserByUsername(username: string): Promise<User | undefined> {
      console.log('findUserByUsername...')
        return this.userModel.findOne({ username }).exec();
    }

    async findSettingsByUsernameOrEmail(identifier: string): Promise<Settings | undefined> {
        let user: User | undefined;
      
        // 检查标识符是否包含 "@" 符号,如果包含,则将其视为电子邮件
        if (identifier.includes('@')) {
          user = await this.userModel.findOne({ email: identifier }).exec();
        } else {
          user = await this.userModel.findOne({ username: identifier }).exec();
        }
      
        if (!user) {
          throw new NotFoundException('User not found');
        }
        
      
        return user.settings;
      }

      async updateSettingsByUsernameOrEmail(userIdOrEmail:string, newSettings: Partial<Settings>): Promise<Settings> {
        let user: UserDocument  | undefined;

        const identifier = userIdOrEmail;
      
        // 检查标识符是否包含 "@" 符号,如果包含,则将其视为电子邮件
        if (identifier.includes('@')) {
          user = await this.userModel.findOne({ email: identifier }).exec();
        } else {
          user = await this.userModel.findOne({ username: identifier }).exec();
        }
      
        if (!user) {
          throw new NotFoundException('User not found');
        }
      
        // 更新设置
        Object.assign(user.settings, newSettings);
      
        // 保存更新后的用户文档
        await user.save();
      
        return user.settings;
      }
}
