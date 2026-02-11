import moment from 'moment';
import { Task } from '~/db/tasks-map';

/** @returns 'DD.MM.YYYY' */
export const today = () => moment().format('DD.MM.YYYY');

/** @returns '09:00:00' */
export function getTimeByTemplate() {
  return moment().format('HH:mm:ss');
}

/**
 * вход -> '12:30:12'
 * @returns ''
 */
export function parseTimeToMs(
  timeStr: string,
  template = 'HH:mm:ss',
  timezone = 'UTC+4',
) {
  const offsetHours = Number(timezone.replace('UTC', ''));
  const m = moment(timeStr, template).utc().add(offsetHours, 'hours');

  return m.valueOf();
}

/**
 * Приводит время к определенному формату
 * @returns например строку вида `DD.MM.YYYYTHH:mm:ss`
 * */
export function formatDateTime(
  /** текущая дата и время в формате Date | number */
  datetime?: Date | number | null,
  /** Шаблон к которому приводим время */
  template = 'DD.MM.YYYYTHH:mm:ss',
) {
  return moment(datetime || Date.now()).format(template);
}

/**
 * @returns 'UTC+4'
 */
export function getTZ() {
  const offsetHours = moment().utcOffset() / 60;
  return `UTC${offsetHours >= 0 ? '+' : ''}${offsetHours}`;
}

/**
 * Сравнить 2 даты в миллисекундах
 * @returns
 * * 1 - значит что текущая дата опередила вторую
 * * -1 - значит что текущая дата еще не дошла до второй
 * * 0 - даты сравнялись на данный момент
 * */
export function compareDates(
  currentDate: number,
  secondDate: number,
): 1 | 0 | -1 {
  if (!currentDate || !secondDate) {
    console.warn('оба аргмуента обязательны');
    return 0;
  }

  const diff = currentDate - secondDate;
  if (diff > 0) return 1;
  else if (diff < 0) return -1;
  return 0;
}

export function calcNextRunAt(task: Task): number | null {
  const p = task.parsedJson;
  if (!p || p.repeat === 'none') {
    return null;
  }

  const interval = p.interval ?? 1;
  const tz = p.timezone ?? 'UTC+4';

  // точка отсчёта — момент фактического выполнения
  let base = moment(task.lastRunAt ?? Date.now());

  // всегда выставляем нужное время
  const [hh, mm, ss] = p.time.split(':').map(Number);
  base = base.set({ hour: hh, minute: mm, second: ss, millisecond: 0 });

  switch (p.repeat) {
    case 'daily':
      base = base.add(interval, 'day');
      break;

    case 'weekly':
      if (p.weekdays && p.weekdays.length > 0) {
        // ищем ближайший разрешённый weekday
        for (let i = 1; i <= 7; i++) {
          const candidate = base.clone().add(i, 'day');
          const wd = candidate.format('ddd').toLowerCase().slice(0, 3);
          if (p.weekdays.includes(wd as any)) {
            base = candidate;
            break;
          }
        }
      } else {
        base = base.add(interval, 'week');
      }
      break;

    case 'monthly':
      base = base.add(interval, 'month');
      break;

    case 'yearly':
      base = base.add(interval, 'year');
      break;
  }

  return base.valueOf();
}

/** Преобразовать unix мс в вид `'YYYY-MM-DDTHH:mm:ss.000Z'` */
export function formatToISODate(timestamp: number) {
  return new Date(timestamp).toISOString()
}
