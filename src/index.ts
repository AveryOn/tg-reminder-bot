import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { env } from './env';
import { tgChannel } from '~/routes/tg-channel/tg-channel.routes';
import { botStart, scheduleStart } from './routes/tg-channel/tg-channel.handler';
import { createDatabaseDir } from './db';

const app = new Hono();

app.route('/api', tgChannel);

(async () => {
  await createDatabaseDir()
  if(env.NODE_ENV === 'production') {
    await botStart()
    await scheduleStart()
  }
})();

serve({
  fetch: app.fetch,
  port: env.TG_CHANNEL_PORT,
});

console.log(`🚀 Server running at http://localhost:${env.TG_CHANNEL_PORT}`);
