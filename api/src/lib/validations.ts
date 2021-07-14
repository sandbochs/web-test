import { isValid } from 'date-fns';
// some basic validations
// We expect HH:MM
export function isTimeString(time: any) {
  if (typeof time !== 'string') return false;

  const date = new Date(`1970-01-01T${time}:00.000Z`)
  return isValid(date);
}

// This function expects a valid time string
export function isValidInterval(time: string, interval: number) {
  try {
    const [, minutes] = time.split(':');
    const min = parseInt(minutes, 10);

    return min % interval === 0;
  } catch (error) {
    return false;
  }
}