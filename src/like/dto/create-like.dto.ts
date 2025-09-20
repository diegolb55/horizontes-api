

export class CreateLikeDto {
    liked: boolean;
    entity_type: string;
    entity_id: string;
    user: string;

    created_at: Date;
    updated_at: Date;
}