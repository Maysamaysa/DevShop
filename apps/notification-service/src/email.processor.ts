import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';

@Processor('email-queue')
export class EmailProcessor extends WorkerHost {
  private readonly logger = new Logger(EmailProcessor.name);

  async process(
    job: Job<
      { userId: string; subject: string; body: string },
      unknown,
      string
    >,
  ): Promise<{ success: boolean }> {
    const { userId, subject, body } = job.data;

    this.logger.log(
      `[Email Job ID: ${job.id}] Sending email to User ${userId}...`,
    );
    this.logger.log(`[Subject]: ${subject}`);
    this.logger.log(`[Body]: ${body}`);

    // Simulate async email sending latency
    await new Promise((resolve) => setTimeout(resolve, 1000));

    this.logger.log(`[Email Job ID: ${job.id}] Email sent successfully!`);
    return { success: true };
  }
}
