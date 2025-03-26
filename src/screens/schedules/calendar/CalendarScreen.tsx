import {StackScreenProps} from '@react-navigation/stack';
import {BaseLayout} from '../../../components/base/BaseLayout';
import {Calendar} from 'react-native-calendars';
import {
    FlatList,
    Image,
    SafeAreaView,
    ScrollView,
    Text,
    TouchableOpacity,
    useWindowDimensions,
    View,
} from 'react-native';
import React, {useContext, useEffect, useMemo, useRef, useState} from 'react';
import firestore from '@react-native-firebase/firestore';
import {
    APP_MODE,
    DATE_FORMATTERS,
    EXTERNAL_USER_ID,
    FIELDS,
    PATH_PATH_DIVIDER,
    STATUS,
    STORAGE_KEYS,
    TABLES,
} from '../../../Const';
import moment from 'moment';
import Styles from './styles';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {baseColor} from '../../../theme/appTheme';
import I18n from '../../../locales/i18n';
import {countReviewsAverageWeighted, generateSortFn, toColor, totalRatingWeighted} from '../../../tools/common';
import * as Progress from 'react-native-progress';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CopyTripsSheet from './CopyTripsSheet';
import {getParamByISO} from 'iso-country-currency';
import {useIsFocused} from '@react-navigation/native';
import {Laurel} from '../../../components/SVG';
import {FirestoreContext} from '../../../context/firestoreProvider';
import SegmentedControl from '@react-native-segmented-control/segmented-control';
import auth from "@react-native-firebase/auth";


interface Props extends StackScreenProps<any, any> {
}

