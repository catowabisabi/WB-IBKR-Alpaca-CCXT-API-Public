import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { config } from '../../config';

@Injectable()
export class AdminApiKeyGuard implements CanActivate {
  private readonly apiKey = config.adminApiKey;
  

  canActivate(context: ExecutionContext): boolean {
    
    const request = context.switchToHttp().getRequest<Request>();
    const requestApiKey = request.header('X-API-Key');// this is admin api key

    if (!requestApiKey || requestApiKey !== this.apiKey) {
      throw new UnauthorizedException('Invalid API key');
    }

    return true;
  }
}