import { it, describe, vi } from 'vitest'
import { formatDateTime } from '~/utils/datetime'

vi.mock('~/utils/datetime')

import {
  UserCurrentStep,
  bot,
  botStart,
  buildTasksMap,
  handlerBotCommands,
  handlerRawDataByAI,
  scheduleStart,
  sendMessage,
  userCallContext,
} from './tg-channel.handler'
import { env } from '~/env'

if(env.TEST_AI_ENABLE == true) {
  describe('Testing AI answers', () => {
    /** Текущие дата и время */
    const todayDateTime = '11.06.2025T13:00:00';
    const task = 'Пример задачи';

    // Мокаем значение формата сегодняшней даты
    (formatDateTime as any).mockReturnValue(todayDateTime)

    /* Датасет входных данных для максимального кол-ва вариантов запросов к AI */
    let variants = {
      v_1: { input: 'каждый день в 8 утра', output:{ repeat:'daily',interval:1,weekdays:null,time:'08:00:00',timezone:'UTC+4',next_date:'12.06.2025'}},
      v_2: { input: 'каждый день в 14:00', output:{ repeat:'daily',interval:1,weekdays:null,time:'14:00:00',timezone:'UTC+4',next_date:'11.06.2025'}},
      v_3: { input: 'каждый день', output:{ repeat:'daily',interval:1,weekdays:null,time:'09:00:00',timezone:'UTC+4',next_date:'12.06.2025'}},
      v_4: { input: 'ежедневно в 13:00', output:{ repeat:'daily',interval:1,weekdays:null,time:'13:00:00',timezone:'UTC+4',next_date:'12.06.2025'}},
      v_5: { input: 'ежедневно в 13:10', output:{ repeat:'daily',interval:1,weekdays:null,time:'13:10:00',timezone:'UTC+4',next_date:'11.06.2025'}},
      v_6: { input: 'каждый день в 00:30', output:{ repeat:'daily',interval:1,weekdays:null,time:'00:30:00',timezone:'UTC+4',next_date:'12.06.2025'}},
      v_7: { input: 'один раз в 18:20 сегодня', output:{ repeat:'none',interval:null,weekdays:null,time:'18:20:00',timezone:'UTC+4',next_date:'11.06.2025'}},
      v_8: { input: 'один раз завтра в 9 утра', output:{ repeat:'none',interval:null,weekdays:null,time:'09:00:00',timezone:'UTC+4',next_date:'12.06.2025'}},
      v_9: { input: 'завтра', output:{ repeat:'none',interval:null,weekdays:null,time:'09:00:00',timezone:'UTC+4',next_date:'12.06.2025'}},
      v_10:{ input:'через 1 день в 10:00', output:{ repeat:'none',interval:null,weekdays:null,time:'10:00:00',timezone:'UTC+4',next_date:'12.06.2025'}},
      v_11:{ input:'через 2 дня в 10:00', output:{ repeat:'none',interval:null,weekdays:null,time:'10:00:00',timezone:'UTC+4',next_date:'13.06.2025'}},
      v_12:{ input:'через 7 дней в 10:00', output:{ repeat:'none',interval:null,weekdays:null,time:'10:00:00',timezone:'UTC+4',next_date:'18.06.2025'}},
      v_13:{ input:'послезавтра в 7:15', output:{ repeat:'none',interval:null,weekdays:null,time:'07:15:00',timezone:'UTC+4',next_date:'13.06.2025'}},
      v_14:{ input:'в пятницу в 9:00', output:{ repeat:'weekly',interval:1,weekdays:['fri'],time:'09:00:00',timezone:'UTC+4',next_date:'13.06.2025'}},
      v_15:{ input:'каждую пятницу в 9:00', output:{ repeat:'weekly',interval:1,weekdays:['fri'],time:'09:00:00',timezone:'UTC+4',next_date:'13.06.2025'}},
      v_16:{ input:'каждую пятницу', output:{ repeat:'weekly',interval:1,weekdays:['fri'],time:'09:00:00',timezone:'UTC+4',next_date:'13.06.2025'}},
      v_17:{ input:'каждый понедельник в 10:00', output:{ repeat:'weekly',interval:1,weekdays:['mon'],time:'10:00:00',timezone:'UTC+4',next_date:'16.06.2025'}},
      v_18:{ input:'каждый вторник в 10:00', output:{ repeat:'weekly',interval:1,weekdays:['tue'],time:'10:00:00',timezone:'UTC+4',next_date:'17.06.2025'}},
      v_19:{ input:'каждую среду в 10:00', output:{ repeat:'weekly',interval:1,weekdays:['wed'],time:'10:00:00',timezone:'UTC+4',next_date:'18.06.2025'}},
      v_20:{ input:'каждую среду в 14:00', output:{ repeat:'weekly',interval:1,weekdays:['wed'],time:'14:00:00',timezone:'UTC+4',next_date:'11.06.2025'}},
      v_21:{ input:'по будням в 9:30', output:{ repeat:'weekly',interval:1,weekdays:['mon','tue','wed','thu','fri'],time:'09:30:00',timezone:'UTC+4',next_date:'12.06.2025'}},
      v_22:{ input:'по выходным в 11:00', output:{ repeat:'weekly',interval:1,weekdays:['sat','sun'],time:'11:00:00',timezone:'UTC+4',next_date:'14.06.2025'}},
      v_23:{ input:'каждую субботу в 11:00', output:{ repeat:'weekly',interval:1,weekdays:['sat'],time:'11:00:00',timezone:'UTC+4',next_date:'14.06.2025'}},
      v_24:{ input:'каждое воскресенье в 11:00', output:{ repeat:'weekly',interval:1,weekdays:['sun'],time:'11:00:00',timezone:'UTC+4',next_date:'15.06.2025'}},
      v_25:{ input:'каждые 2 недели в пятницу в 9:00', output:{ repeat:'weekly',interval:2,weekdays:['fri'],time:'09:00:00',timezone:'UTC+4',next_date:'13.06.2025'}},
      v_26:{ input:'каждые 3 недели в среду в 14:00', output:{ repeat:'weekly',interval:3,weekdays:['wed'],time:'14:00:00',timezone:'UTC+4',next_date:'11.06.2025'}},
      v_27:{ input:'каждые 3 недели в среду в 12:00', output:{ repeat:'weekly',interval:3,weekdays:['wed'],time:'12:00:00',timezone:'UTC+4',next_date:'02.07.2025'}},
      v_28:{ input:'раз в неделю в пятницу в 9:00', output:{ repeat:'weekly',interval:1,weekdays:['fri'],time:'09:00:00',timezone:'UTC+4',next_date:'13.06.2025'}},
      v_29:{ input:'каждую неделю в четверг в 8:00', output:{ repeat:'weekly',interval:1,weekdays:['thu'],time:'08:00:00',timezone:'UTC+4',next_date:'12.06.2025'}},
      v_30:{ input:'каждый месяц 5 числа в 10:00', output:{ repeat:'monthly',interval:1,weekdays:null,time:'10:00:00',timezone:'UTC+4',next_date:'05.07.2025'}},
      v_31:{ input:'каждый месяц 11 числа в 12:00', output:{ repeat:'monthly',interval:1,weekdays:null,time:'12:00:00',timezone:'UTC+4',next_date:'11.07.2025'}},
      v_32:{ input:'каждый месяц 11 числа в 14:00', output:{ repeat:'monthly',interval:1,weekdays:null,time:'14:00:00',timezone:'UTC+4',next_date:'11.06.2025'}},
      v_33:{ input:'каждый месяц 1 числа', output:{ repeat:'monthly',interval:1,weekdays:null,time:'09:00:00',timezone:'UTC+4',next_date:'01.07.2025'}},
      v_34:{ input:'каждые 2 месяца 10 числа в 10:00', output:{ repeat:'monthly',interval:2,weekdays:null,time:'10:00:00',timezone:'UTC+4',next_date:'10.08.2025'}},
      v_35:{ input:'каждый год 1 января в 10:00', output:{ repeat:'yearly',interval:1,weekdays:null,time:'10:00:00',timezone:'UTC+4',next_date:'01.01.2026'}},
      v_36:{ input:'каждый год 11 июня в 12:00', output:{ repeat:'yearly',interval:1,weekdays:null,time:'12:00:00',timezone:'UTC+4',next_date:'11.06.2026'}},
      v_37:{ input:'каждый год 11 июня в 14:00', output:{ repeat:'yearly',interval:1,weekdays:null,time:'14:00:00',timezone:'UTC+4',next_date:'11.06.2025'}},
      v_38:{ input:'в 1:45pm завтра', output:{ repeat:'none',interval:null,weekdays:null,time:'13:45:00',timezone:'UTC+4',next_date:'12.06.2025'}},
      v_39:{ input:'завтра в 12', output:{ repeat:'none',interval:null,weekdays:null,time:'12:00:00',timezone:'UTC+4',next_date:'12.06.2025'}},
      v_40:{ input:'сегодня в 13:00', output:{ repeat:'none',interval:null,weekdays:null,time:'13:00:00',timezone:'UTC+4',next_date:'12.06.2025'}},
      v_41:{ input:'сегодня в 13:00:01', output:{ repeat:'none',interval:null,weekdays:null,time:'13:00:01',timezone:'UTC+4',next_date:'11.06.2025'}},
      v_42:{ input:'напомни в 9', output:{ repeat:'none',interval:null,weekdays:null,time:'09:00:00',timezone:'UTC+4',next_date:'12.06.2025'}},
      v_43:{ input:'напомни в 21:00', output:{ repeat:'none',interval:null,weekdays:null,time:'21:00:00',timezone:'UTC+4',next_date:'11.06.2025'}},
      v_44:{ input:'через 0 дней в 18:00', output:{ repeat:'none',interval:null,weekdays:null,time:'18:00:00',timezone:'UTC+4',next_date:'11.06.2025'}},
      v_45:{ input:'каждую пятницу в 6 вечера', output:{ repeat:'weekly',interval:1,weekdays:['fri'],time:'18:00:00',timezone:'UTC+4',next_date:'13.06.2025'}},
      v_46:{ input:'каждые 2 недели по выходным в 11:00', output:{ repeat:'weekly',interval:2,weekdays:['sat','sun'],time:'11:00:00',timezone:'UTC+4',next_date:'14.06.2025'}},
      v_47:{ input:'каждый день в 23:59', output:{ repeat:'daily',interval:1,weekdays:null,time:'23:59:00',timezone:'UTC+4',next_date:'11.06.2025'}},
      v_48:{ input:'через 30 дней в 10:00', output:{ repeat:'none',interval:null,weekdays:null,time:'10:00:00',timezone:'UTC+4',next_date:'11.07.2025'}},
      v_49:{ input:'через 365 дней в 10:00', output:{ repeat:'none',interval:null,weekdays:null,time:'10:00:00',timezone:'UTC+4',next_date:'11.06.2026'}},
      v_50:{ input:'напомни завтра', output:{ repeat:'none',interval:null,weekdays:null,time:'09:00:00',timezone:'UTC+4',next_date:'12.06.2025'}},
    }

    type VariantsKey = keyof typeof variants
    /** Исключить всё кроме одной записи чтобы протестировать только её */
    const excludeAllBut: VariantsKey | null = 'v_3'
    // const excludeAllBut: VariantsKey | null = null

    if(excludeAllBut) {
      // @ts-ignore
      variants = { [excludeAllBut]: variants[excludeAllBut] }
    }

    for (const key of Object.keys(variants)) {
      const k = key as VariantsKey

      it(`variant [${k}]`, async ({ expect }) => {
        expect(await handlerRawDataByAI({ rawDeliveryAt: variants[k].input, task })).toMatchObject(variants[k].output)
      })
    }
  })

  /*
     × variant [v_3] 1960ms
     × variant [v_4] 2137ms
     × variant [v_6] 2448ms
     × variant [v_17] 1848ms
     × variant [v_20] 1928ms
     × variant [v_24] 1533ms
     × variant [v_26] 3277ms
     × variant [v_27] 1637ms
     × variant [v_32] 1634ms
     × variant [v_37] 1846ms
     × variant [v_40] 1945ms
     × variant [v_42] 1537ms
     × variant [v_45] 2231ms
     × variant [v_47] 2862ms
     × variant [v_49] 1525ms
  */
}