const CalendarScreen = ({navigation, route}: Props) => {
        const firestoreContext = useContext(FirestoreContext);
        const segments = [I18n.t('my'), I18n.t('all')];
        const [appMode, setAppMode] = useState();
        const [loading, setLoading] = useState(false);
        const [confirm, setConfirm] = useState(undefined);
        const [error, setError] = useState(undefined);
        const [loadedUsersCount, setLoadedUsersCount] = useState(0);
        const [myUid, setMyUid] = useState(firestoreContext.getCityUser()?.ref.id);
        const [cityUser, setCityUser] = useState(firestoreContext.getCityUser());
        const visibleOtherDriverBookings = cityUser?.trustedDriver === true || cityUser?.someBoolean === true;
        const [showCopyTripsSheet, setShowCopyTripsSheet] = useState(false);
        const [selected, setSelected] = useState('');
        const [day, setDay] = useState(new Date().getDate());
        const [monthFirstDay, setMonthFirstDay] = useState();
        const [allTripsSwitch, setAllTripsSwitch] = useState(false);
        const [routes, setRoutes] = useState([]);
        const [futureUsers, setFutureUsers] = useState([]);
        const [futureBookings, setFutureBookings] = useState([]);
        const [trips, setTrips] = useState([]);
        const [myBookingTrips, setMyBookingTrips] = useState([]);
        const [tripsToShow, setTripsToShow] = useState([]);
        const [places, setPlaces] = useState([]);
        const [myPlaces, setMyPlaces] = useState([]);
        const [myBookings, setMyBookings] = useState([]);
        const [drivers, setDrivers] = useState([]);
        const [copyDates, setCopyDates] = useState([]);
        const [existTripsDates, setExistTripsDates] = useState();
        const [existTripsDaysWarning, setExistTripsDaysWarning] = useState();
        const [nextMonthCopyWarning, setNextMonthCopyWarning] = useState(false);
        const [startCopyDate, setStartCopyDate] = useState();
        const [copyDaysCount, setCountCallback] = useState();
        const refCopyTrips = useRef();
        const isFocused = useIsFocused();
        //================================================
        // hooks
        //================================================
        // console.log('startCopyDate', startCopyDate);
        // console.log('appMode', appMode, isFocused, allTripsSwitch, cityUser?.name);

        useEffect(() => {
            if (isFocused) {
                // console.log('isFocused', isFocused, appMode, firestoreContext.getCityUser()?.name)
                AsyncStorage.getItem(APP_MODE.MODE).then(mode => {
                    setAppMode(mode);
                });

                const user = firestoreContext.getCityUser();
                setCityUser(user);
                setMyUid(user?.ref.id);
                const switchValue = (user === undefined || appMode === APP_MODE.SEARCH) ? false : allTripsSwitch
                setAllTripsSwitch(switchValue);
            }
        }, [isFocused, appMode, firestoreContext.getCityUser()]);

        useEffect(() => {
            const list = [];
            copyDates.forEach(date => {
                const count = existTripsDates[date]?.count;
                if (count > 0) {
                    list.push(' ' + date.substring(8));
                }
            });
            setExistTripsDaysWarning(list.toString());
        }, [copyDates, existTripsDates]);

        useEffect(() => {
            const dates = [];
            if (copyDaysCount) {
                const currentDate = new Date();
                let nextMonthCopy = false;
                for (let i = 0; i < copyDaysCount; i++) {
                    const nextDate = new Date(startCopyDate);
                    nextDate.setDate(startCopyDate.getDate() + i);
                    if (nextDate.getMonth() !== currentDate.getMonth()) {
                        nextMonthCopy = true;
                    }
                    dates.push(moment(nextDate).format('yyyy-MM-DD'));
                }
                setNextMonthCopyWarning(nextMonthCopy);

            }
            setCopyDates(dates);

        }, [startCopyDate, copyDaysCount]);

        useEffect(() => {
            navigation.setOptions({
                headerShown: false,
                headerBackTitle: ' ',
            });

        }, [navigation]);

        const readCopyTripsManualShowed = async () => {
            if (cityUser?.trustedDriver === true) {
                const showCopyTripsManual = !await AsyncStorage.getItem(STORAGE_KEYS.copyTripsManualShowed);
                // console.log('showCopyTripsManual', showCopyTripsManual);
                if (showCopyTripsManual && appMode === APP_MODE.SCHEDULE) {
                    setConfirm(I18n.t('copy_trips_manual'));
                }
            }
        };

        useEffect(() => {
            const today = new Date();
            const firstDay = new Date(today.getFullYear(), today.getMonth(), 1, 0, 0, 0, 0);
            setMonthFirstDay(firstDay);
            readCopyTripsManualShowed();
            AsyncStorage.getItem(STORAGE_KEYS.routes).then(value => {
                if (value === null || value?.length === 0) {
                    setRoutes([]);
                } else {
                    setRoutes(JSON.parse(value));
                }
            });
            const subscribeAuth = auth().onAuthStateChanged(async user => {
                if (user?.isAnonymous) {
                    setCityUser(undefined);
                } else if (user !== null) {
                    firestore().collection(TABLES.USERS).doc(auth().currentUser?.uid).get().then(ds => {
                        const value = {ref: ds.ref, ...ds.data()};
                        // console.log('subscribeAuth')
                        setCityUser(value);
                    });
                } else {
                    setCityUser(undefined);
                }
                return true;
            });

            return () => {
                subscribeAuth();
            };

        }, []);
        // console.log('user', cityUser?.ref?.id, cityUser);

        useEffect(() => {
            const myPlacePaths = [];
            const placePaths = [];
            const driverPaths = [];
            trips.filter(trip => trip.driverRef.id === myUid).forEach(trip => {
                if (myPlacePaths.find(path => trip.departureRef.path === path) === undefined) {
                    myPlacePaths.push(trip.departureRef.path);
                }
                if (myPlacePaths.find(path => trip.arrivalRef.path === path && trip.driverRef.id === myUid) === undefined) {
                    myPlacePaths.push(trip.arrivalRef.path);
                }
            });
            trips.forEach(trip => {
                if (placePaths.find(path => trip.departureRef.path === path) === undefined) {
                    placePaths.push(trip.departureRef.path);
                }
                if (placePaths.find(path => trip.arrivalRef.path === path) === undefined) {
                    placePaths.push(trip.arrivalRef.path);
                }
                if (driverPaths.find(path => trip.driverRef.path === path) === undefined) {
                    driverPaths.push(trip.driverRef.path);
                }
            });
            myBookingTrips.forEach(trip => {
                if (placePaths.find(path => trip.departureRef.path === path) === undefined) {
                    placePaths.push(trip.departureRef.path);
                }
                if (placePaths.find(path => trip.arrivalRef.path === path) === undefined) {
                    placePaths.push(trip.arrivalRef.path);
                }
                if (driverPaths.find(path => trip.driverRef.path === path) === undefined) {
                    driverPaths.push(trip.driverRef.path);
                }
            });
            readDrivers(driverPaths);
            readPlaces(placePaths, myPlacePaths);
            fillTripsToShow();
            // console.log('myBookingTrips',myBookingTrips.length)
        }, [trips, myBookingTrips, myUid]);
        // console.log('trips+++', trips.length);

        // console.log('routes', routes)

        function fillDateTripsTotals(myTrips: any[]) {
            const datesCounts = myTrips.map(t => {
                return {
                    date: moment(new Date(t.dateDeparture.seconds * 1000)).format('yyyy-MM-DD'),
                    count: 1,
                };
            });
            const datesCountsTotals = datesCounts.reduce((res, curr) => {
                const key = `${curr.date}`;
                res[key] = res[key] || {
                    count: 0,
                };
                res[key].count = (+res[key].count + +curr.count);
                return res;
            }, {});
            setExistTripsDates(datesCountsTotals);
        }

        function fillTripsToShow() {
            if (allTripsSwitch) {
                setTripsToShow(trips);
            } else {
                const myTrips = trips.filter(item => item.driverRef?.id === myUid);
                // console.log('myTrips', myTrips)
                setTripsToShow(myTrips.concat(myBookingTrips));
                fillDateTripsTotals(myTrips);
            }
        }

        // console.log('myBookingTrips', myBookingTrips)

        useMemo(() => {
            fillTripsToShow();
        }, [allTripsSwitch, myBookingTrips]);

        // console.log('cityUser?.trustedDriver', cityUser?.trustedDriver)

        function getSubscribeTrips(firstDay, lastDay: Date, routeArray: any[]) {
            const subscribe = firestore().collection(TABLES.TRIPS)
                .where(FIELDS.DATE_DEPARTURE, '>', firstDay)
                .where(FIELDS.DATE_DEPARTURE, '<', lastDay)
                .where(FIELDS.ROUTE_PATH, 'array-contains-any', routeArray)
                .onSnapshot(snapshot => {
                    // console.log('setMyBookingTrips')
                    setTrips(snapshot?.docs?.map(qds => {
                        const {
                            dateDeparture,
                            dateArrival,
                            departureRef,
                            arrivalRef,
                            routePath,
                            driverRef,
                            vehicleRef,
                            price,
                            countPlaces,
                            countBooked,
                            countWaitingConfirmation,
                            countVisitors,
                            note,
                            autoConfirmation,
                            timeZone,
                            cancelReason,
                        } = qds.data();
                        return {
                            ref: qds.ref,
                            dateDeparture,
                            dateArrival,
                            departureRef,
                            routePath,
                            arrivalRef,
                            driverRef,
                            vehicleRef,
                            price,
                            countPlaces,
                            countBooked,
                            countWaitingConfirmation,
                            countVisitors,
                            note,
                            autoConfirmation,
                            timeZone,
                            cancelReason,
                        };
                    }));
                }, error => {
                    console.log(error.message);
                });
            return subscribe;
        }

        useEffect(() => {
                if (routes?.length > 0 && monthFirstDay) {
                    const routeArray = [];
                    routes.forEach(r => {
                        routeArray.push(r.from.path + PATH_PATH_DIVIDER + r.to?.path);
                    });
                    const lastDay = new Date(monthFirstDay?.getFullYear(), monthFirstDay?.getMonth() + 1, 0, 23, 59, 59, 999);
                    const subscribeTrips = getSubscribeTrips(cityUser?.trustedDriver ? monthFirstDay : new Date(), lastDay, routeArray);
                    return () => {
                        subscribeTrips();
                    };
                }
            },
            [monthFirstDay, routes, cityUser]
        );

        useEffect(() => {
                if (monthFirstDay) {
                    const routeArray = [];
                    routes.forEach(r => {
                        routeArray.push(r.from.path + PATH_PATH_DIVIDER + r.to?.path);
                    });
                    const lastDay = new Date(monthFirstDay?.getFullYear(), monthFirstDay?.getMonth() + 1, 0, 23, 59, 59, 999);
                    const todayStart = new Date();
                    todayStart.setHours(0);
                    todayStart.setMinutes(0);
                    todayStart.setSeconds(0);
                    todayStart.setMilliseconds(0);
                    const currentUserRef = firestore().collection(TABLES.USERS).doc(myUid);

                    const subscribeBookings = firestore().collection(TABLES.BOOKINGS)
                        .where(FIELDS.DATE_DEPARTURE, '>', todayStart)
                        .where(FIELDS.DRIVER_REF, '==', currentUserRef)
                        // .where(FIELDS.ROUTE_PATH, 'in', routeArray)
                        .orderBy(FIELDS.DATE_DEPARTURE, 'asc')
                        .onSnapshot(snapshot => {
                            setFutureBookings(snapshot?.docs?.map(qds => {
                                const {
                                    dateDeparture,
                                    dateModification,
                                    driverRef,
                                    countBooked,
                                    externalPhoneRef,
                                    externalService,
                                    keep,
                                    passengerRef,
                                    routePath,
                                    status,
                                    tripRef,
                                    frontSeat,
                                } = qds.data();
                                return {
                                    ref: qds.ref,
                                    dateDeparture,
                                    dateModification,
                                    driverRef,
                                    countBooked,
                                    externalPhoneRef,
                                    externalService,
                                    keep,
                                    passengerRef,
                                    routePath,
                                    status,
                                    tripRef,
                                    frontSeat,
                                };
                            }));
                        }, error => {
                            console.log(error.message);
                        });
                    const subscribeMyBookings = firestore().collection(TABLES.BOOKINGS)
                        .where(FIELDS.DATE_DEPARTURE, '>', monthFirstDay)
                        .where(FIELDS.DATE_DEPARTURE, '<', lastDay)
                        .where(FIELDS.PASSENGER_REF, '==', currentUserRef)
                        .orderBy(FIELDS.DATE_DEPARTURE, 'asc')
                        .onSnapshot(snapshot => {
                            // console.log('subscribeMyBookings', snapshot.size)
                            setMyBookings(snapshot?.docs?.map(qds => {
                                const {
                                    dateDeparture,
                                    dateModification,
                                    driverRef,
                                    countBooked,
                                    externalPhoneRef,
                                    externalService,
                                    keep,
                                    passengerRef,
                                    routePath,
                                    status,
                                    tripRef,
                                    frontSeat,
                                } = qds.data();
                                return {
                                    ref: qds.ref,
                                    dateDeparture,
                                    dateModification,
                                    driverRef,
                                    countBooked,
                                    externalPhoneRef,
                                    externalService,
                                    keep,
                                    passengerRef,
                                    routePath,
                                    status,
                                    tripRef,
                                    frontSeat,
                                };
                            }));
                        }, error => {
                            console.log(error.message);
                        });
                    return () => {
                        subscribeBookings();
                        subscribeMyBookings();
                    };
                }
            }
            ,
            [monthFirstDay, routes, myUid]
        );

        useEffect(() => {
            if (showCopyTripsSheet) {
                refCopyTrips.current?.open();
            }
        }, [showCopyTripsSheet]);

        useEffect(() => {
                readPassengers();
            },
            [futureBookings]
        );

        // useEffect(() => {
        //     console.log('cityUser',cityUser)
        //     if (cityUser) {
        //         setAllTripsSwitch(!cityUser?.trustedDriver);
        //     } else {
        //         setAllTripsSwitch(true)
        //     }
        // }, [cityUser]);
        //
        useEffect(() => {
            const list = [];
            myBookings.forEach(b => {
                b.tripRef.get().then(trip => {
                    list.push({ref: trip.ref, ...trip.data()});
                    if (list.length === myBookings.length) {
                        setMyBookingTrips(list);
                    }
                });
            });

        }, [myBookings]);
        // console.log('myBookings', myBookings.length)
//================================================
//  functions
//================================================
        const selectedDayTrips = tripsToShow
            .filter(item => {
                const dateDeparture = new Date(item?.dateDeparture?.seconds * 1000);
                return dateDeparture?.getDate() === day && dateDeparture?.getMonth() === monthFirstDay?.getMonth();
            });
        // console.log('selectedDayTrips', selectedDayTrips.length);
        // console.log('tripsToShow', tripsToShow.length);
        const mySelectedDayTrips = selectedDayTrips
            .filter(trip => trip.driverRef.id === myUid);

        async function readDrivers(driverPaths) {
            const driverArray = [];
            const storedDrivers = JSON.parse(await AsyncStorage.getItem(STORAGE_KEYS.drivers));
            driverPaths.forEach(path => {
                const storedDriver = storedDrivers?.find(d => d.path === path);
                if (storedDriver) {
                    driverArray.push(storedDriver);
                    if (driverArray.length === driverPaths.length) {
                        setDrivers(driverArray);
                        AsyncStorage.setItem(STORAGE_KEYS.drivers, JSON.stringify(driverArray));
                    }
                } else {
                    firestore().doc(path).get().then(s => {
                        // console.log('read driver ', path);
                        const {
                            name,
                            photoUrl,
                            moodColor,
                            phone,
                            countryCode,
                            rating1,
                            rating2,
                            rating3,
                            rating4,
                            rating5,
                        } = s.data();
                        const driver = {
                            path,
                            name,
                            photoUrl,
                            moodColor,
                            phone,
                            countryCode,
                            rating1,
                            rating2,
                            rating3,
                            rating4,
                            rating5,
                        };
                        driverArray.push(driver);
                        if (driverArray.length === driverPaths.length) {
                            setDrivers(driverArray);
                            AsyncStorage.setItem(STORAGE_KEYS.drivers, JSON.stringify(driverArray));
                        }
                    });
                }
            });
        }

        async function readPlaces(placePaths: any[], myPlacePaths: any[]) {
            // console.log('readPlaces',trips.length)
            const myPlacesArray = [];
            if (myPlacePaths.length === 0) {
                // i am passenger
                const storedRoutes = await AsyncStorage.getItem(STORAGE_KEYS.routes);
                if (storedRoutes?.length > 0) {
                    const storedPath = storedRoutes[0];
                    if (storedPath.from) {
                        myPlacesArray.push(storedPath.from);
                    }
                    if (storedPath.to) {
                        myPlacesArray.push(storedPath.to);
                    }
                    // console.log('setMyPlaces', myPlacesArray)
                    setMyPlaces(myPlacesArray);
                }
            }

            const storedPlaces = JSON.parse(await AsyncStorage.getItem(STORAGE_KEYS.places) as string);
            const placesArray = [];
            placePaths.forEach(path => {
                const storedPlace = storedPlaces?.find(d => d.path === path);
                if (storedPlace) {
                    myPlacesArray.push(storedPlace);
                    if (myPlacesArray.length === myPlacePaths.length) {
                        setMyPlaces(myPlacesArray.sort(generateSortFn([{name: FIELDS.NAME}])));
                    }
                    placesArray.push(storedPlace);
                    if (placesArray.length === placePaths.length) {
                        setPlaces(placesArray.sort(generateSortFn([{name: FIELDS.NAME}])));
                        AsyncStorage.setItem(STORAGE_KEYS.places, JSON.stringify(placesArray));
                    }
                } else {
                    firestore().doc(path).get().then(s => {
                        // console.log('read place ', path);
                        const {name_ru} = s.data();
                        const place = {path: path, name: name_ru};
                        placesArray.push(place);
                        if (placesArray.length === placePaths.length) {
                            setPlaces(placesArray.sort(generateSortFn([{name: FIELDS.NAME}])));
                            AsyncStorage.setItem(STORAGE_KEYS.places, JSON.stringify(placesArray));
                        }
                        const foundMyPlace = myPlacePaths.find(item => item === path);
                        if (foundMyPlace !== undefined) {
                            myPlacesArray.push(place);
                            if (myPlacesArray.length === myPlacePaths.length) {
                                setMyPlaces(myPlacesArray.sort(generateSortFn([{name: FIELDS.NAME}])));
                            }
                        }
                    });
                }
            });
        }

        async function readPassengers() {
            const list = [];
            if (futureBookings.length > 0) {
                // console.log('futureBookings =========================', futureBookings.length);
                const storedPassengersJson = await AsyncStorage.getItem(STORAGE_KEYS.passengers);
                // console.log('storedPassengersJson =====', new Date().toLocaleString(), storedPassengersJson);
                const storedPassengers = storedPassengersJson ? JSON.parse(storedPassengersJson) : [];
                // console.log('storedPassengers =======', new Date().toLocaleString(), storedPassengers.length, storedPassengers.map(p => p.path));
                for (const b of futureBookings) {
                    const userRef = b.passengerRef.id === EXTERNAL_USER_ID ? b.externalPhoneRef : b.passengerRef;
                    if (futureUsers.find(u => u.path === userRef.id) === undefined) {
                        const storedPassenger = storedPassengers?.find(p => p.path === userRef.path);
                        if (storedPassenger) {
                            list.push(storedPassenger);
                            // console.log('storedPassenger', userRef.id)
                        } else {
                            // console.log('read passenger', userRef.id)
                            const {
                                dateRegistration,
                                name,
                                phone,
                                moodColor,
                                photoUrl,
                                countCancel,
                                countCancelLate,
                                countTrips,
                            } = (await userRef.get()).data();
                            const user = {
                                dateRegistration,
                                path: userRef.path,
                                name,
                                phone,
                                moodColor,
                                photoUrl,
                                countCancel,
                                countCancelLate,
                                countTrips,
                            };
                            list.push(user);
                            setLoadedUsersCount(list.length);
                        }
                    }
                }
                setFutureUsers(list);
                setLoadedUsersCount(futureBookings.length);
                AsyncStorage.setItem(STORAGE_KEYS.passengers, JSON.stringify(list));

            }
        }

        const openTrip = (trip, placeDeparture, placeArrival, dateStrFull, copy) => {
            navigation.navigate('TripDetailScreen', {
                iAmAdmin: cityUser?.someBoolean,
                countryCode: cityUser?.countryCode,
                copy: copy,
                trip: trip,
                dateStrFull: dateStrFull,
                route: placeDeparture?.name + ' -> ' + placeArrival?.name,
                placeDeparture: placeDeparture,
                placeArrival: placeArrival,
                futureBookings: futureBookings.filter(b => b.tripRef.id === trip.ref.id),
                futureUsers: futureUsers,

            });
        };

        const onMonthChange = (value) => {
            setTrips([]);
            setMonthFirstDay(new Date(value.year, value.month - 1, 1));
        };

        const onDayPress = (value) => {
            setDay(value.day);
            setSelected(value.dateString);

        };

        const copyTripsCallback = () => {
            setLoading(true);
            setShowCopyTripsSheet(false);
            let counter = 0;
            mySelectedDayTrips?.forEach(trip => {
                    const dateDeparture = new Date(trip.dateDeparture.seconds * 1000);
                    const dateArrival = new Date(trip.dateArrival.seconds * 1000);
                    for (let i = 0; i < copyDaysCount; i++) {
                        const newDateDeparture = new Date(startCopyDate);
                        newDateDeparture.setDate(startCopyDate.getDate() + i);
                        newDateDeparture.setHours(dateDeparture.getHours());
                        newDateDeparture.setMinutes(dateDeparture.getMinutes());
                        const newDateArrival = new Date(startCopyDate);
                        newDateArrival.setDate(startCopyDate.getDate() + i);
                        newDateArrival.setHours(dateArrival.getHours());
                        newDateArrival.setMinutes(dateArrival.getMinutes());

                        const data = {
                            driverRef: trip.driverRef,
                            autoConfirmation: trip.autoConfirmation,
                            departureRef: trip.departureRef,
                            arrivalRef: trip.arrivalRef,
                            routePath: trip.routePath,
                            dateDeparture: newDateDeparture,
                            dateArrival: newDateArrival,
                            timeZone: trip.timeZone,
                            countPlaces: trip.countPlaces,
                            price: trip.price,
                            note: trip.note,
                            vehicleRef: trip.vehicleRef,
                        };
                        // console.log(data)
                        firestore().collection(TABLES.TRIPS).add(data).then(ref => {
                            counter++;
                            if (counter === copyDaysCount * mySelectedDayTrips?.length) {
                                setLoading(false);
                                setError('Поездки скопированы');
                            }
                        });
                    }
                }
            );

        };


//================================================
// render UI
//================================================

        const renderBookCount = (dayBooked, dayWaiting, size, marginTop, colorBook, colorWait) => {
            return <View style={[Styles.booked, {
                marginTop: marginTop,
            }]}>
                {(dayBooked || dayBooked > 0) && <View style={{
                    paddingHorizontal: size - 3,
                    backgroundColor: colorBook,
                    borderRadius: size,
                }}>
                    <Text
                        style={[Styles.bookedText, {
                            fontSize: size + 4,
                        }]}>{dayBooked}</Text>
                </View>}
                {dayWaiting > 0 && <View style={{
                    paddingHorizontal: size - 3,
                    backgroundColor: colorWait,
                    borderRadius: size,
                }}>
                    <Text
                        style={[Styles.bookedText, {
                            fontSize: size + 4,
                        }]}>{dayWaiting}</Text>
                </View>}
            </View>;
        };
        const {height} = useWindowDimensions();

        function renderTrip(trip) {
            // console.log('renderTrip(trip) ', myUid, trip.driverRef.id);
            const iAmDriver = myUid === trip.driverRef.id;
            const driver = drivers.find(d => d.path === trip.driverRef.path);
            // console.log('drivers',drivers)
            const dateStr = moment(new Date(trip.dateDeparture.seconds * 1000)).utcOffset(trip.timeZone).format('HH:mm');
            const dateStrFull = moment(new Date(trip.dateDeparture.seconds * 1000)).utcOffset(trip.timeZone).format('HH:mm, ddd DD MMM');
            const direction = myPlaces.findIndex(item => item.path === trip.departureRef.path);
            const placeDeparture = places.find(item => item.path === trip.departureRef.path);
            const placeArrival = places.find(item => item.path === trip.arrivalRef.path);
            const booking = myBookings.find(b => b.tripRef.id === trip.ref.id);
            const total = totalRatingWeighted(driver);
            const count = countReviewsAverageWeighted(driver);
            const rating = count > 0 ? (total / count).toPrecision(3) : '';
            const dayAgo = new Date();
            dayAgo.setDate(dayAgo.getDate() - 1);
            const isDayAgo = new Date(booking?.dateDeparture.seconds * 1000).getTime() < dayAgo.getTime();

            return (
                <View
                    style={{
                        backgroundColor: baseColor.yellow_10,
                        paddingTop: selectedDayTrips.indexOf(trip) === 0 ? 10 : 0,
                        paddingBottom: selectedDayTrips.indexOf(trip) === selectedDayTrips.length - 1 ? height / 2 : 0,
                    }}>
                    <TouchableOpacity
                        onLongPress={() => {
                            if (iAmDriver || cityUser?.someBoolean) {
                                navigation.navigate('BookingsScreen', {
                                    iAmAdmin: cityUser?.someBoolean,
                                    trip: trip,
                                    futureBookings: futureBookings.filter(b => b.tripRef.id === trip.ref.id),
                                    futureUsers: futureUsers,
                                    dateStrFull: dateStrFull,
                                    route: placeDeparture?.name + ' -> ' + placeArrival?.name,
                                });
                            }
                        }
                        }
                        onPress={() => {
                            if (iAmDriver) {
                                openTrip(trip, placeDeparture, placeArrival, dateStrFull, false);
                            } else {
                                if (cityUser) {
                                    const isArchive = new Date(trip?.dateDeparture.seconds * 1000).getTime() < Date.now();
                                    if (cityUser?.someBoolean || (!(isArchive && booking === undefined))) {
                                        navigation.navigate('MyBookingDetail', {
                                            cityUser: cityUser,
                                            trip: trip,
                                            booking: booking,
                                            driver: driver,
                                            dateStrFull: dateStrFull,
                                            route: placeDeparture?.name + ' -> ' + placeArrival?.name,
                                        });
                                    }
                                } else {
                                    navigation.navigate('EmailScreen', {});
                                }
                            }
                        }}>

                        <View style={[Styles.tripContainer, {
                            height: 70,
                            backgroundColor: trip.countPlaces === 0 ? baseColor.light_gray_0 : baseColor.white,
                            borderColor: trip.countPlaces === 0 ? baseColor.gray_10 : baseColor.white,
                        }]}>
                            <View style={Styles.leftContainer}>
                                <View>
                                    <Text style={Styles.time_text}>{dateStr}</Text>
                                    {cityUser?.trustedDriver !== true && <Text
                                        style={Styles.price_text}>
                                        {trip.price} {driver?.countryCode !== undefined && getParamByISO(driver.countryCode.toUpperCase(), 'symbol')}
                                    </Text>}
                                </View>
                                {((iAmDriver || cityUser?.someBoolean) && !booking) &&
                                    <View style={Styles.row}>
                                        {((trip.countBooked ?? 0) > 0 || (trip.countWaitingConfirmation ?? 0) > 0) && renderBookCount((trip.countBooked ?? 0), (trip.countWaitingConfirmation ?? 0), 12, 0, baseColor.green, baseColor.sky)}
                                        {trip.countVisitors > 0 &&
                                            <View style={Styles.row}>
                                                <MaterialCommunityIcons
                                                    name={'eye'}
                                                    color={baseColor.gray_hint}
                                                    size={16}
                                                />
                                                <Text style={Styles.text_hint}>{trip.countVisitors}</Text>
                                            </View>}
                                    </View>
                                }
                                {renderBookCount((booking?.status === STATUS.ACTIVE_BOOKING ? booking.countBooked : 0), (booking?.status !== STATUS.ACTIVE_BOOKING ? booking?.countBooked : 0), 12, 0, baseColor.green_dark, booking?.status === STATUS.WAITING_CONFIRMATION_BOOKING ? baseColor.blue : baseColor.light_gray)}

                            </View>
                            {!iAmDriver &&
                                <TouchableOpacity
                                    onPress={() => {
                                        navigation.navigate('UserDetailsScreen',
                                            {
                                                uid: cityUser?.someBoolean ? trip.driverRef.id : null,
                                                user: {
                                                    ...driver,
                                                    ref: trip.driverRef,
                                                },
                                            }
                                        );
                                    }}
                                    style={[Styles.avatarContainer]}>
                                    <Image
                                        style={[Styles.avatar]}
                                        source={{uri: driver?.photoUrl}}/>
                                    <View style={{position: 'absolute', left: 0, top: 0}}>
                                        <Laurel fill={toColor(driver?.moodColor)} size={65}/>
                                    </View>

                                    <View style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        position: 'absolute',
                                        paddingVertical: 2,
                                        paddingHorizontal: 4,
                                        backgroundColor: baseColor.light_gray_3,
                                        borderTopColor: baseColor.light_gray_1,
                                        borderLeftColor: baseColor.light_gray_1,
                                        borderRightColor: baseColor.light_gray_1,
                                        borderBottomColor: baseColor.light_gray_2,
                                        borderWidth: 1,
                                        borderRadius: 10,
                                        bottom: -5,
                                        right: -50,
                                    }}>
                                        <MaterialCommunityIcons
                                            size={14}
                                            color={baseColor.gray_middle}
                                            name={'star'}/>
                                        <Text
                                            style={{
                                                marginLeft: 4,
                                                color: baseColor.black,
                                                fontSize: 14,
                                            }}>{rating}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            }
                            {
                                iAmDriver &&
                                <TouchableOpacity
                                    onPress={() => openTrip(trip, placeDeparture, placeArrival, dateStrFull, true)}
                                    style={[Styles.avatarContainer, {marginLeft: 15}]}>
                                    <MaterialCommunityIcons
                                        name={'content-copy'}
                                        color={baseColor.gray_hint}
                                        size={30}
                                    />
                                </TouchableOpacity>
                            }
                            <View style={Styles.routeContainer}>
                                <Text
                                    style={[Styles.routeText, {
                                        fontWeight: 700,
                                        fontSize: 20,
                                        color: direction === -1 ? baseColor.gray_middle : direction === 1 ? baseColor.blue : baseColor.red_dark,
                                    }]}
                                    numberOfLines={1}>{placeDeparture?.name}</Text>
                                <Text style={Styles.routeText} numberOfLines={1}>{placeArrival?.name}</Text>
                            </View>
                            {(trip.cancelReason ?? -1) >= 0 &&
                                <View style={Styles.row}>
                                    <MaterialCommunityIcons
                                        size={40}
                                        color={baseColor.purple}
                                        name={trip.cancelReason === 0 ? 'car-wrench' : trip.cancelReason === 1 ? 'pill' : 'head-question'}/>
                                </View>}
                            {!booking && trip.countPlaces > 0 && (trip.countBooked ?? 0) === trip.countPlaces &&
                                <View
                                    style={[Styles.noPlaces, {backgroundColor: trip.countPlaces === 0 ? baseColor.light_gray_0 : baseColor.orange_50}]}>
                                    <Text style={Styles.placesHint}>{I18n.t('no_places')}</Text>
                                </View>
                            }
                            {!booking && trip.countPlaces > (trip.countBooked ?? 0) &&
                                <View style={Styles.places}>
                                    <Text style={Styles.placesHint}>{I18n.t('places')}</Text>
                                    <Text style={Styles.placesText}>{trip.countPlaces - (trip.countBooked ?? 0)}</Text>
                                </View>
                            }
                            {isDayAgo && booking && booking.status === STATUS.ACTIVE_BOOKING &&
                                <TouchableOpacity
                                    onPress={() => {
                                        navigation.navigate('ReviewDetailsScreen', {
                                            tripRef: trip.ref,
                                            user: {ref: trip.driverRef, ...driver},
                                        });
                                    }}
                                    style={{
                                        position: 'absolute',
                                        bottom: 0,
                                        right: 0,
                                        alignSelf: 'center',
                                        paddingHorizontal: 10,
                                        paddingVertical: 4,
                                        backgroundColor: baseColor.green_dark,
                                        borderBottomRightRadius: 10,
                                        borderTopLeftRadius: 10,
                                    }}>
                                    <Text
                                        style={[Styles.bookedText]}>{I18n.t('rate')}</Text>
                                </TouchableOpacity>}

                        </View>
                    </TouchableOpacity>
                </View>)
                ;

        }

        const futureBookingsLength = (futureBookings?.length ?? 1);

        function getCalendar() {
            const today = moment(new Date()).format(DATE_FORMATTERS.yearMonthDay);
            // console.log('getCalendar ==============================', new Date().toLocaleString())
            // console.log('passengerDayTrips', tripsToShow.map(t => t.countBooked+'===>'+new Date(t?.dateDeparture?.seconds * 1000).toLocaleString()))
            return <Calendar
                minDate={cityUser === undefined ? today : ''}
                style={{paddingBottom: 20}}
                onMonthChange={onMonthChange}
                firstDay={1}
                dayComponent={({date, state}) => {
                    const dayDriverTrips = tripsToShow
                        .filter(trip => {
                            const dateDeparture = new Date(trip?.dateDeparture?.seconds * 1000);
                            return dateDeparture.getDate() === date?.day && date?.month === monthFirstDay?.getMonth() + 1;
                        })
                        .filter(t => myBookingTrips.find(bt => bt.ref.id === t.ref.id) === undefined)
                        .filter(t => visibleOtherDriverBookings ? true : t.driverRef.id === myUid);
                    const dayDriverTripsActive = dayDriverTrips.filter(trip => trip.countPlaces > 0);
                    const dayMyBookings = myBookings.filter(booking => {
                        const dateDeparture = new Date(booking.dateDeparture.seconds * 1000);
                        return dateDeparture.getDate() === date?.day && date?.month === monthFirstDay?.getMonth() + 1;
                    });
                    // console.log('dayMyBookings',dayMyBookings.map(t => t.countBooked+','+new Date(t?.dateDeparture?.seconds * 1000).toLocaleString()))
                    const thisMonthDay = date?.year === monthFirstDay?.getFullYear() && date?.month === monthFirstDay?.getMonth() + 1;
                    let dayCountBooked = dayDriverTrips?.filter(t => myBookingTrips.find(bt => bt.ref.id === t.ref.id) === undefined).map(trip => trip.countBooked ?? 0).reduce((a, b) => a + b, 0);
                    let dayCountBookedAmount = dayDriverTrips?.filter(t => myBookingTrips.find(bt => bt.ref.id === t.ref.id) === undefined).map(trip => trip.price * (trip.countBooked ?? 0)).reduce((a, b) => a + b, 0);
                    let dayCountWaiting = dayDriverTrips?.map(trip => trip.countWaitingConfirmation).reduce((a, b) => a + (b ?? 0), 0);
                    const dayCountMyBooking = dayMyBookings?.filter(booking => booking.status === STATUS.ACTIVE_BOOKING).map(booking => booking.countBooked ?? 0).reduce((a, b) => a + b, 0);
                    const dayCountMyWaiting = dayMyBookings?.filter(booking => booking.status === STATUS.WAITING_CONFIRMATION_BOOKING).map(booking => booking.countBooked ?? 0).reduce((a, b) => a + b, 0);
                    const dayCountMyCancelBooking = dayMyBookings?.filter(booking => booking.status > STATUS.ACTIVE_BOOKING).map(booking => booking.countBooked ?? 0).reduce((a, b) => a + b, 0);
                    let driverDaySummary = null;
                    if (dayDriverTripsActive?.length > 0) {
                        driverDaySummary = dayDriverTripsActive?.length + ' / ' + dayCountBooked;
                    }

                    // console.log('dayCountBooked', date?.dateString, dayDriverTrips?.length, driverDaySummary, dayCountMyBooking);
                    // console.log('dayCountMyWaiting', date?.dateString,dayCountMyBooking,dayCountMyWaiting);
                    return (
                        <TouchableOpacity
                            onLongPress={() => {
                                if (appMode === APP_MODE.SCHEDULE) {
                                    const mySelectedDayTrips = selectedDayTrips
                                        .filter(trip => trip.driverRef.id === myUid);
                                    onDayPress(date);
                                    if (allTripsSwitch) {
                                        setAllTripsSwitch(false);
                                    } else {
                                        if (mySelectedDayTrips.length === 0) {
                                            setError(I18n.t('your_day_trips_empty'));
                                        } else {
                                            setShowCopyTripsSheet(!showCopyTripsSheet);
                                        }
                                    }
                                }
                            }}
                            onPress={() => onDayPress(date)}
                        >
                            <View style={{
                                height: 32,
                                alignItems: 'center',
                            }}>
                                <View style={{
                                    backgroundColor: date?.day === day && thisMonthDay ? baseColor.purple : baseColor.white,
                                    borderRadius: 16,
                                    width: 32,
                                    height: 32,

                                }}>
                                    <Text style={{
                                        marginTop: 5,
                                        fontSize: 16,
                                        textAlign: 'center',
                                        fontWeight: date?.day === day && thisMonthDay ? '600' : '400',
                                        color: date?.day === day && thisMonthDay ? baseColor.white : state === 'disabled' ? 'gray' : 'black',
                                    }}>{date?.day}
                                    </Text>
                                </View>
                                {dayCountBookedAmount > 0 && <Text style={{
                                    position: 'absolute',
                                    fontSize: 12,
                                    color: baseColor.sky,
                                    top: -6,
                                }}>{dayCountBookedAmount}</Text>}
                                <View style={{flexDirection: 'row'}}>
                                    {(dayCountMyBooking > 0 || dayCountMyWaiting > 0 || dayCountMyCancelBooking > 0) && renderBookCount(dayCountMyBooking, dayCountMyWaiting > 0 ? dayCountMyWaiting : dayCountMyCancelBooking, 8, -10, baseColor.green_dark, dayCountMyWaiting > 0 ? baseColor.blue : baseColor.light_gray)}
                                    {(driverDaySummary || dayCountWaiting > 0) && renderBookCount(driverDaySummary, dayCountWaiting, 8, -8, baseColor.green, baseColor.sky)}
                                </View>
                                {showCopyTripsSheet && copyDates.includes(date?.dateString) && <MaterialCommunityIcons
                                    style={{position: 'absolute', right: -8}}
                                    name={'content-copy'}
                                    color={baseColor.pink}
                                    size={16}
                                />}
                            </View>
                        </TouchableOpacity>
                    );
                }}
            />;
        }

        function renderAddTrip() {
            return <TouchableOpacity
                style={Styles.addTask}
                onPress={() => {
                    if (cityUser === undefined) {
                        navigation.navigate('EmailScreen', {});
                    } else {
                        navigation.navigate('TripDetailScreen', {countryCode: cityUser?.countryCode});
                    }
                }}>
                <MaterialCommunityIcons
                    name={'plus-circle-outline'}
                    color={baseColor.white}
                    size={40}
                />
            </TouchableOpacity>;
        }

        function renderDriverStat(driverBookings: number, driverTrips: any[], driversAmount) {
            return <>
                {driverBookings > 0 &&
                    <Text
                        style={Styles.price_text}>{driverTrips.length + ' / ' + driverBookings + ' / ' + driversAmount}</Text>}
            </>;
        }

        function renderHeader() {
            const driverTrips = tripsToShow.filter(t => t.countPlaces > 0 && myBookingTrips.find(bt => bt.ref.id === t.ref.id) === undefined);
            let driverBookings = 0;
            let driversAmount;
            if (driverTrips.length > 0) {
                driverBookings = driverTrips.map(trip => (trip.countBooked ?? 0)).reduce((a, b) => a + b);
                driversAmount = driverTrips.map(trip => (trip.countBooked ?? 0) * (trip.price ?? 0)).reduce((a, b) => a + b);
                // bookingsCount = tripsToShow.filter(t => myBookingTrips.find(bt => bt.ref.id === t.ref.id) === undefined)
            }
            let passengerBookings = 0;
            let passengerAmount = 0;
            const myBookingsActive = myBookings.filter(b => b.status === STATUS.ACTIVE_BOOKING);
            if (myBookingsActive.length > 0) {
                passengerBookings = myBookingsActive.map(b => (b.countBooked ?? 0)).reduce((a, b) => a + b);
                passengerAmount = myBookingsActive.map(b => (b.countBooked ?? 0) * (myBookingTrips.find(t => t.ref.id === b.tripRef.id)?.price ?? 0)).reduce((a, b) => a + b);
            }
            return (
                <View style={{paddingBottom: 4, backgroundColor: baseColor.yellow_10, height: 50}}>
                    <View style={{paddingLeft: 10, position: 'absolute', left: 0, top: 5}}>
                        {cityUser?.trustedDriver && renderDriverStat(driverBookings, driverTrips, driversAmount)}
                        {passengerBookings > 0 &&
                            <Text style={Styles.price_text}>{passengerBookings + ' / ' + passengerAmount}</Text>}
                    </View>
                    {appMode === APP_MODE.SCHEDULE &&
                        <View style={{}}>
                            {cityUser &&
                                <SegmentedControl
                                    style={{
                                        position: 'absolute',
                                        height: 35,
                                        top: 5,
                                        right: 60,
                                        width: '30%',
                                        marginRight: 20,
                                        backgroundColor: baseColor.light_gray_2,
                                    }}
                                    fontStyle={{fontSize: 12}}
                                    values={segments}
                                    selectedIndex={allTripsSwitch ? 1 : 0}
                                    onChange={event => {
                                        setAllTripsSwitch(event.nativeEvent.selectedSegmentIndex === 1);
                                    }}
                                />
                            }
                            <TouchableOpacity
                                style={{
                                    paddingHorizontal: 5, position: 'absolute', top: 5, right: 10,
                                }}
                                onPress={() => navigation.navigate('FilterRoutesScreen', {
                                    onGoBack: data => {
                                        setRoutes(data);
                                    },
                                })}>
                                <MaterialCommunityIcons
                                    size={32}
                                    color={baseColor.sky}
                                    name={'routes'}
                                />
                            </TouchableOpacity>
                        </View>}
                </View>
            );
        }

        return <BaseLayout
            isLoading={loading}
            confirm={confirm}
            confirmYes={'understood'}
            confirmNo={'dont_show_again'}
            callbackConfirm={(res) => {
                if (!res) {
                    AsyncStorage.setItem(STORAGE_KEYS.copyTripsManualShowed, true.toString());
                }
                setConfirm(undefined);
            }}
            error={error}
            callbackError={() => {
                setError(undefined);
            }}>
            <SafeAreaView>
                <ScrollView>
                    {renderHeader()}
                    {getCalendar()}
                    {loadedUsersCount < futureBookingsLength && <Progress.Bar
                        progress={futureBookingsLength === 0 ? 0 : loadedUsersCount / futureBookingsLength}
                        width={null}
                        height={2}
                        style={{marginTop: -4}}
                        unfilledColor={baseColor.light_gray_1}
                        color={baseColor.gray_middle}
                        borderColor={baseColor.white}
                    />}
                    {showCopyTripsSheet && (existTripsDaysWarning?.length > 0 || nextMonthCopyWarning) && <Text
                        style={{
                            color: baseColor.pink,
                            fontSize: 16,
                            marginTop: 10,
                            marginHorizontal: 10,
                        }}>{nextMonthCopyWarning ? I18n.t('next_month_copy_warning') : `${I18n.t('you_copy_in_dates_with_trips')}${existTripsDaysWarning}`}</Text>}
                    {appMode === APP_MODE.SCHEDULE && cityUser && routes.length === 0 &&
                        <Text style={Styles.empty_routes}>{I18n.t('empty_routes')}</Text>}
                    <FlatList
                        style={{opacity: showCopyTripsSheet ? 0 : 1}} data={selectedDayTrips}
                        renderItem={(item) => renderTrip(item.item)}/>
                    {showCopyTripsSheet && <CopyTripsSheet
                        date={selected}
                        setStartCopyDateCallback={setStartCopyDate}
                        setCountCallback={setCountCallback}
                        refCopyTrips={refCopyTrips}
                        enableConfirm={existTripsDaysWarning?.length === 0 && !nextMonthCopyWarning}
                        dismissCallback={() => {
                            setShowCopyTripsSheet(false);
                            setCountCallback(undefined);
                        }}
                        copyTripsCallback={copyTripsCallback}/>}
                </ScrollView>
            </SafeAreaView>
            {appMode === APP_MODE.SCHEDULE && renderAddTrip()}
        </BaseLayout>;
    }
;
export default CalendarScreen;
