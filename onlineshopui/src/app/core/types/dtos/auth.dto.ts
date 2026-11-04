export type LoginCredentialsDto = {
    email: string;
    password: string;
};

export type RegisterRequestDto = {
    email: string;
    firstName: string;
    lastName: string;
    password: string;
};

export type JwtPayloadDto = {
    access_token: string;
};
