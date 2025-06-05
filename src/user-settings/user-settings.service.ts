import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Keys, Settings, User, UserDocument } from '../mongodb/models/users.model';
import { UsersService } from '../users/users.service';


@Injectable()
export class UserSettingsService {
  private settings: Settings;
  constructor(
    @InjectModel
    (User.name) private userModel: Model<UserDocument>,
    private usersService: UsersService,
  ) {}

  async init(email: string): Promise<void> {
    //console.log(`UserSeetingService init...User Email: ${email}`)
    //console.log(`\n現時的使用者 ID / Email: ${email}`)
    this.settings = await this.usersService.findSettingsByUsernameOrEmail(email);

   /*  const settingTest = `現時使用者 <${email}> 的交易設定如下:\n\n\
使用固定金額交易：　　　　${this.settings.useFixAmount} \n\
固定的交易金額：　　　　　${this.settings.fixAmountPrice}\n\n\
使用固定全額百分比交易：　${this.settings.useFixOrderPercentage}\n\
固定交易全額百分比：　　　${this.settings.fixOrderPercentage}\n\n\
使用孖展交易：　　　　　　${this.settings.useMargin}\n\
孖展交易倍率：　　　　　　${this.settings.marginRatio}\n\n\
下單類別(巿價單/限價單)： ${this.settings.orderType}\n\
止損類別(巿價單/限價單)： ${this.settings.stopType}\n\
止盈類別(巿價單/限價單)： ${this.settings.profitType}\n\n\
使用固定百份比止損：　　　${this.settings.useStopLossPercentage}\n\
固定百份比止損的百份比：　${this.settings.stopLossPercentage}\n\n\
使用損益比提交止盈單：　　${this.settings.useTakeProfitRatio}\n\
損益比：　　　　　　　　　${this.settings.takeProfitRatio}\n\n\
跟隨大方向下單：　　　　　${this.settings.useFollowTrendOrder}\n\n\
逐倉：　　　　　　　　　　${this.settings.useIsolatedTradingMode}\n\n\
交易ＡＰＩ的密碼：　　　　${this.settings.trading_password}\n\n\
    ` */
    //console.log(settingTest)
    //console.log(`UserSeetingService init...Returned Settings: ${this.settings}`)
  }

  async getUser(userIdOrEmail: string,):Promise<UserDocument |undefined>{
    let user: UserDocument  | undefined;
    const identifier = userIdOrEmail;
    if (identifier.includes('@')) {
      user = await this.userModel.findOne({ email: identifier }).exec();
    } else {
      user = await this.userModel.findOne({ username: identifier }).exec();
    }
    return user
  }

  getSettings(): Settings {
    return this.settings;
  }

  async updateSettings(userIdOrEmail: string, newSettings: Partial<Settings>): Promise<void> {
    this.settings = { ...this.settings, ...newSettings };
    await this.usersService.updateSettingsByUsernameOrEmail(userIdOrEmail, this.settings);
  }

  async findSettingsByUsernameOrEmail(userIdOrEmail:string): Promise<Settings | undefined> {
    const user_id = userIdOrEmail;
    let user: UserDocument  | undefined;
  
    if (user_id.includes('@')) {
      user = await this.userModel.findOne({ email: user_id }).exec();
    } else {
      user = await this.userModel.findOne({ username: user_id }).exec();
    }
    
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user.settings;
  }

  async findAllSettingsOfUser(userIdOrEmail:string): Promise<Settings | undefined> {
    const user_id = userIdOrEmail;
    let user: UserDocument  | undefined;
  
    if (user_id.includes('@')) {
      user = await this.userModel.findOne({ email: user_id }).exec();
    } else {
      user = await this.userModel.findOne({ username: user_id }).exec();
    }
    
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user.settings;
  }

  async getKeysOfUser(userId: string): Promise<Keys | undefined> {
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }
  
    let user: UserDocument | undefined;
    if (userId.includes('@')) {
      user = await this.userModel.findOne({ email: userId }).exec();
    } else {
      user = await this.userModel.findOne({ username: userId }).exec();
    }
    if (!user) {
      throw new NotFoundException('User not found');
    }
  
    return user.keys;
  }

  async updateKeys(userIdOrEmail: string, newKeys: Partial<Keys>): Promise<Keys> {
    const user = await this.getUser(userIdOrEmail);
    if (!user) {
      throw new NotFoundException('User not found');
    }
 
    // Initialize keys with empty objects if they don't exist
    if (!user.keys) {
      user.keys = {
        binance: { key: '', secret: '' },
        okx: { key: '' },
        bybit: { key: '' },
        alpacaPaper: { key: '', secret: '' },
        alpacaLive: { key: '', secret: '' }
      };
    }
    
    // Update only the provided keys
    user.keys = { ...user.keys, ...newKeys };
    await user.save();
  
    return user.keys;
  }

  async findOneSetting(userEmail: string, settingKey: string): Promise<any> {
    const user = await this.userModel.findOne({ email: userEmail }).exec();
    
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.settings || !(settingKey in user.settings)) {
      throw new NotFoundException(`Setting not found`);
    }

    return user.settings[settingKey];
  }
}