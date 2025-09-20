import { Body, Controller, Param, Patch, Post } from "@nestjs/common";
import { LikeService } from "./like.service";
import { CreateLikeDto } from "./dto/create-like.dto";



@Controller('like')
export class LikeController {
    constructor(
        private readonly likeService: LikeService
    ) { }


    @Post('/create')
    create(@Body() likeData: CreateLikeDto) {
        return this.likeService.create(likeData)
    }

    @Patch('/toggleLike/:id')
    toggleLike(@Param('id') id:string) {
        return this.likeService.toggleLike(id)
    }
}