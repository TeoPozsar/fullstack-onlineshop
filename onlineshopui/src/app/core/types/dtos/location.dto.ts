export type AddressDto = {
    country: string;
    city: string;
    county: string;
    streetAddress: string;
};

export type LocationDto = {
    id: string;
    name: string;
    address: AddressDto;
};
