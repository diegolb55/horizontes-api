import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class ResendService {
  private readonly apiKey: string;
  private readonly fromEmail: string;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    const fromEmail = this.configService.get<string>('RESEND_FROM_EMAIL');

    if (!apiKey || !fromEmail) {
      throw new Error('❌ Missing required Resend environment variables (RESEND_API_KEY, RESEND_FROM_EMAIL)');
    }

    this.apiKey = apiKey;
    this.fromEmail = fromEmail;
  }

  async sendEmail(to: string, subject: string, html: string) {
    try {
      const response = await axios.post(
        'https://api.resend.com/emails',
        {
          from: this.fromEmail,
          to,
          subject,
          html,
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log(`✅ Email sent via Resend to ${to}`, response.data);
    } catch (error: any) {
      console.error('❌ Error sending email with Resend:', error.response?.data || error.message);
    }
  }
}
