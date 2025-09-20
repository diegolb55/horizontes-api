import { TypeOrmModuleOptions } from "@nestjs/typeorm";

export const typeOrmConfig: TypeOrmModuleOptions = {
    type:'postgres',
    host:'3.149.172.80',
    port:5432,
    username:'horizonte_user',
    password:'Horiz0ntePr!2025',
    database:'horizontepr',
    entities: [__dirname + '/../**/*.entity.ts'],
    synchronize:true,

}

// Host: 52.14.171.30
// Port: 5432
// Database: horizontepr
// User: horizonte_user
// Password: Horiz0ntePr!2025
