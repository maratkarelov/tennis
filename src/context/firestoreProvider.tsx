import {createContext} from 'react';
import {CityUser} from '../types/CityUser';

export const FirestoreContext = createContext({
    setCityUser: (value: CityUser | undefined) => {
    },
    getCityUser: () => {
        return {
            ref: undefined,
            name: undefined,
            phone: undefined,
            photoUrl: undefined,
            blocked: undefined,
            verified: undefined,
            locations: undefined,
            someBoolean: undefined,
            countryCode: undefined,
            lastAppRateDate: undefined,
            dateRegistration: undefined,
            tokens: undefined
        } as CityUser|undefined;
    },
});
