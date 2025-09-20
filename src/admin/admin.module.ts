import { Module } from "@nestjs/common";
import { UtilitiesModule } from "src/utilities/utilities.module";
import { AdminController } from "./admin.controller";
import { AdminService } from "./admin.service";
import { LoginService } from "./login.service";


@Module({
    imports:[UtilitiesModule],
    controllers:[AdminController],
    providers:[AdminService, LoginService],
    exports:[AdminService],
})

export class AdminModule {} 