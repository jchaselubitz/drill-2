// export function rfc3339(d: Date) {
// 	function pad(n: number) {
// 		return n < 10 ? '0' + n : n;
// 	}

// 	return (
// 		d.getFullYear() +
// 		'-' +
// 		pad(d.getMonth() + 1) +
// 		'-' +
// 		pad(d.getDate()) +
// 		'T' +
// 		pad(d.getHours()) +
// 		':' +
// 		pad(d.getMinutes()) +
// 		':' +
// 		pad(d.getSeconds())
// 	);
// }

export const toDbDate = (date: Date) => date.toISOString();
export const toJsDateType = (date: string): Date => new Date(date);

export function getDateDay(date: Date): Date {
	const today = new Date();
	today.setHours(0, 0, 0, 0);
	return today;
}

export function isSameDate(date1: Date, date2: Date): boolean {
	date1.setHours(0, 0, 0, 0);
	date2.setHours(0, 0, 0, 0);
	return date1.toLocaleDateString() === date2.toLocaleDateString();
}

export function minutesToMilliseconds(intervalMinutes: number): number {
	return intervalMinutes * 60 * 1000;
}

export function getHumanDate(date: Date): string {
	const options: Intl.DateTimeFormatOptions = {
		day: 'numeric',
		month: 'short',
		year: 'numeric'
	};
	return date.toLocaleDateString('en-US', options);
}
