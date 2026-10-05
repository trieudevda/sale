import { BUSINESS_TIME_ZONE, dayjs } from "config/datetime.config";

function validDate(value: Date): Date {
  if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
    throw new RangeError('Ngày giờ không hợp lệ');
  }
  return value;
}

/** Tạo thời điểm hiện tại; Date không tự mang múi giờ UTC/VN. */
export function nowUtc(): Date {
  return new Date();
}

/** Cộng phút từ một thời điểm, tính trên UTC. */
export function addMinutes(value: Date, minutes: number): Date {
  if (!Number.isInteger(minutes)) throw new RangeError('Số phút phải là số nguyên');
  return dayjs.utc(validDate(value)).add(minutes, 'minute').toDate();
}

/** Cộng ngày 24 giờ từ một thời điểm, tính trên UTC. */
export function addDays(value: Date, days: number): Date {
  if (!Number.isInteger(days)) throw new RangeError('Số ngày phải là số nguyên');
  return dayjs.utc(validDate(value)).add(days, 'day').toDate();
}

/** Đọc thời điểm theo giờ Việt Nam để hiển thị. */
export function formatVietnam(
  value: Date,
  pattern = 'DD/MM/YYYY HH:mm:ss',
): string {
  return dayjs(validDate(value)).tz(BUSINESS_TIME_ZONE).format(pattern);
}

/** -1: trước; 0: cùng thời điểm; 1: sau. */
export function compare(a: Date, b: Date): -1 | 0 | 1 {
  const left = validDate(a).getTime();
  const right = validDate(b).getTime();
  return left < right ? -1 : left > right ? 1 : 0;
}

/** Đã đến hạn hoặc quá hạn tại thời điểm tham chiếu. */
export function isExpired(deadline: Date, reference = nowUtc()): boolean {
  return compare(deadline, reference) <= 0;
}