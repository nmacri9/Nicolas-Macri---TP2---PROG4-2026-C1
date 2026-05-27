import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose'; 
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config'; 

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGO_URI!), // Conexión de mongo
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}