import { Worker, Queue } from 'bullmq';
import pino from 'pino';
import { fromUrlExtract } from './lib/extract';

const log = pino({ name: 'worker' });
const connection = { url: process.env.REDIS_URL || 'redis://localhost:6379' };
export const submitQueue = new Queue('submit', { connection });

new Worker('submit', async (job) => {
    const { url } = job.data as { url: string };
    log.info({ url }, 'processing submitted url');
    const data = await fromUrlExtract(url);
    // TODO: invoke Mock AI in dev; Real AI in prod via LiteLLM proxy
    return data;
}, { connection });

log.info('worker running');
