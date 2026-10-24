import { Injectable, NotImplementedException } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
    async register(dto: RegisterDto): Promise<any> {
        throw new NotImplementedException();
    }

    async login(dto: LoginDto): Promise<any> {
        throw new NotImplementedException();
    }
}
