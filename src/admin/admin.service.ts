import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { EntityManager } from "typeorm";
import { CreateAdminDto } from "./dto/create-admin.dto";



@Injectable()
export class AdminService {
    constructor(
        private readonly manager: EntityManager
    ) { }

    async create(adminData: CreateAdminDto) {
        try {
            console.log("admin data: ", adminData)
            const newAdmin = await this.manager.query(
                `
                INSERT INTO admin (name, username, email, created_at, updated_at)
                VALUES ( $1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                RETURNING *;
                `,
                [adminData.name, adminData.username, adminData.email],
            );

            return newAdmin[0];
        } catch (error) {
            throw new HttpException(
                'Failed to create admin',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    async findAdmin(id: string) {
        try {
            const admin  = await this.manager.query(
                `
                SELECT * 
                FROM admin 
                WHERE id = $1;
                `,
                [id]
            )
            if (!admin.length) {
                throw new HttpException('Failed to find admin', HttpStatus.NOT_FOUND)
            }
            return admin[0]

        } catch (error) {
            throw new HttpException(
                'Failed to find admin',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }




}