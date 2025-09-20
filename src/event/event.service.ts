import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { EntityManager } from "typeorm";
import { CreateEventDto } from "./dto/create-event.dto";
import { S3Service } from "src/utilities/s3.service";



@Injectable()
export class EventService {
    constructor(
        private readonly manager: EntityManager,
        private readonly s3Service: S3Service
    ) { }

    async create(eventData: CreateEventDto, files?: Express.Multer.File[]) {
        try {
            const skills = eventData.skills ? JSON.parse(eventData.skills as any) : [];
            const type = eventData.type ? JSON.parse(eventData.type as any) : [];

            // Step 1: Insert event WITHOUT images
            const inserted = await this.manager.query(
                `
                INSERT INTO event (
                    name,
                    description,
                    type,
                    skills,
                    start_date,
                    end_date,
                    address,
                    location,
                    duration,
                    created_at,
                    updated_at
                )
                VALUES (
                    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11
                )
                RETURNING *;
                `,
                [
                    eventData.name,
                    eventData.description,
                    type,
                    skills,
                    eventData.start_date,
                    eventData.end_date,
                    eventData.address,
                    JSON.stringify(eventData.location),
                    eventData.duration,
                    new Date(),
                    new Date(),
                ],
            );

            const newEvent = inserted[0];
            let imageUrls: string[] = [];

            // Step 2: Upload multiple files if provided
            if (files && files.length > 0) {
                const uploads = await Promise.all(
                    files.map((file, i) =>
                        this.s3Service.uploadFile(file, `events/${newEvent.id}/image-${i}`)
                    )
                );
                imageUrls = uploads.map((u) => u.Location);

                // Step 3: Update event with image URLs
                const updated = await this.manager.query(
                    `
                    UPDATE event
                    SET images = $1, updated_at = $2
                    WHERE id = $3
                    RETURNING *;
                    `,
                    [imageUrls, new Date(), newEvent.id],
                );

                return updated[0];
            }

            return newEvent;
        } catch (error) {
            console.error(error);
            throw new HttpException('Failed to create event', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    async updateEvent(id: string, eventData: Partial<CreateEventDto>, files?: Express.Multer.File[]) {
        try {
            const skills = eventData.skills ? JSON.parse(eventData.skills as any) : null;
            const type = eventData.type ? JSON.parse(eventData.type as any) : null;

            let imageUrls: string[] | null = null;

            if (files && files.length > 0) {
                const uploads = await Promise.all(
                    files.map((file, i) =>
                        this.s3Service.uploadFile(file, `events/${id}/image-${i}`)
                    )
                );
                imageUrls = uploads.map((u) => u.Location);
            }

            const updated = await this.manager.query(
                `
                UPDATE event
                SET
                    name        = COALESCE($1, name),
                    description = COALESCE($2, description),
                    type        = COALESCE($3, type),
                    skills      = COALESCE($4, skills),
                    start_date  = COALESCE($5, start_date),
                    end_date    = COALESCE($6, end_date),
                    address     = COALESCE($7, address),
                    location    = COALESCE($8, location),
                    duration    = COALESCE($9, duration),
                    updated_at  = $10,
                    images      = COALESCE($12, images)
                WHERE id = $11
                RETURNING *;
                `,
                [
                    eventData.name ?? null,
                    eventData.description ?? null,
                    type,
                    skills,
                    eventData.start_date ?? null,
                    eventData.end_date ?? null,
                    eventData.address ?? null,
                    eventData.location ? JSON.stringify(eventData.location) : null,
                    eventData.duration ?? null,
                    new Date(),
                    id,
                    imageUrls, // replaces existing if provided
                ],
            );

            if (!updated.length) {
                throw new HttpException('Failed to update event', HttpStatus.NOT_FOUND);
            }

            return updated[0];
        } catch (error) {
            console.error(error);
            throw new HttpException('Failed to update event', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }






    async getAllEvents() {
        try {
            const events = await this.manager.query(
                `
                SELECT * 
                FROM event;
                `
            )

            return events;

        } catch (error) {
            throw new HttpException('Failed to get all events', HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    async findEvent(id: string) {
        try {
            const event = await this.manager.query(
                `
                SELECT * 
                FROM event
                WHERE id = $1;
                `,
                [id]
            )
            if (!event.length) {
                throw new HttpException('Failed to find event', HttpStatus.NOT_FOUND)
            }

            return event[0]

        } catch (error) {
            throw new HttpException('Failed to find event', HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }






    async deleteEvent(id: string) {
        try {
            const deletedEvent = await this.manager.query(
                `
                DELETE FROM event
                WHERE id = $1
                RETURNING *;
                `,
                [id],
            );

            if (deletedEvent.length === 0) {
                throw new HttpException(
                    `Event with id ${id} not found`,
                    HttpStatus.NOT_FOUND,
                );
            }

            return deletedEvent[0];
        } catch (error) {
            throw new HttpException(
                'Failed to delete event',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }



}