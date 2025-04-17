import React, {useContext, useEffect, useState} from 'react';
import {FlatList, Image, Platform, StatusBar, Text, TouchableOpacity, View} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {baseColor} from '../../theme/appTheme';
import Styles from '../cabinet/styles';
import I18n from '../../locales/i18n';
import {Calendar} from 'react-native-calendars';
import moment from 'moment/moment';
import {CANCEL_REASON, DATE_FORMATTERS, FIELDS, STATUS, TABLES} from '../../Const';
import StylesGlobal from '../../theme/styles';
import {collection, getDocs, getFirestore, onSnapshot, query} from '@react-native-firebase/firestore';
import {FirestoreContext} from '../../context/firestoreProvider';
import {useIsFocused} from '@react-navigation/native';
import {getParamByISO} from 'iso-country-currency';
import {SafeAreaProvider, SafeAreaView} from 'react-native-safe-area-context';


export const MyCalendarScreen = ({navigation}) => {
    const firestoreContext = useContext(FirestoreContext);
    const [cityUser, setCityUser] = useState(firestoreContext.getCityUser());
    const [selected, setSelected] = useState('');
    const [day, setDay] = useState(new Date().getDate());
    const [monthFirstDay, setMonthFirstDay] = useState();
    const [coachSchedule, setCoachSchedule] = useState();
    const [memberBookings, setMemberBookings] = useState();
    const [coaches, setCoaches] = useState();
    const [locations, setLocations] = useState();
    const [memberSchedule, setMemberSchedule] = useState();
    const [markedDates, setMarkedDates] = useState();
    const isFocused = useIsFocused();
    const selectedDayTrips = (memberBookings ?? []).concat(coachSchedule ?? []).filter(item => {
        const date = new Date(item?.date?.seconds * 1000);
        return date.getDate() === day && date.getMonth() === monthFirstDay?.getMonth();
    });
    const cancelReasons = [I18n.t('reschedule'), I18n.t('ill'), I18n.t('no_reason')];

    //================================================
    // func
    //================================================

    const readMemberBookings = (lastDay) => {
        // console.log('readMemberSchedule', firestoreContext.getCityUser()?.ref.id, monthFirstDay.toString(), lastDay.toString());
        let qMemberBookings = query(collection(getFirestore(), TABLES.CLASS_BOOKINGS));
        qMemberBookings = qMemberBookings.where(FIELDS.USER_REF, '==', firestoreContext.getCityUser()?.ref);
        qMemberBookings = qMemberBookings.where(FIELDS.DATE, '>=', monthFirstDay);
        qMemberBookings = qMemberBookings.where(FIELDS.DATE, '<=', lastDay);
        qMemberBookings = qMemberBookings.orderBy(FIELDS.DATE);
        return onSnapshot(
            qMemberBookings,
            querySnapshot => {
                console.log('querySnapshot', querySnapshot.size);
                setMemberBookings(querySnapshot.docs.map(qds => {
                    return {ref: qds.ref, ...qds.data()};
                }));
            },
            error => {
                console.log('error', error.message);

            });

    };
    const readCoachSchedule = (lastDay) => {
        let qSchedule = query(collection(getFirestore(), TABLES.SCHEDULE));
        qSchedule = qSchedule.where(FIELDS.COACH_REF, '==', firestoreContext.getCityUser()?.ref);
        qSchedule = qSchedule.where(FIELDS.DATE, '>=', monthFirstDay);
        qSchedule = qSchedule.where(FIELDS.DATE, '<=', lastDay);
        qSchedule = qSchedule.orderBy(FIELDS.DATE);
        return onSnapshot(
            qSchedule,
            querySnapshot => {
                // console.log('querySnapshot', querySnapshot.size);
                setCoachSchedule(querySnapshot.docs.map(qds => {
                    return {ref: qds.ref, ...qds.data()};
                }));
            },
            error => {
                console.log('error', error.message);
            });
    };

    const onMonthChange = (value) => {
        setMemberBookings([]);
        setCoachSchedule([]);
        setMonthFirstDay(new Date(value.year, value.month - 1, 1));
    };

    const onDayPress = (value) => {
        setDay(value.day);
        setSelected(value.dateString);
    };

    async function readCoaches() {
        const allCoachRefs = memberBookings.map(item => item.coachRef);
        const coachIds = [...new Set(allCoachRefs.map(coachRef => coachRef.id))];
        const list = [];
        for (const id of coachIds) {
            const coachRef = allCoachRefs.find(ref => ref.id === id);
            const coach = (await coachRef.get()).data();
            list.push({ref: coachRef, ...coach});
        }
        setCoaches(list);
    }

    async function readLocations() {
        const allLocationsRefs = memberSchedule.concat(coachSchedule).map(item => item.locationRef);
        const locationIds = [...new Set(allLocationsRefs.map(locationRef => locationRef.id))];
        const list = [];
        for (const id of locationIds) {
            const locationRef = allLocationsRefs.find(ref => ref.id === id);
            const location = (await locationRef.get()).data();
            list.push({ref: locationRef, ...location});
        }
        setLocations(list);
    }

    async function readMemberSchedules() {
        const allSchedulesRefs = memberBookings.map(item => item.scheduleRef);
        const scheduleIds = [...new Set(allSchedulesRefs.map(scheduleRef => scheduleRef.id))];
        const list = [];
        for (const id of scheduleIds) {
            const scheduleRef = allSchedulesRefs.find(ref => ref.id === id);
            const schedule = (await scheduleRef.get()).data();
            list.push({ref: scheduleRef, ...schedule});
        }
        setMemberSchedule(list);
    }

    //================================================
    // hooks
    //================================================

    useEffect(() => {
        if (isFocused) {
            const user = firestoreContext.getCityUser();
            setCityUser(user);
        }
    }, [isFocused, firestoreContext.getCityUser()]);

    useEffect(() => {
        if (monthFirstDay) {
            const lastDay = new Date(monthFirstDay?.getFullYear(), monthFirstDay?.getMonth() + 1, 0, 23, 59, 59, 999);
            const subscribeMemberSchedule = readMemberBookings(lastDay);
            const subscribeCoachSchedule = readCoachSchedule(lastDay);
            return () => {
                subscribeMemberSchedule();
                subscribeCoachSchedule();
            };
        }

    }, [monthFirstDay]);

    useEffect(() => {
        if (memberBookings) {
            readCoaches();
            readMemberSchedules();
        }
    }, [memberBookings]);

    useEffect(() => {
        console.log('selected', selected)
        const dates = [];
        if (memberSchedule && coachSchedule) {
            memberSchedule.forEach(s => {
                const dateStr = moment(new Date(s.date.seconds * 1000)).format(DATE_FORMATTERS.yearMonthDay);
                if (!dates.includes(dateStr)) {
                    dates.push(dateStr);
                }
            });
            coachSchedule.forEach(s => {
                const dateStr = moment(new Date(s.date.seconds * 1000)).format(DATE_FORMATTERS.yearMonthDay);
                if (!dates.includes(dateStr)) {
                    dates.push(dateStr);
                }
            });
            const objectMarkedDates = {};
            dates.forEach(dateStr => {
                objectMarkedDates[dateStr] = {
                    marked: true,
                    dotColor: baseColor.green,
                    customStyles: {
                        text: {
                            color: baseColor.green,
                            fontWeight: 'bold',
                        },
                    },
                };
            });
            objectMarkedDates[selected] = {
                marked: dates.includes(selected),
                selected: true,
                disableTouchEvent: true,
            };
            setMarkedDates(objectMarkedDates);
        }
    }, [coachSchedule, memberSchedule, selected]);

    useEffect(() => {
        if (coachSchedule && memberSchedule) {
            readLocations();
        }
    }, [coachSchedule, memberSchedule])

    useEffect(() => {
        navigation.setOptions({
            headerStatusBarHeight: Platform.OS === 'android' ? StatusBar.currentHeight - 20 : undefined,
            headerShown: false,
            headerTitle: ' ',
        });
        const today = new Date();
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1, 0, 0, 0, 0);
        setMonthFirstDay(firstDay);
    }, [navigation]);

    //================================================
    // render
    //================================================
    const renderItemCoach = (item) => {
        const schedule = coachSchedule?.find(c => c.ref.id === item.ref.id);
        const dateStr = moment(new Date(schedule.date.seconds * 1000)).format('HH:mm');
        const location = locations?.find(c => c.ref.id === schedule.locationRef.id);
        return (
            <TouchableOpacity
                onPress={() => {
                    navigation.navigate('ScheduleDetailsScreen', {
                        schedule: schedule,
                        location: location,
                    });
                }}
                style={[StylesGlobal.whiteBordered, StylesGlobal.rowSpace, {marginTop: 10}]}>
                <TouchableOpacity
                    onPress={() => {
                        navigation.navigate('ScheduleDetailsScreen', {
                            schedule: schedule,
                            location: location,
                            copy: true,
                        });
                    }}
                    style={{paddingVertical: 5}}
                >
                    <MaterialCommunityIcons
                        name={'content-copy'}
                        size={30}
                        color={baseColor.gray}
                    />
                </TouchableOpacity>
                <View>
                    <Text
                        style={StylesGlobal.text}>{dateStr}
                    </Text>
                    {schedule?.countVisitors > 0 &&
                        <View style={[StylesGlobal.row, {marginTop: 5}]}>
                            <MaterialCommunityIcons
                                name={'eye'}
                                size={16}
                                color={baseColor.gray_middle}
                            />
                            <Text style={[StylesGlobal.textGray, {
                                fontSize: 14,
                                marginLeft: 4,
                            }]}>{schedule?.countVisitors}</Text>
                        </View>}
                </View>
                <Text style={StylesGlobal.textGray}>{location?.name}</Text>
                {(item?.cancelReason ?? CANCEL_REASON.UNDEFINED) >= 0 && (<View style={{
                    borderTopLeftRadius: 10,
                    paddingHorizontal: 10,
                    paddingVertical: 5,
                    borderBottomRightRadius: 10,
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    backgroundColor: baseColor.gray_middle,
                }}>
                    <Text
                        numberOfLines={1}
                        style={{color: baseColor.white}}>{cancelReasons[item.cancelReason]}</Text>

                </View>)}
                {item?.countBooked > 0 && (<View style={{
                    borderTopLeftRadius: 10,
                    paddingHorizontal: 10,
                    paddingVertical: 5,
                    borderBottomRightRadius: 10,
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    backgroundColor: baseColor.green,
                }}>
                    <Text
                        numberOfLines={1}
                        style={{color: baseColor.white}}>{I18n.t('booking')} {item?.countBooked}</Text>

                </View>)}

            </TouchableOpacity>
        );

    };

    const renderItemMember = (item) => {
        const coach = coaches?.find(c => c.ref.id === item.coachRef.id);
        const location = locations?.find(c => c.ref.id === item.locationRef.id);
        const schedule = memberSchedule?.find(c => c.ref.id === item.scheduleRef?.id);
        const dateStr = moment(new Date(schedule?.date.seconds * 1000)).format('HH:mm');
        const currency = schedule?.currencyCountryCode !== undefined && getParamByISO(schedule.currencyCountryCode.toUpperCase(), 'symbol');
        // console.log('currency', currency, schedule, schedule?.currencyCountryCode)
        return (
            <TouchableOpacity
                onPress={() => {
                    navigation.navigate('MyBookingScreen', {
                        schedule: schedule,
                        coach: coaches.find(c => c.ref.id === item.coachRef.id),
                        location: location,
                    });
                }}
                style={[StylesGlobal.whiteBordered, {marginTop: 10}]}>
                <View style={[StylesGlobal.rowSpace]}>
                    <View style={[StylesGlobal.row]}>
                        <View>
                            <Image
                                style={[StylesGlobal.avatar]}
                                source={{uri: coach?.photoUrl, cache: 'force-cache'}}/>
                        </View>
                        <View style={{marginLeft: 10}}>
                            <Text style={[StylesGlobal.textGray]}>{location?.name}</Text>
                            <Text style={[StylesGlobal.textGray]}>{coach?.name}</Text>
                            <Text
                                style={[StylesGlobal.text, {marginTop: 5}]}>{dateStr} / {schedule?.duration} {I18n.t('minutes')}
                            </Text>
                        </View>
                    </View>
                    <Text style={StylesGlobal.textSecondary}>{schedule?.price} {currency}</Text>
                </View>
                <View style={{
                    borderTopLeftRadius: 10,
                    paddingHorizontal: 10,
                    paddingVertical: 5,
                    borderBottomRightRadius: 10,
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    backgroundColor: item?.status === STATUS.ACTIVE_BOOKING ? baseColor.green_dark : item?.status === STATUS.WAITING_CONFIRMATION_BOOKING ? baseColor.sky : baseColor.gray_middle,
                }}>
                    <Text
                        numberOfLines={1}
                        style={{color: baseColor.white}}>{I18n.t(item?.status === STATUS.ACTIVE_BOOKING ? 'booking' : item?.status === STATUS.WAITING_CONFIRMATION_BOOKING ? 'waiting' : 'cancelled_by_member')}</Text>

                </View>

            </TouchableOpacity>
        );
    };

    const renderItem = ({item, index}) => {
        const iAmCoach = item.coachRef.id === firestoreContext.getCityUser()?.ref.id;
        if (iAmCoach) {
            return renderItemCoach(item);
        } else {
            return renderItemMember(item);
        }
    };

    function renderAddTrip() {
        return <TouchableOpacity
            style={StylesGlobal.addTask}
            onPress={() => {
                if (cityUser === undefined) {
                    navigation.navigate('EmailScreen', {});
                } else {
                    navigation.navigate('ScheduleDetailsScreen', {countryCode: cityUser?.countryCode});
                }
            }}>
            <MaterialCommunityIcons
                name={'plus-circle-outline'}
                color={baseColor.white}
                size={40}
            />
        </TouchableOpacity>;
    }

    const renderHeader = () => {
        const coachActual = coachSchedule?.filter(s => s.countPlaces > 0);
        const coachBooked = coachActual?.map(s => (s.countBooked ?? 0)).reduce((a, b) => a + b, 0);
        const coachAmount = coachActual?.map(s => (s.countBooked ?? 0) * (s.price ?? 0)).reduce((a, b) => a + b, 0);
        return (
            <View style={{marginLeft: 10}}>
                <Text
                    style={StylesGlobal.textHint}>{I18n.t('schedules_count')} / {I18n.t('schedule_bookings')} / {I18n.t('schedule_amount')} </Text>
                <Text>{coachActual?.length} / {coachBooked} / {coachAmount} </Text>

            </View>
        );
    };
    return (
        <SafeAreaProvider>
            <SafeAreaView style={{justifyContent: 'space-between', flex: 1}}>
                {renderHeader()}
                <Calendar
                    monthFormat={'MMM yyyy'}
                    firstDay={1}
                    onMonthChange={onMonthChange}
                    onDayPress={day => {
                        onDayPress(day);
                    }}
                    markingType={'custom'}
                    markedDates={markedDates}
                    // markedDates={{
                    //     [selected]: {selected: true, disableTouchEvent: true, selectedDotColor: 'orange'},
                    // }}
                />
                <FlatList
                    style={{marginHorizontal: 10, marginTop: 20}}
                    data={selectedDayTrips}
                    renderItem={renderItem}/>
                {renderAddTrip()}
            </SafeAreaView>
        </SafeAreaProvider>
    );

};
