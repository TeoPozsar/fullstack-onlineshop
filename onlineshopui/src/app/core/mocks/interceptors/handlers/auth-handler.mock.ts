import { HttpResponse } from '@angular/common/http';
import { MOCK_USER_CREDENTIALS, MOCK_USERS } from '../../data/users.mock';

type LoginPayload = { email: string; password: string };
type RegisterPayload = {
    email: string;
    firstName: string;
    lastName: string;
    password: string;
};

const mockAuthSessions = new Map<string, (typeof MOCK_USERS)[number]>();

type AuthHandlerContext = {
    method: string;
    path: string;
    body: unknown;
    authHeader: string | null;
};

export function handleAuthFeature(context: AuthHandlerContext): HttpResponse<unknown> | null {
    const { method, path, body, authHeader } = context;

    if (method === 'POST' && path === '/auth/login') {
        return handleLogin(body as LoginPayload);
    }

    if (method === 'POST' && path === '/auth/register') {
        return handleRegister(body as RegisterPayload);
    }

    if (method === 'GET' && path === '/auth/profile') {
        return handleGetProfile(authHeader);
    }

    return null;
}

function handleLogin(body: LoginPayload): HttpResponse<unknown> {
    const credentials = MOCK_USER_CREDENTIALS[body.email];

    if (!credentials || credentials.password !== body.password) {
        return new HttpResponse({
            status: 401,
            statusText: 'Unauthorized',
            body: { message: 'Invalid email or password' }
        });
    }

    const accessToken = `mock-jwt-token-${credentials.user.id}`;
    mockAuthSessions.set(accessToken, credentials.user);

    return new HttpResponse({
        status: 200,
        body: { access_token: accessToken }
    });
}

function handleRegister(body: RegisterPayload): HttpResponse<unknown> {
    if (MOCK_USER_CREDENTIALS[body.email]) {
        return new HttpResponse({
            status: 400,
            statusText: 'Bad Request',
            body: { message: 'User already exists' }
        });
    }

    const newUser = {
        id: `user-${MOCK_USERS.length + 1}`,
        email: body.email,
        firstName: body.firstName,
        lastName: body.lastName,
        role: 'CANDIDATE'
    };

    MOCK_USERS.push(newUser);
    MOCK_USER_CREDENTIALS[body.email] = {
        password: body.password,
        user: newUser
    };

    return new HttpResponse({
        status: 201,
        body: newUser
    });
}

function handleGetProfile(authHeader: string | null): HttpResponse<unknown> {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return new HttpResponse({
            status: 401,
            statusText: 'Unauthorized',
            body: { message: 'No token provided' }
        });
    }

    const token = authHeader.replace('Bearer ', '').trim();
    const user = mockAuthSessions.get(token) ?? resolveUserFromToken(token);

    if (!user) {
        return new HttpResponse({
            status: 401,
            statusText: 'Unauthorized',
            body: { message: 'Invalid token' }
        });
    }

    mockAuthSessions.set(token, user);

    return new HttpResponse({
        status: 200,
        body: user
    });
}

function resolveUserFromToken(token: string) {
    if (!token.startsWith('mock-jwt-token-')) {
        return null;
    }

    const userId = token.replace('mock-jwt-token-', '').trim();

    if (!userId) {
        return null;
    }

    return MOCK_USERS.find(user => user.id === userId) ?? null;
}
