import { JwtPayloadDto, LoginCredentialsDto, RegisterRequestDto } from '../../types/dtos/auth.dto';

export const MOCK_JWT_TOKEN =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLTEiLCJlbWFpbCI6ImFkbWluQGV4YW1wbGUuY29tIiwicm9sZSI6IkFETUlOIn0.mock-signature';

export const MOCK_JWT_PAYLOAD: JwtPayloadDto = {
    access_token: MOCK_JWT_TOKEN
};

export const MOCK_LOGIN_CREDENTIALS: LoginCredentialsDto = {
    email: 'admin@example.com',
    password: 'admin123'
};

export const MOCK_REGISTER_REQUEST: RegisterRequestDto = {
    email: 'newuser@example.com',
    firstName: 'New',
    lastName: 'User',
    password: 'password123'
};
