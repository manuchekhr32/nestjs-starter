export function getFutureTime(seconds: number) {
  const date = new Date();
  date.setSeconds(new Date().getSeconds() + seconds);
  return date;
}

export function getPastTime(seconds: number) {
  const now = new Date();
  return new Date(now.getTime() - seconds * 1000);
}

export function secToMills(seconds: number) {
  return seconds * 1000;
}
