import type { Translation } from '$src/types/primaryTypes';
import { getDateDay, toJsDateType, toDbDate, minutesToMilliseconds } from './helpersDate';

export type UserResponse = 'BAD' | 'HARD' | 'GOOD' | 'EASY';

const isNewCard = (card: Translation) => {
	return !card.repetition_history || card.repetition_history.length === 0;
};

export function createReviewDeck({
	latestReview,
	cards,
	max_new_cards,
	max_cards
}: {
	latestReview: Translation[] | null;
	cards: Translation[];
	max_new_cards: number;
	max_cards: number;
}): Translation[] {
	const maxReviews = max_cards - max_new_cards;
	const now = new Date();
	const nowDay = getDateDay(now);

	if (!cards) return [];
	let newList: Translation[] = [];
	let nextReview: Translation[] = [];

	const recentReview = !latestReview || latestReview.length === 0 ? [] : latestReview;

	recentReview.map((card: Translation) => {
		if (isNewCard(card)) {
			newList.push(card);
		}
	});

	cards.map((card) => {
		const latestRepetition =
			card.repetition_history && card.repetition_history[card.repetition_history.length - 1];

		if (isNewCard(card) && newList.length < max_new_cards) {
			newList.push(card);
		}
		if (!isNewCard(card) && nextReview.length < maxReviews) {
			const cardDay = getDateDay(toJsDateType(latestRepetition as string));
			// prioritize cards that are due today and missed cards get bumped to the end of the list
			if (cardDay === nowDay) {
				nextReview.push(card);
			}
			if (cardDay < nowDay) {
				nextReview.push(card);
			}
		}
	});

	newList.map((card) => nextReview.splice(Math.floor(Math.random() * nextReview.length), 0, card));
	// console.log({ cards, newList, nextReview });
	return nextReview;
}

export function calculateNextInterval(
	interval_historyutes: number[],
	repetition_history: string[],
	response: UserResponse
): number {
	const latest_interval = interval_historyutes[interval_historyutes?.length - 1] ?? 0;
	const HARD_MULITPLIER = 1;
	const GOOD_MULTIPLIER = 2.5;
	const EASY_MULTIPLIER = 4;

	const DAY_IN_MIN = 60 * 24;

	let nextInterval = 1;

	const firstView = repetition_history === null || repetition_history.length === 0;

	switch (response) {
		case 'BAD':
			// If its new, or the person is repeating the card on the same day, repeat it in 1 minute
			// if its not new, repeat it in 10 minutes
			if (firstView) {
				nextInterval = 1;
			} else {
				nextInterval = 10;
			}
			break;
		case 'HARD':
			// if its new, or the person is repeating the card on the same day, repeat it in 10 minutes
			if (firstView) {
				nextInterval = 5;
			}
			// if the last interview was more than two days ago, repeat it in 1 day
			else if (latest_interval > DAY_IN_MIN * 2) {
				nextInterval = DAY_IN_MIN;
			} else {
				// if its not new, intervalToMs stays the same
				nextInterval = latest_interval * HARD_MULITPLIER;
			}
			break;
		case 'GOOD':
			// Good response: apply the spaced repetition algorithm
			if (firstView) {
				nextInterval = 10;
			} else if (latest_interval < DAY_IN_MIN) {
				nextInterval = DAY_IN_MIN;
			} else {
				nextInterval = latest_interval * GOOD_MULTIPLIER; // The standard multiplier in Anki is 2.5
			}
			break;
		case 'EASY':
			if (firstView || latest_interval < DAY_IN_MIN * 4) {
				nextInterval = DAY_IN_MIN * 4;
			} else {
				// Easy response: increase intervalToMs more significantly
				nextInterval = latest_interval * EASY_MULTIPLIER;
			}
			break;
	}

	return Math.floor(nextInterval);
}

export function setNextRepetition(nextInterval: number): string {
	const now = new Date();
	const nowDay = getDateDay(now);
	const daysInFuture = Math.floor(nextInterval / (60 * 24));
	//if the nextInterval is less than a day, set next repetition to current time + nextInterval
	if (daysInFuture === 0) {
		return toDbDate(new Date(now.getTime() + minutesToMilliseconds(nextInterval)));
	}
	//if the nextInterval is more than a day, calculate the number of days based on the nextInterval (in ms) and set next repetition to that number of days from now
	return toDbDate(new Date(nowDay.getTime() + minutesToMilliseconds(daysInFuture * 60 * 24)));
}
