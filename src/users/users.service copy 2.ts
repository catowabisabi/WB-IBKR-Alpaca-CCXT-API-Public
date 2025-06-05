import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Settings, User, UserDocument } from '../mongodb/models/users.model';
import { UserValidationService } from '../user-validation/user-validation.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { randomBytes } from 'crypto';
import { UserDto } from './dto/user.dto';

@Injectable()
export class UsersService {
    constructor(
      @InjectModel
      (User.name) 
      private userModel: Model<UserDocument> ,
      private userValidationService: UserValidationService
    ) {}

    toUserDto(user: User): UserDto {
      return {
        username: user.username,
        email: user.email,
        settings: user.settings,
      };
    }

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
      

    async findUserByUsername(username: string): Promise<UserDto | undefined> {
      console.log('findUserByUsername...')
        const user =  await this.userModel.findOne({ username }).exec();
        if (user){
          return this.toUserDto(user)
        }else return undefined
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

      async updatePasswordByUsernameOrEmail(userIdOrEmail:string, newUser: Partial<User>): Promise<UserDto> {
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

        console.log(`newUser: ${newUser}`)
        console.log(newUser)
        // 如果提供了新的密碼，則進行哈希處理
        if (newUser.password) {
          const hashedPassword = await bcrypt.hash(newUser.password, 10);
          newUser.password = hashedPassword;
        }
      
        // 更新用户其他信息
        Object.assign(user, newUser);
      
      
        // 保存更新后的用户文档
        await user.save();
      
        return this.toUserDto(user);
      }

      
}
