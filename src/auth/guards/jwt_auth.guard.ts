import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name);

  handleRequest(err, user, info) {
    if (err || !user) {
      this.logger.error('Authentication failed', err, info);
      throw err || new UnauthorizedException();
    }
    this.logger.log('Authentication succeeded', user);
    return user;
  }
}