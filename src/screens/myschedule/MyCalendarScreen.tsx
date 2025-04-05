import React, {useContext, useEffect, useState} from 'react';
import {FlatList, Image, Platform, SafeAreaView, StatusBar, Text, TouchableOpacity, View} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {baseColor} from '../../theme/appTheme';
import Styles from '../cabinet/styles';
import I18n from '../../locales/i18n';
import {Calendar} from 'react-native-calendars';
import moment from 'moment/moment';
import {DATE_FORMATTERS, FIELDS, STATUS, TABLES} from '../../Const';
import StylesGlobal from '../../theme/styles';
import {collection, getDocs, getFirestore, query} from '@react-native-firebase/firestore';
import {FirestoreContext} from '../../context/firestoreProvider';
import {useIsFocused} from '@react-navigation/native';

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
    const isFocused = useIsFocused();
    const selectedDayTrips = (memberBookings ?? []).concat(coachSchedule ?? []).filter(item => {
        const date = new Date(item?.date?.seconds * 1000);
        return date.getDate() === day && date.getMonth() === monthFirstDay?.getMonth();
    });

    //================================================
    // func
    //================================================

    const readMemberSchedule = () => {
        const lastDay = new Date(monthFirstDay?.getFullYear(), monthFirstDay?.getMonth() + 1, 0, 23, 59, 59, 999);
        // console.log('readMemberSchedule', firestoreContext.getCityUser()?.ref.id, monthFirstDay.toString(), lastDay.toString());
        let qMemberBookings = query(collection(getFirestore(), TABLES.CLASS_BOOKINGS));
        qMemberBookings = qMemberBookings.where(FIELDS.USER_REF, '==', firestoreContext.getCityUser()?.ref);
        qMemberBookings = qMemberBookings.where(FIELDS.DATE, '>=', monthFirstDay);
        qMemberBookings = qMemberBookings.where(FIELDS.DATE, '<=', lastDay);
        getDocs(qMemberBookings)
            .then(querySnapshot => {
                // console.log('querySnapshot', querySnapshot.size);
                setMemberBookings(querySnapshot.docs.map(qds => {
                    return {ref: qds.ref, ...qds.data()};
                }));
            })
            .catch(reason => {
                console.log(reason);
            });
        let qSchedule = query(collection(getFirestore(), TABLES.SCHEDULE));
        qSchedule = qSchedule.where(FIELDS.COACH_REF, '==', firestoreContext.getCityUser()?.ref);
        qSchedule = qSchedule.where(FIELDS.DATE, '>=', monthFirstDay);
        qSchedule = qSchedule.where(FIELDS.DATE, '<=', lastDay);
        getDocs(qSchedule)
            .then(querySnapshot => {
                setCoachSchedule(querySnapshot.docs.map(qds => {
                    return {ref: qds.ref, ...qds.data()};
                }));
            })
            .catch(reason => {
                console.log(reason);
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
        const allLocationsRefs = memberBookings.map(item => item.locationRef);
        const locationIds = [...new Set(allLocationsRefs.map(locationRef => locationRef.id))];
        const list = [];
        for (const id of locationIds) {
            const locationRef = allLocationsRefs.find(ref => ref.id === id);
            const location = (await locationRef.get()).data();
            list.push({ref: locationRef, ...location});
        }
        setLocations(list);
    }

    async function readSchedules() {
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
            readMemberSchedule();
        }
    }, [monthFirstDay]);

    useEffect(() => {
        if (memberBookings) {
            readCoaches();
            readLocations();
            readSchedules();
        }
    }, [memberBookings]);

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
        console.log('item', item)
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
                style={[StylesGlobal.whiteBordered, {marginTop: 10}]}>
                <Text
                    style={StylesGlobal.text}>{dateStr}
                </Text>
                <Text style={StylesGlobal.text}>{location?.name}</Text>

            </TouchableOpacity>
        )

    }

    const renderItemMember = (item) => {
        const dateStr = moment(new Date(item.date.seconds * 1000)).format('HH:mm');
        const coach = coaches?.find(c => c.ref.id === item.coachRef.id);
        const location = locations?.find(c => c.ref.id === item.locationRef.id);
        const schedule = memberSchedule?.find(c => c.ref.id === item.scheduleRef.id);
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
                            <Text  style={[StylesGlobal.textGray]}>{location?.name}</Text>
                            <Text  style={[StylesGlobal.textGray]}>{coach?.name}</Text>
                            <Text
                                style={[StylesGlobal.text, {marginTop: 5}]}>{dateStr} / {schedule?.duration} {I18n.t('minutes')}
                            </Text>
                        </View>
                    </View>
                    <Text style={StylesGlobal.textSecondary}>{schedule?.price}</Text>
                </View>
                <View style={{
                    borderTopLeftRadius: 10,
                    paddingHorizontal: 10,
                    paddingVertical: 5,
                    borderBottomRightRadius: 10,
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    backgroundColor: item?.status === STATUS.ACTIVE_BOOKING ? baseColor.green : item?.status === STATUS.WAITING_CONFIRMATION_BOOKING ? baseColor.sky : baseColor.gray_middle,
                }}>
                    <Text
                        numberOfLines={1}
                        style={{color: baseColor.white}}>{I18n.t(item?.status === STATUS.ACTIVE_BOOKING ? 'booking' : item?.status === STATUS.WAITING_CONFIRMATION_BOOKING ? 'waiting' : 'cancelled_by_member')}</Text>

                </View>

            </TouchableOpacity>
        );
    }

    const renderItem = ({item, index}) => {
        const iAmCoach = item.coachRef.id === firestoreContext.getCityUser()?.ref.id
        if (iAmCoach) {
            return renderItemCoach(item)
        } else {
            return renderItemMember(item)
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

    return (
        <SafeAreaView style={{flex: 1, paddingTop: Platform.OS === 'android' ? 50 : 0}}>
            <Calendar
                monthFormat={'MMM yyyy'}
                firstDay={1}
                minDate={moment(new Date()).format(DATE_FORMATTERS.yearMonthDay)}
                onMonthChange={onMonthChange}
                onDayPress={day => {
                    onDayPress(day);
                }}
                markedDates={{
                    [selected]: {selected: true, disableTouchEvent: true, selectedDotColor: 'orange'},
                }}
            />
            <FlatList
                style={{marginHorizontal: 10, marginTop: 20}}
                data={selectedDayTrips}
                renderItem={renderItem}/>
            {renderAddTrip()}
        </SafeAreaView>
    );

};
