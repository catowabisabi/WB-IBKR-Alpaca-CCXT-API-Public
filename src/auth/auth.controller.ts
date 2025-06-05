// src/auth/auth.controller.ts
import { Controller, Post, Body, Get, UseGuards, Req, Res, UnauthorizedException, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Response } from 'express';
import { config } from '../../config'
import { ThrottlerGuard } from '@nestjs/throttler';
import { ApiTags, ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';

@ApiTags('Authentication')
@UseGuards(ThrottlerGuard)
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) { }


  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user', description: 'Creates a new user account.' })
  @ApiBody({ type: RegisterDto, description: 'User registration details' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'User registered successfully.' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input data (e.g., username or email already exists).' })
  async register(@Body() registerDto: RegisterDto): Promise<void> {
    await this.authService.register(registerDto);
  }


  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User login', description: 'Logs in an existing user and returns a JWT token.' })
  @ApiBody({ type: LoginDto, description: 'User login credentials' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Login successful, returns JWT token.', schema: { type: 'object', properties: { token: { type: 'string' } } } })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Invalid credentials.' })
  async login(@Body() loginDto: LoginDto): Promise<{ token: string }> {
    return this.authService.login(loginDto);
  }

  // 2024 05 13 修改 == 網上方法

  /* @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // 此方法僅用於觸發 Google 登錄
  } */

  // 2024 05 13 修改 == 網上方法
  @Get('google')
  @ApiOperation({ summary: 'Initiate Google OAuth login', description: 'Redirects to Google for authentication. This endpoint is typically accessed via a browser.' })
  @ApiResponse({ status: HttpStatus.FOUND, description: 'Redirects to Google OAuth consent screen.' })
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() req) {
    console.log('3824/auth/google')
  }


  // 2024 05 13 修改 == 網上方法再之前
  /*  @Get('google/callback')
 @UseGuards(AuthGuard('google'))
 async googleAuthCallback(@Req() req: any, @Res() res: Response) {
   console.log('Google callback received:', req.user);
   const user = await this.authService.registerWithGoogle(req.user);
   const token = await this.authService.loginWithGoogle(req.user);
   console.log('Generated token:', token);
   console.log('Google Gmail:', req.user.email)
   res.redirect(`http://localhost:3000/google-login-success?token=${token.token}`);
   
 } */

  // 2024 05 13 修改 == 網上方法
  // 處理 Google 登錄回調，註冊及登錄用戶，然後重定向
  /*  @Get('google/callback')
   @UseGuards(AuthGuard('google'))
   async googleAuthCallback(@Req() req: any, @Res() res: Response) {
     
     //console.log('Google callback received:', req.user);//accessToken係google既
     let havePassword:boolean = false;
 
     const {token, isRegistered} = await this.authService.registerWithGoogle(req.user);
     const {loginToken, user} = await this.authService.loginWithGoogle(req.user);
     //console.log('Generated token:', jwtToken);
     //console.log('Google Gmail:', req.user.email);
     if (user){
       if (user.password){
         havePassword = true
       }
       else{
         havePassword = false
       }
 
     }else{
       throw new UnauthorizedException('User not found');
     }
     const callbackUrl = `${config.cloudWbServerUrl}/google-login-success?token=${loginToken}&email=${encodeURIComponent(req.user.email)}&isRegistered=${isRegistered}&havePassword=${havePassword}`
     console.log(`後端 Google Login: 發送Callback URL:\n${callbackUrl}`)
     res.redirect(callbackUrl);
     } */












  @Get('google/callback')
  @ApiOperation({ summary: 'Google OAuth callback', description: 'Handles the callback from Google after authentication. This endpoint is typically accessed via redirect from Google.' })
  @ApiResponse({ status: HttpStatus.FOUND, description: 'Redirects to the frontend with a token upon successful authentication/registration.' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'User not found or authentication failed.' })
  @UseGuards(AuthGuard('google'))
  async googleAuthCallback(@Req() req: any, @Res() res: Response) {

    //console.log('Google callback received:', req.user);//accessToken係google既
    let havePassword: boolean = false;

    const { token, isRegistered } = await this.authService.registerWithGoogle(req.user);
    const { loginToken, user } = await this.authService.loginWithGoogle(req.user);
    //console.log('Generated token:', jwtToken);
    //console.log('Google Gmail:', req.user.email);
    if (user) {
      if (user.password) {
        havePassword = true
      }
      else {
        havePassword = false
      }

    } else {
      throw new UnauthorizedException('User not found');
    }
    //const callbackUrl = `${config.cloudWbServerUrl}/google-login-success?token=${loginToken}&email=${encodeURIComponent(req.user.email)}&isRegistered=${isRegistered}&havePassword=${havePassword}`

    //呢個callback係既, 真既係响passport入邊set個條
    const callbackUrl = `${config.cloudWbServerUrl}/google-login-success?token=${loginToken}&email=${encodeURIComponent(req.user.email)}&isRegistered=${isRegistered}&havePassword=${havePassword}`

    console.log(`後端 Google Login: 發送Callback URL:\n${callbackUrl}`)
    res.redirect(callbackUrl);
  }
}





























/* @Get('google/callback')
@UseGuards(AuthGuard('google'))
googleAuthRedirect(@Req() req, @Res() res: Response) {
  return this.googleLogin(req, res);
}

 


@Post('google-login')
async googleLogin(@Req() req, @Res() res: Response) {
  if (!req.user) {
    return 'No user from google';
  }

  let havePassword:boolean = false;
  const {token, isRegistered} = await this.authService.registerWithGoogle(req.user);
  const {loginToken, user} = await this.authService.loginWithGoogle(req.user);

  if (user){
    if (user.password){
      havePassword = true
    }
    else{
      havePassword = false
    }

  const data = {
    email: req.user.email,
    firstName: req.user.firstName,
    lastName: req.user.lastName,
    googleToken: req.user.accessToken,
    isRegistered: isRegistered,
    havePassword: havePassword,
    token: loginToken,
  };


  const callbackUrl = `${config.cloudWbServerUrl}/google-login-success?token=${loginToken}&email=${encodeURIComponent(req.user.email)}&isRegistered=${isRegistered}&havePassword=${havePassword}`
  console.log(`後端 Google Login: 發送Callback URL:\n${callbackUrl}`)
  res.redirect(callbackUrl);

}else {
  throw new UnauthorizedException('User not found');
}


}
} */