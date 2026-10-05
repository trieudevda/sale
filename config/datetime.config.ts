import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
import 'dayjs/locale/vi.js';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale('vi');

export const BUSINESS_TIME_ZONE = 'Asia/Ho_Chi_Minh';
export { dayjs };

