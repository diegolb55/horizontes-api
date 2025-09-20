import { Injectable } from "@nestjs/common";
import { EntityManager } from "typeorm";
import { HttpException, HttpStatus } from "@nestjs/common";
import { CreateUserDto } from "./dto/create-user.dto";

@Injectable()
export class UsersService {
    constructor(
        private readonly manager: EntityManager
    ) { }

    async create(userData: CreateUserDto) {
        try {
            const newUser = await this.manager.query(
                ` 
                INSERT INTO users (
                    name,
                    address,
                    phone,
                    gifting,
                    comment,
                    type,
                    skills,
                    created_at,
                    updated_at
                )
                VALUES (
                    $1, $2, $3, $4, $5, $6, $7, $8, $9
                )
                RETURNING *;
                `,
                [
                    userData.name ?? null,
                    userData.address ?? null,
                    userData.phone ?? null,
                    userData.gifting ?? false,
                    userData.comment ?? [],
                    userData.type ?? [],
                    userData.skills ?? [],
                    userData.created_at,
                    userData.updated_at,
                ],
            );

            return newUser[0];
        } catch (error) {
            console.error('Failed to create user', error);
            throw new HttpException('Failed to create user', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async updateUser(id: string, userData: Partial<CreateUserDto>) {
        try {
            const updatedUser = await this.manager.query(
                `
                UPDATE users 
                SET
                    name = COALESCE($1, name),
                    address = COALESCE($2, address),
                    phone = COALESCE($3, phone), 
                    gifting = COALESCE($4, gifting),
                    comment = CASE
                        WHEN $5::text[] IS NOT NULL THEN comment || $5::text[]
                        ELSE comment
                        END,
                    type = COALESCE($6, type),
                    skills = COALESCE($7, skills),
                    updated_at = NOW()
                WHERE id = $8
                RETURNING *;
                `,
                [
                    userData.name ?? null,
                    userData.address ?? null,
                    userData.phone ?? null,
                    userData.gifting ?? null,
                    userData.comment ?? null,
                    userData.type ?? null,
                    userData.skills ?? null,
                    id,
                ],
            );

            if (!updatedUser.length) {
                throw new HttpException('User not found', HttpStatus.NOT_FOUND);
            }

            return updatedUser[0];
        } catch (error) {
            console.error('Failed to update user', error);
            throw new HttpException('Failed to update user', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }








    async getAllUsers() {
        try {
            const users = await this.manager.query(
                `
                SELECT * 
                FROM users;
                `
            )

            return users;

        } catch (error) {
            console.log(error)
            throw new HttpException('Failed to get all users', HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    async findUser(id: string) {
        try {
            const user = await this.manager.query(
                `
                    SELECT * 
                    FROM users
                    WHERE id = $1;
                    `,
                [id]
            )
            if (!user.length) {
                throw new HttpException('Failed to find user', HttpStatus.NOT_FOUND)
            }

            return user[0]

        } catch (error) {
            console.log(error)
            throw new HttpException('Failed to find user', HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }






    async deleteUser(id: string) {
        try {

        } catch (error) {
            throw new HttpException('Failed to delete user', HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }
}