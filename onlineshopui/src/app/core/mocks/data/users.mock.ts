import { UserDto } from '../../types/dtos/user.dto';

export const MOCK_USERS: UserDto[] = [
    {
        id: 'user-1',
        email: 'admin@example.com',
        firstName: 'Admin',
        lastName: 'User',
        role: 'ADMIN'
    },
    {
        id: 'user-2',
        email: 'user@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'CUSTOMER'
    },
    {
        id: 'user-3',
        email: 'jane@example.com',
        firstName: 'Jane',
        lastName: 'Smith',
        role: 'CUSTOMER'
    }
];

export const MOCK_USER_CREDENTIALS: Record<string, { password: string; user: UserDto }> = {
    'admin@example.com': {
        password: 'admin123',
        user: MOCK_USERS[0]
    },
    'user@example.com': {
        password: 'user123',
        user: MOCK_USERS[1]
    },
    'jane@example.com': {
        password: 'jane123',
        user: MOCK_USERS[2]
    }
};
