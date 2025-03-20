export const TABLES = {
    TRIPS: 'trips',
    BOOKINGS: 'booking',
    USERS: 'users',
    PLACES: 'places',
    PLACE_NAMES: 'places_names',
    ITEMS: 'items',
    VEHICLES: 'vehicles',
    EXTERNAL_PHONES: 'external_phones',
    BLACK_LIST: 'black_list',
    CHATS: 'lastChatUnreadCounts',
    MESSAGES: 'privateMessages',
    REVIEWS: 'reviews',
    ADMINISTRATION: 'administration',
    TRACK_CATEGORIES: 'track_categories',
    AUDIO_TRACKS: 'audio_tracks',
    AUDIO_ANSWERS: 'audio_answers',
    AUDIO_TRACK_REACTIONS: 'audio_track_reactions',
    QUIZ_RESULTS: 'quiz_results',
    DATING_FORMS: 'datingForm',
};

export const FIELDS = {
    USER_UID: 'uid',
    AUTHOR_REF: 'authorRef',
    USER_REF: 'userRef',
    DRIVER_REF: 'driverRef',
    PASSENGER_REF: 'passengerRef',
    DATE_DEPARTURE: 'dateDeparture',
    DATE_ARRIVAL: 'dateArrival',
    DATE_MODIFICATION: 'dateModification',
    DEPARTURE_REF: 'departureRef',
    ARRIVAL_REF: 'arrivalRef',
    SORT: 'sort',
    NAME: 'name',
    NAME_RU: 'name_ru',
    TRIP_REF: 'tripRef',
    PHONE: 'phone',
    DATE_REGISTRATION: 'dateRegistration',
    BLACK_LIST: 'toBlackList',
    DATE: 'date',
    CHAT_MEMBERS: 'chat_members',
    ID: 'id',
    STATUS: 'status',
    COUNT_PLACES: 'countPlaces',
    ROUTE_PATH: 'routePath',
    FRONT_SEAT: 'frontSeat',
    COUNT_UNREAD: 'countUnread',
    TYPE: 'type',
    QUIZ_SUCCESS_AUDIO: 'quizSuccessAudio',
    QUIZ_FAILURE_AUDIO: 'quizFailureAudio',
    CATEGORY_REF: 'categoryRef',
    TRACK_REF: 'trackRef',
    VERIFIED: 'verified',
    QUIZ_TRACK_RATING_MEMBER:'quizTrackRatingMember'
};

export const STATUS = {
    WAITING_CONFIRMATION_BOOKING: 0,
    ACTIVE_BOOKING: 1,
    CANCELED_BY_PASSENGER: 2,
    CANCELED_BY_DRIVER: 3,
    REJECTED_BY_PASSENGER: 4,
    REJECTED_BY_DRIVER: 5,
    PASSENGER_IN_BLACK_LIST: 6,
};

export const ANDROID_CHANNELS = {
    MESSAGES: 'MESSAGES',
    BOOKING: 'BOOKING',
};

export const PUSH_MESSAGES = {
    REVIEW_RECEIVED: 'У вас новая оценка',
};
export const PATH_PATH_DIVIDER = ' *** ';

export const PAGE_COUNT = 10;
export const DATE_FORMATTERS = {
    monthFormatKey: 'yyyy_MM',
    monthFormatValue: 'MMM yyyy',
    datMonthYear: 'DD MMM yyyy',
    yearMonthDay: 'yyyy-MM-DD',
};

export const USER = 'user';
export const EXTERNAL_USER_ID = '_external';
export const EXTERNAL_SERVICE_BLACAR = 'Blacar';
export const EXTERNAL_SERVICE_VIBER = 'Viber';
export const EXTERNAL_SERVICE_MESSENGER = 'Telegram';
export const EXTERNAL_SERVICE_PHONE = 'Phone';
export const NOTE = 'note';
export const KEEP = 'keep';
export const LAST_REVIEW_PROMPT = 'lastReviewPrompt';
export const supportId = 'Ym9536ScDhVI1jnDC1ej3YqxQ6Q2';
export const CONSTANTS = 'constants';
export const SUPPORT_REGIONS = 'support_regions';


export const STORAGE_KEYS = {
    drivers: 'drivers',
    passengers: 'passengers',
    places: 'places',
    copyTripsManualShowed: 'copyTripsManualShowed',
    routes: 'routes',
    placeDeparture: 'placeDeparture',
    placeArrival: 'placeArrival',
    invitedby: 'invitedby',
};

export const APP_MODE = {
    MODE: 'mode',
    SEARCH: 'search',
    SCHEDULE: 'schedule',
};

export const TRACK_TYPES = {
    TYPE_QUIZ: 1
}
export const TRACK_REACTION = {
    LIKE: 1,
    SHARE: 2,
}
