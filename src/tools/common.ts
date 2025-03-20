import moment from 'moment';
import {DATE_FORMATTERS, STATUS} from '../Const';
import {CityUser} from '../types/CityUser';
import firestore from "@react-native-firebase/firestore";

export function disableColor(color: string): string {
    // coerce values so ti is between 0 and 1.
    const _opacity = Math.round(Math.min(Math.max(0.5 || 1, 0), 1) * 255);
    return color + _opacity.toString(16).toUpperCase();
}

export function getMonthsForFilter() {
    moment.locale('ru');
    const monthsKeys = [];
    const startDate = new Date(2024, 8);
    const currentDate = new Date();
    const months = moment
        .duration(moment(currentDate).diff(moment(startDate)))
        .asMonths()
        .toFixed(0);
    for (let i = 0; i <= months; i++) {
        const month = new Date();
        const date = month.setMonth(currentDate.getMonth() - i);
        monthsKeys.push({
            key: moment(date).format(DATE_FORMATTERS.monthFormatKey),
            name: moment(date).format(DATE_FORMATTERS.monthFormatValue),
        });
    }
    return monthsKeys;
}

export function generateSortFn(props) {
    return function (a, b) {
        for (var i = 0; i < props.length; i++) {
            var prop = props[i];
            var name = prop.name;
            var reverse = prop.reverse;
            if (a[name] < b[name]) {
                return reverse ? 1 : -1;
            }
            if (a[name] > b[name]) {
                return reverse ? -1 : 1;
            }
        }
        return 0;
    };
}

export function getChatId(userId: string, corrId): string {
    return (corrId > userId) ? `${userId} _ ${corrId}` : `${corrId} _ ${userId}`;
}

export function toColor(num) {
    num >>>= 0;
    var b = num & 0xFF,
        g = (num & 0xFF00) >>> 8,
        r = (num & 0xFF0000) >>> 16,
        a = ((num & 0xFF000000) >>> 24) / 255;
    return 'rgba(' + [r, g, b, a].join(',') + ')';
}

export function countReviews(c: CityUser): number {
    return (c.rating1 ?? 0) + (c.rating2 ?? 0) + (c.rating3 ?? 0) + (c.rating4 ?? 0) + (c.rating5 ?? 0);
}

export function countReviewsAverageWeighted(c: CityUser): number {
    return 5 * (c?.rating1 ?? 0) + 4 * (c?.rating2 ?? 0) + 3 * (c?.rating3 ?? 0) + 2 * (c?.rating4 ?? 0) + (c?.rating5 ?? 0);
}

export function totalRatingWeighted(c: CityUser): number {
    return 5 * (c?.rating1 ?? 0) + 4 * 2 * (c?.rating2 ?? 0) + 3 * 3 * (c?.rating3 ?? 0) + 2 * 4 * (c?.rating4 ?? 0) + 5 * (c?.rating5 ?? 0);
}

export const cancelBooking = (tripRef, bookingRef, status, setError, setLoading, setSelectedBooking?) => {
    setLoading(true);
    return firestore().runTransaction(async (transaction) => {
        const bookingDoc = await transaction.get(bookingRef);
        const tripDoc = await transaction.get(tripRef);
        if (!tripDoc.exists) {
            throw 'Document does not exist!';
        }
        const bookingSnapshot = bookingDoc.data();
        const tripSnapshot = tripDoc.data();
        const countCancel = bookingSnapshot?.countBooked ?? 0;
        if (bookingSnapshot?.status === STATUS.WAITING_CONFIRMATION_BOOKING) {
            const countWaitingConfirmation = tripSnapshot?.countWaitingConfirmation ?? 0;
            transaction.update(tripRef, {
                countWaitingConfirmation: countWaitingConfirmation - countCancel,
            });
            transaction.update(bookingRef, {
                sendNotificationOnWrite: true,
                status: status,
                dateModification: new Date(),
            });
            return true;
        }
        if (bookingSnapshot?.status === STATUS.ACTIVE_BOOKING) {
            const countBooked = tripSnapshot?.countBooked ?? 0;
            transaction.update(tripRef, {
                countBooked: countBooked - countCancel,
            });
            transaction.update(bookingRef, {
                sendNotificationOnWrite: true,
                status: status,
                dateModification: new Date(),
            });
            return true;
        } else {
            throw 'Отмена уже не нужна';
        }
    })
        .then((res) => {
            console.log('cancelBooking', res);
        })
        .catch(reason => {
            setError(reason.toString());
        })
        .finally(() => {
            setLoading(false);
            setSelectedBooking(undefined);
        });
};





