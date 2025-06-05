import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,  // 讓配置全局可用
      envFilePath: '.env',
    }),
  ],
})
export class ConfigurationModule {}