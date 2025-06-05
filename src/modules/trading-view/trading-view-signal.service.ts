import { Injectable } from '@nestjs/common';
import { SignalService } from './signal.service.interface';

@Injectable()
export class TradingSignalService implements SignalService {
    transformToJSON(data: any): any {
        try {
            return JSON.parse(data);
        } catch (error) {
            throw new Error('Invalid JSON data');
        }
    }
}