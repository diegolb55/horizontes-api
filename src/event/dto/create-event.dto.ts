

export class CreateEventDto {
    description: string;
    name: string;
    type: string[];
    skills: string[]
    start_date: Date;
    end_date: Date;
    address: string;
    location: object;
    duration: string;
    images?: string[];

    created_at: Date;
    updated_at: Date;
}