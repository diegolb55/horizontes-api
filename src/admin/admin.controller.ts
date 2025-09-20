import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { AdminService } from "./admin.service";
import { CreateAdminDto } from "./dto/create-admin.dto";
import { CreateLoginDto } from "./dto/create-login.dto";
import { LoginService } from "./login.service";


@Controller('admin')
export class AdminController {
    constructor(
        private readonly adminService: AdminService,
        private readonly loginService: LoginService
    ) {}

    @Post('/create')
    create(@Body() adminData: CreateAdminDto) {
        return this.adminService.create(adminData);
    }

    @Post('/signup')
    signup(@Body() body: {
        loginData: Partial<CreateLoginDto>,
        adminData: CreateAdminDto
    }) {
        return this.loginService.signup(body.loginData, body.adminData);
    }

    @Post('/login')
    login(@Body() body: {
        email: string,
        password: string
    }) {
        return this.loginService.login(body.email, body.password)
    }

    @Get('/findAdmin/:id')
    findAdmin(@Param('id') id: string) {
        return this.adminService.findAdmin(id)
    }

}
