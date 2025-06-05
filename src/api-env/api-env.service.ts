import { Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv';
import * as fs from 'fs';

@Injectable()
export class ApiEnvService {
  private readonly envConfig: Record<string, string> = {};

  constructor() {
    const envFile = '.env';
    if (fs.existsSync(envFile)) {
      this.envConfig = dotenv.parse(fs.readFileSync(envFile));
    }
  }

  //提取env資料
  getEnv() {
    return this.envConfig;
  }

  //寫入env資料
  setEnv(envData: Record<string, string>) {
    Object.assign(this.envConfig, envData);
    const envFile = '.env';
    const envContent = Object.entries(this.envConfig)
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');
    fs.writeFileSync(envFile, envContent);
    return this.envConfig;
  }
}