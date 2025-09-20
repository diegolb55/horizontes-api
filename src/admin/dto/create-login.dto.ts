

export class CreateLoginDto {
    user_id: string;
    password:string;
    
    reset_token?: string;
    reset_token_expiry?: string;

    last_login?: Date;
    created_at?: Date;
}
