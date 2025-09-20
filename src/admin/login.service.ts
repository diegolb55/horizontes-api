import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import { ResendService } from 'src/utilities/resend.service';
import { CreateLoginDto } from './dto/create-login.dto';
import { CreateAdminDto } from './dto/create-admin.dto';
import { AdminService } from './admin.service';



@Injectable()
export class LoginService {
    constructor(
        private manager: EntityManager,
        private readonly resendService: ResendService,
        private readonly adminService: AdminService
    ) { }


    async login(email: string, password: string) {
        try {
            const login = await this.manager.query(
                `
                SELECT 
                    l.password, l.user_id
                FROM admin_login l
                JOIN admin a ON a.id = l.user_id
                WHERE a.email = $1
                `,
                [email],
            );

            if (login.length === 0) {
                throw new HttpException(
                    `There is no user with this email: ${email}`,
                    HttpStatus.NOT_FOUND,
                );
            }

            const match = await bcrypt.compare(password, login[0].password);
            if (!match) {
                throw new HttpException(
                    `Invalid password`,
                    HttpStatus.UNAUTHORIZED,
                );
            }

            return { user_id: login[0].user_id, result: true };
        } catch (error) {
            throw new HttpException(
                error.message || 'Login failed',
                error.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }



    async signup(loginData: Partial<CreateLoginDto>, adminData: CreateAdminDto) {
        try {
            await this.verifySignup(adminData.email);

            const hashed = loginData.password && await bcrypt.hash(loginData.password, 10);

            const newAdmin = await this.adminService.create(adminData);

            console.log("new admin: ", newAdmin)

            if (!newAdmin?.id) {
                throw new HttpException(
                    'Admin registration failed',
                    HttpStatus.INTERNAL_SERVER_ERROR,
                );
            }

            const login = await this.manager.query(
                `
                INSERT INTO admin_login
                (user_id, password, last_login)
                VALUES ($1, $2, NOW())
                RETURNING user_id
                `,
                [newAdmin.id, hashed],
            );

            return login[0]?.user_id;

        } catch (error) {
            console.log("error: ", error)
            throw new HttpException(
                error.response || error.message || 'Signup failed',
                error.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }

    }

    async verifySignup(email: string) {
        try {

            // Check if email already exists
            const emailCheck = await this.manager.query(
                'SELECT 1 FROM admin WHERE email = $1',
                [email],
            );
            if (emailCheck.length > 0) {
                throw new HttpException(
                    { email: 'Email is already taken! Try logging in or resetting your password.' },
                    HttpStatus.BAD_REQUEST,
                );
            }

            return { message: 'Signup verification passed.' };
        } catch (error) {
            throw new HttpException(
                error.response || error.message || 'Signup verification failed',
                error.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }


    // send otp
    async sendResetOTP(email: string) {
        try {
            const user = await this.manager.query(
                `
                SELECT u.id, l.username
                FROM users u
                JOIN login l ON u.id = l.user_id 
                WHERE u.email = $1
                `,
                [email],
            );

            if (user.length === 0) {
                throw new HttpException('Email not found', HttpStatus.NOT_FOUND);
            }

            // Generate OTP token
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            const expiry = new Date(Date.now() + 3600000); // 1 hour

            await this.manager.query(
                `
                UPDATE login 
                SET reset_token = $1, reset_token_expiry = $2 
                WHERE user_id = $3
                `,
                [otp, expiry, user[0].id],
            );

            const subject = "LimpioYa - Restablecer Contraseña";
            const html = `
        <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: auto; padding: 24px; border-radius: 12px; border: 1px solid #e0e0e0; background-color: #f9f9f9;">
          <div style="text-align: center; margin-bottom: 24px;">
            <img src="https://limpioyapr.com/house_logo.png" alt="LimpioYa Logo" style="max-width: 150px;" />
          </div>
          <h2 style="color: #000; font-size: 26px; font-weight: 700; margin-bottom: 8px; text-align: center;">
            Restablecer <span style="color: #2563eb;">tu contraseña</span>
          </h2>
          <p style="font-size: 16px; color: #333; margin-top: 24px;">
            Hola <strong>${user[0].username}</strong>,
          </p>
          <p style="font-size: 16px; color: #333;">
            Hemos recibido una solicitud para restablecer tu contraseña en <strong>LimpioYaPR</strong>.
            Ingresa el siguiente código en la aplicación o sitio web para continuar con el proceso:
          </p>
          <div style="margin: 24px auto; text-align: center;">
            <div style="display: inline-block; padding: 16px 32px; font-size: 28px; font-weight: bold; letter-spacing: 4px; background-color: #fff; border: 2px dashed #2563eb; color: #2563eb; border-radius: 8px;">
              ${otp}
            </div>
          </div>
          <p style="font-size: 14px; color: #555; margin-top: 20px; text-align: center;">
            ⚠️ Este código será válido por <strong>1 hora</strong>. Si no solicitaste este cambio, ignora este correo; tu contraseña seguirá siendo la misma.
          </p>
          <footer style="margin-top: 32px; font-size: 12px; color: #888; text-align: center;">
            Este mensaje es automático y enviado desde <strong>limpioyapr.com</strong>.
          </footer>
        </div>
      `;

            await this.resendService.sendEmail(email, subject, html);

            return 1

        } catch (error) {
            throw new HttpException(
                error.message || 'Password reset failed',
                error.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }


    // reset password
    async resetPassword(otp: string, newPassword: string) {
        console.log(typeof otp, otp)
        try {
            const login = await this.manager.query(
                `
        SELECT u.email, l.username, l.user_id
        FROM login l
        JOIN users u ON u.id = l.user_id
        WHERE l.reset_token = $1 AND l.reset_token_expiry > NOW()
        `,
                [otp],
            );

            if (login.length === 0) {
                throw new HttpException('Invalid or expired token.', HttpStatus.BAD_REQUEST);
            }

            const hashed = await bcrypt.hash(newPassword, 10);

            await this.manager.query(
                `
        UPDATE login 
        SET password = $1, reset_token = NULL, reset_token_expiry = NULL 
        WHERE user_id = $2
        `,
                [hashed, login[0].user_id],
            );

            // ✅ Send password reset success email
            const subject = "LimpioYa - Contraseña Restablecida";
            const html = `
      <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: auto; padding: 24px; border-radius: 12px; border: 1px solid #e0e0e0; background-color: #f9f9f9;">
        <div style="text-align: center; margin-bottom: 24px;">
          <img src="https://limpioyapr.com/house_logo.png" alt="LimpioYa Logo" style="max-width: 150px;" />
        </div>
        <h2 style="color: #000; font-size: 26px; font-weight: 700; margin-bottom: 8px; text-align: center;">
          Tu contraseña ha sido <span style="color: #2563eb;">actualizada</span>
        </h2>
        <p style="font-size: 16px; color: #333; margin-top: 24px;">
          Hola <strong>${login[0].username}</strong>,
        </p>
        <p style="font-size: 16px; color: #333;">
          Te confirmamos que tu contraseña en <strong>LimpioYaPR</strong> ha sido restablecida con éxito.
          Si no fuiste tú quien solicitó este cambio, por favor <strong>cambia tu contraseña inmediatamente</strong> o contacta a nuestro equipo de soporte.
        </p>
       
        <footer style="margin-top: 32px; font-size: 12px; color: #888; text-align: center;">
          Este mensaje es automático y enviado desde <strong>limpioyapr.com</strong>.
        </footer>
      </div>
    `;

            await this.resendService.sendEmail(login[0].email, subject, html);

            return { message: 'Password has been reset successfully.' };
        } catch (error) {
            throw new HttpException(
                error.message || 'Password reset failed',
                error.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }




    async deleteLogin(userId: string) {
        try {
            const login = await this.manager.query(
                `
            SELECT 1 FROM login WHERE user_id = $1`,
                [userId],
            );

            if (login.length === 0) {
                throw new HttpException(
                    `No login found for user_id: ${userId}`,
                    HttpStatus.NOT_FOUND,
                );
            }

            await this.manager.query(
                `
            DELETE FROM login WHERE user_id = $1`,
                [userId],
            );



            return { message: `Login for user_id ${userId} has been deleted.` };
        } catch (error) {
            throw new HttpException(
                error.response || error.message || 'Login delete failed',
                error.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }





}














