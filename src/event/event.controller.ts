import { Body, Controller, Delete, Get, Param, Patch, Post, UploadedFiles } from "@nestjs/common";
import { CreateEventDto } from "./dto/create-event.dto";
import { EventService } from "./event.service";
import { UseInterceptors } from "@nestjs/common";
import { FilesInterceptor } from '@nestjs/platform-express';


@Controller('event')
export class EventController {
    constructor(
        private readonly eventService: EventService
    ) { }


    @Post('/create')
    @UseInterceptors(FilesInterceptor('images', 2)) // field name "images", max 2 files
    create(
        @Body() eventData: CreateEventDto,
        @UploadedFiles() files?: Express.Multer.File[],
    ) {
        return this.eventService.create(eventData, files);
    }

    @Patch('/updateEvent/:id')
    @UseInterceptors(FilesInterceptor('images', 2))
    updateEvent(
        @Param('id') id: string,
        @Body() eventData: Partial<CreateEventDto>,
        @UploadedFiles() files?: Express.Multer.File[],
    ) {
        return this.eventService.updateEvent(id, eventData, files);
    }


    @Get('/findAll')
    findAllEvents() {
        return this.eventService.getAllEvents();
    }

    @Get('/findOne/:id')
    findEvent(@Param('id') id: string) {
        return this.eventService.findEvent(id);
    }



    @Delete('/deleteEvent/:id')
    deleteEvent(@Param('id') id: string) {
        return this.eventService.deleteEvent(id)
    }

}