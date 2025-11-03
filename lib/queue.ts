import { Queue, Worker, Job, QueueEvents } from "bullmq";
import IORedis from "ioredis";

// Redis connection for BullMQ
const connection = new IORedis({
  host: process.env.BULLMQ_REDIS_HOST || "localhost",
  port: parseInt(process.env.BULLMQ_REDIS_PORT || "6379"),
  password: process.env.BULLMQ_REDIS_PASSWORD,
  maxRetriesPerRequest: null,
  // If using Upstash Redis, you might need different configuration
});

// Job types
export enum JobType {
  WARRANTY_CHECK = "warranty-check",
  SEND_EMAIL = "send-email",
  SEND_NOTIFICATION = "send-notification",
  PROCESS_PAYMENT = "process-payment",
  UPDATE_WORK_ORDER = "update-work-order",
}

// Job data interfaces
export interface WarrantyCheckJobData {
  workOrderId: string;
  deviceId: string;
  provider: "apple" | "dell" | "samsung";
  serialNumber: string;
}

export interface SendEmailJobData {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export interface SendNotificationJobData {
  userId: string;
  type: "email" | "sms" | "in_app";
  subject?: string;
  content: string;
}

export interface ProcessPaymentJobData {
  paymentId: string;
  workOrderId: string;
  amount: number;
}

export interface UpdateWorkOrderJobData {
  workOrderId: string;
  status: string;
  notes?: string;
}

// Create queues
const queues = new Map<string, Queue>();

/**
 * Get or create a queue
 * @param queueName - Name of the queue
 * @returns Queue instance
 */
export function getQueue(queueName: string): Queue {
  if (!queues.has(queueName)) {
    const queue = new Queue(queueName, {
      connection,
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 2000,
        },
        removeOnComplete: {
          age: 24 * 3600, // Keep completed jobs for 24 hours
          count: 1000,
        },
        removeOnFail: {
          age: 7 * 24 * 3600, // Keep failed jobs for 7 days
        },
      },
    });

    queues.set(queueName, queue);
  }

  return queues.get(queueName)!;
}

/**
 * Add a job to the warranty check queue
 * @param data - Warranty check job data
 * @returns Job instance
 */
export async function addWarrantyCheckJob(
  data: WarrantyCheckJobData
): Promise<Job> {
  const queue = getQueue(JobType.WARRANTY_CHECK);
  return await queue.add(JobType.WARRANTY_CHECK, data, {
    jobId: `warranty-${data.workOrderId}`,
    priority: 2,
  });
}

/**
 * Add a job to the email queue
 * @param data - Email job data
 * @returns Job instance
 */
export async function addEmailJob(data: SendEmailJobData): Promise<Job> {
  const queue = getQueue(JobType.SEND_EMAIL);
  return await queue.add(JobType.SEND_EMAIL, data, {
    priority: 1, // High priority for emails
  });
}

/**
 * Add a job to the notification queue
 * @param data - Notification job data
 * @returns Job instance
 */
export async function addNotificationJob(
  data: SendNotificationJobData
): Promise<Job> {
  const queue = getQueue(JobType.SEND_NOTIFICATION);
  return await queue.add(JobType.SEND_NOTIFICATION, data, {
    priority: 1,
  });
}

/**
 * Add a job to the payment processing queue
 * @param data - Payment job data
 * @returns Job instance
 */
export async function addPaymentJob(data: ProcessPaymentJobData): Promise<Job> {
  const queue = getQueue(JobType.PROCESS_PAYMENT);
  return await queue.add(JobType.PROCESS_PAYMENT, data, {
    jobId: `payment-${data.paymentId}`,
    priority: 1, // High priority for payments
  });
}

/**
 * Add a job to the work order update queue
 * @param data - Work order update job data
 * @returns Job instance
 */
export async function addWorkOrderUpdateJob(
  data: UpdateWorkOrderJobData
): Promise<Job> {
  const queue = getQueue(JobType.UPDATE_WORK_ORDER);
  return await queue.add(JobType.UPDATE_WORK_ORDER, data, {
    priority: 3,
  });
}

/**
 * Get job by ID
 * @param queueName - Name of the queue
 * @param jobId - Job ID
 * @returns Job instance or null
 */
export async function getJob(
  queueName: string,
  jobId: string
): Promise<Job | undefined> {
  const queue = getQueue(queueName);
  return await queue.getJob(jobId);
}

/**
 * Get job status
 * @param queueName - Name of the queue
 * @param jobId - Job ID
 * @returns Job state
 */
export async function getJobStatus(
  queueName: string,
  jobId: string
): Promise<string | null> {
  const job = await getJob(queueName, jobId);
  if (!job) return null;

  return await job.getState();
}

/**
 * Remove a job from queue
 * @param queueName - Name of the queue
 * @param jobId - Job ID
 */
export async function removeJob(
  queueName: string,
  jobId: string
): Promise<void> {
  const job = await getJob(queueName, jobId);
  if (job) {
    await job.remove();
  }
}

/**
 * Clean old jobs from queue
 * @param queueName - Name of the queue
 * @param grace - Grace period in milliseconds
 * @param limit - Maximum number of jobs to clean
 */
export async function cleanQueue(
  queueName: string,
  grace: number = 24 * 3600 * 1000, // 24 hours
  limit: number = 1000
): Promise<void> {
  const queue = getQueue(queueName);
  await queue.clean(grace, limit, "completed");
  await queue.clean(grace * 7, limit, "failed"); // Keep failed jobs longer
}

/**
 * Pause a queue
 * @param queueName - Name of the queue
 */
export async function pauseQueue(queueName: string): Promise<void> {
  const queue = getQueue(queueName);
  await queue.pause();
}

/**
 * Resume a queue
 * @param queueName - Name of the queue
 */
export async function resumeQueue(queueName: string): Promise<void> {
  const queue = getQueue(queueName);
  await queue.resume();
}

/**
 * Get queue statistics
 * @param queueName - Name of the queue
 * @returns Queue statistics
 */
export async function getQueueStats(queueName: string) {
  const queue = getQueue(queueName);

  const [waiting, active, completed, failed, delayed] = await Promise.all([
    queue.getWaitingCount(),
    queue.getActiveCount(),
    queue.getCompletedCount(),
    queue.getFailedCount(),
    queue.getDelayedCount(),
  ]);

  return {
    waiting,
    active,
    completed,
    failed,
    delayed,
    total: waiting + active + completed + failed + delayed,
  };
}

/**
 * Close all queues and connections
 */
export async function closeAllQueues(): Promise<void> {
  for (const queue of queues.values()) {
    await queue.close();
  }
  await connection.quit();
  queues.clear();
}

// Export types for worker implementations
export type { Job, Worker, QueueEvents };
export { Queue, connection };
