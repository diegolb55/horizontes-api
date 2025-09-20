import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";
import { UsersService } from "./users.service";
import { CreateUserDto } from "./dto/create-user.dto";


@Controller('users')
export class UsersController {
    constructor(
        private readonly usersService: UsersService
    ) { }

    @Post('/create')
    create(@Body() userData: CreateUserDto) {
        return this.usersService.create(userData);
    }

    @Get('/findAll')
    findAllUsers() {
        return this.usersService.getAllUsers();
    }

    @Get('/findOne/:id')
    findUser(@Param('id') id: string) {
        return this.usersService.findUser(id);
    }

    @Patch('/updateUser/:id')
    updateUser(
        @Param('id') id: string,
        @Body() userData: Partial<CreateUserDto>
    ) {
        return this.usersService.updateUser(id, userData);
    }

    @Delete('/deleteUser/:id')
    deleteEvent(@Param('id') id: string) {
        return this.usersService.deleteUser(id)
    }

}