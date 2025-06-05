// src/auth/auth.service.ts
import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../mongodb/models/users.model';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { randomBytes } from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,

  ) { }

  private generatePassword() {
    // 生成18個字節的隨機數據。當轉化為Base64字符串時，長度將增加至約24字符
    const buffer = randomBytes(18);
    return buffer.toString('base64').slice(0, 24);
  }

  private defaultSettings: any = {
    "useFixAmount": false,
    "fixAmountPrice": 1,
    "useFixOrderPercentage": false,
    "fixOrderPercentage": 1,
    "useMargin": false,
    "marginRatio": 1,
    "orderType": "LMT",
    "stopType": "LMT",
    "profitType": "LMT",
    "useStopLossPercentage": false,
    "stopLossPercentage": 5,
    "useTakeProfitPercentage": false,
    "takeProfitPercentage": 5,
    "useTakeProfitRatio": false,
    "takeProfitRatio": 1.5,
    "useFollowTrendOrder": false,
    "useIsolatedTradingMode": false,
    "trading_password": this.generatePassword(),
    "ib_gateway_or_tws_port": 7497,
    "ib_api_enable": true,
    "ngrok_tpc_link": "ngrok_tcp_link",
    "ngrok_tcp_port": 8080,
    "allowedDiffPercentageForClosingPosition": 5

  }

  private defaultKeys = {
    binance: {
      key: "",
      secret: ""
    },
    okx: {
      key: "",
      //secret:""
    },
    bybit: {
      key: "",
      //secret:""
    },
    alpacaPaper: {
      key: "",
      secret: ""
    },
    alpacaLive: {
      key: "",
      secret: ""
    }
  }

  async register(registerDto: RegisterDto): Promise<void> {
    const { username, email, password } = registerDto;

    const existingEmail = await this.userModel.findOne({ email });
    const existingUsername = await this.userModel.findOne({ username });
    if (existingUsername) {
      throw new BadRequestException('Username already exists');
    }
    if (existingEmail) {
      throw new BadRequestException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new this.userModel({
      username,
      email,
      password: hashedPassword,
      settings: this.defaultSettings,
      keys: this.defaultKeys
    });

    const newUserRes = await newUser.save();

    console.log(`新使用者已經建立: ${newUserRes.email}`)

    // TODO: 发送激活邮件
  }

  async login(loginDto: LoginDto): Promise<{ token: string }> {
    const { email, password } = loginDto;
    const user = await this.userModel.findOne({ email });
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if ((!isPasswordValid)||(!user)) { throw new UnauthorizedException('Invalid credentials')}

    const token = this.generateToken(user);
    return { token };
  }

  async registerWithGoogle(googleProfile: any): Promise<{ token: string, isRegistered: boolean }> {
    console.log('Registering user with Google profile:', googleProfile);
    const { email, firstName, lastName } = googleProfile;
    const name = `${firstName}_${lastName}`;
    let isRegistered: boolean = false;

    // check if user exist
    let user:any = await this.userModel.findOne({ email });

    if (!user) {
      user = await this.createUserFromGoogleProfile(googleProfile);  
    } else {
      isRegistered = true
    }
    const token = this.generateToken(user);
    return { token: token, isRegistered: isRegistered };
  }


  async loginWithGoogle(googleProfile: any): Promise<{ loginToken: string, user: any }> {
    const { email } = googleProfile;
    const user = await this.userModel.findOne({ email });
    if (!user) {throw new UnauthorizedException('User not found');}

    const loginToken = this.generateToken(user);
    return { loginToken: loginToken, user: user };
  }

  // create a new user from google profile
  private async createUserFromGoogleProfile(googleProfile: any): Promise<UserDocument> {
    const { email, firstName, lastName } = googleProfile;
    const name = `${firstName}_${lastName}`;
    const user = new this.userModel({
      email,
      username: name,
      settings: this.defaultSettings,
      keys: this.defaultKeys,
    });
    return await user.save()
  }

  private generateToken(user: UserDocument): string {
    const payload = { userId: user._id, email: user.email };
    return this.jwtService.sign(payload, { secret: process.env.JWT_KEY });
  }

}