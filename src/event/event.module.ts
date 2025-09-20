import { Module } from "@nestjs/common";
import { EventController } from "./event.controller";
import { EventService } from "./event.service";
import { UtilitiesModule } from "src/utilities/utilities.module";



@Module({
    imports: [UtilitiesModule],
    controllers:[EventController],
    providers: [EventService],
    exports:[EventService]
})

export class EventModule {}