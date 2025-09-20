import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { EntityManager } from "typeorm";
import { CreateLikeDto } from "./dto/create-like.dto";


Injectable()
export class LikeService {
    constructor(
        private readonly manager: EntityManager
    ) { }

    async create(likeData: CreateLikeDto) {
        try {
            const like = await this.manager.query(
                `
                `,
                []
            )

        } catch (error) {
            throw new HttpException('Failed to create like', HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    async toggleLike(id: string) {
        try {
            const updated = await this.manager.query(
                `
                `,
                [id]
            )

            if(!updated.length) {
                throw new HttpException('Failed to toggle like', HttpStatus.NOT_FOUND)
            }

        } catch (error) {
            throw new HttpException('Failed to toggle like', HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }


}