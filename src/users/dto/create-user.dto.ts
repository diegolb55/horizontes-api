

export class CreateUserDto {
    name?: string;
    address?: string;
    phone?: string;
    gifting?: boolean;
    comment?: string[];
    type?: string[];
    skills?: string[]

    created_at: Date;
    updated_at: Date;
}