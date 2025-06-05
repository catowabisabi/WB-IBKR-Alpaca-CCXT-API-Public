import { Injectable } from '@nestjs/common';
import { getFrontPageHTML } from './appIndex';

@Injectable()
export class AppService {
  getHello(): string {
    return getFrontPageHTML();
  }
}