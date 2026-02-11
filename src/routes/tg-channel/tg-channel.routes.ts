import { Hono } from 'hono';
import { messageCreateSchema, postCreateSchema } from './tg-channel.types';
import { bot, botStart, handlerRawDataByAI, scheduleStart, sendMessage } from './tg-channel.handler';

export const tgChannel = new Hono();

/**
 * Создать новый пост
 */
tgChannel.post('/test-ai', async (c) => {
  const body = await c.req.json();

  const { data, success, error } = postCreateSchema.safeParse(body);
  if (!success) {
    return c.json(error, 400);
  }

  const result = await handlerRawDataByAI(data);

  console.debug({ result });

  return c.json({ success: 'ok', data: result }, 201);
});

/**
 * Отправить сообщение пользователю в телеграм его username
 */
tgChannel.post('/message', async (c) => {
  const body = await c.req.json();

  const { data, success, error } = messageCreateSchema.safeParse(body);
  if (!success) {
    return c.json(error, 400);
  }

  await sendMessage(bot, {
    message: data.text,
    userId: data.userId,
  });

  return c.json({ success: 'ok' }, 201);
});

/**
 * запустить бота
 */
tgChannel.post('/bot-start', async (c) => {
  try {
    await botStart()
    return c.json({ success: 'ok' }, 201);
  }
  catch (err) {
    return c.json({ success: 'no', data: err }, 429);
  }
});

/**
 * запустить каледнарь напоминаний
 */
tgChannel.post('/schedule-start', async (c) => {
  try {
    await scheduleStart()
    return c.json({ success: 'ok' }, 201);
  }
  catch (err) {
    return c.json({ success: 'no', data: err }, 500);
  }
});




