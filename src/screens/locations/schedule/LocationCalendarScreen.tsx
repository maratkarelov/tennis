import {FlatList, Image, Platform, StatusBar, Text, TouchableOpacity, View} from 'react-native';
import {StackScreenProps} from '@react-navigation/stack/lib/typescript/module/src';
import {Calendar} from 'react-native-calendars';
import {useContext, useEffect, useRef, useState} from 'react';
import {collection, getDocs, getFirestore, query} from '@react-native-firebase/firestore';
import {DATE_FORMATTERS, FIELDS, TABLES} from '../../../Const';
import StylesGlobal from '../../../theme/styles';
import moment from 'moment';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {baseColor} from '../../../theme/appTheme';
import {LocationInfoSheet} from './LocationInfoSheet';
import I18n from "../../../locales/i18n";
import {FirestoreContext} from "../../../context/firestoreProvider";
import {SafeAreaProvider, SafeAreaView} from "react-native-safe-area-context";

interface Props extends StackScreenProps<any, any> {
}

export const LocationCalendarScreen = ({route, navigation}: Props) => {
    const firestoreContext = useContext(FirestoreContext);
    const [selected, setSelected] = useState('');
    const [markedDates, setMarkedDates] = useState();
    const [day, setDay] = useState(new Date().getDate());
    const [monthFirstDay, setMonthFirstDay] = useState();
    const [items, setItems] = useState();
    const [coaches, setCoaches] = useState();
    const [showInfoSheet, setShowInfoSheet] = useState(false);
    const refInfoSheet = useRef(undefined);
    const selectedDayTrips = items?.filter(item => {
        const date = new Date(item?.date?.seconds * 1000);
        return date.getDate() === day && date.getMonth() === monthFirstDay?.getMonth();
    });

    //================================================
    // func
    //================================================

    const readLocationSchedule = () => {
        let q = query(collection(getFirestore(), TABLES.SCHEDULE));
        q = q.where(FIELDS.LOCATION_REF, '==', route.params?.location.ref);
        q = q.orderBy(FIELDS.DATE);
        getDocs(q)
            .then(querySnapshot => {
                setItems(querySnapshot.docs.map(qds => {
                    return {ref: qds.ref, ...qds.data()};
                }));
            })
            .catch(reason => {
                console.log('error',reason.message);
            });
    };

    const onMonthChange = (value) => {
        setItems([]);
        setMonthFirstDay(new Date(value.year, value.month - 1, 1));
    };

    const onDayPress = (value) => {
        setDay(value.day);
        setSelected(value.dateString);

    };

    async function readCoaches() {
        const allCoachRefs = items.map(item => item.coachRef);
        const coachIds = [...new Set(allCoachRefs.map(coachRef => coachRef.id))];
        const list = [];
        for (const id of coachIds) {
            const coachRef = allCoachRefs.find(ref => ref.id === id);
            const coach = (await coachRef.get()).data();
            list.push({ref: coachRef, ...coach});
        }
        setCoaches(list);
    }

    //================================================
    // hooks
    //================================================

    useEffect(() => {
        if (items) {
            readCoaches();
        }
    }, [items]);

    useEffect(() => {
        if (showInfoSheet) {
            refInfoSheet.current?.open();
        } else {
            refInfoSheet.current?.close();
        }
    }, [showInfoSheet]);


    useEffect(() => {
        navigation.setOptions({
            headerShown: true,
            headerTopInsetEnabled: false,
            headerStatusBarHeight: Platform.OS === 'android' ? StatusBar.currentHeight - 20 : undefined,
            headerBackTitle: ' ',
            title: route.params?.location.name,
            headerRight: () => headerRight(),
        });
        const today = new Date();
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1, 0, 0, 0, 0);
        setMonthFirstDay(firstDay);
        readLocationSchedule();
    }, [navigation]);

    useEffect(() => {
        const dates = [];
        if (items) {
            items.forEach(s => {
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
    }, [items, selected]);


    //================================================
    // render
    //================================================

    const headerRight = () => {
        return <TouchableOpacity
            onPress={() => {
                setShowInfoSheet(!showInfoSheet);
            }}
            style={{marginRight: 10}}
        >
            <MaterialCommunityIcons
                name={'information-outline'}
                size={32}
                color={baseColor.secondary}
            />
        </TouchableOpacity>;
    };

    const renderItem = ({item, index}) => {
        const dateStr = moment(new Date(item.date.seconds * 1000)).format('HH:mm');
        const coach = coaches?.find(c => c.ref.id === item.coachRef.id);
        return (
            <TouchableOpacity
                onPress={() => {
                    if (firestoreContext.getCityUser() === undefined) {
                        navigation.navigate('EmailScreen', {});
                    } else {
                        if (coach.ref.id === firestoreContext.getCityUser()?.ref.id) {
                            navigation.navigate('ScheduleDetailsScreen', {
                                schedule: item,
                                location: route.params?.location
                            });

                        } else {
                            navigation.navigate('MyBookingScreen', {
                                schedule: item,
                                coach: coach,
                                location: route.params?.location
                            });
                        }
                    }
                }}
                style={[StylesGlobal.rowSpace, StylesGlobal.whiteBordered, {marginTop: 10}]}>
                <View>
                    <Text style={StylesGlobal.text}>{dateStr} / {item.duration} {I18n.t('minutes')}</Text>
                    <Text style={StylesGlobal.textSecondary}>{item.price}</Text>
                    <Text>{coach?.name}</Text>
                </View>
                <Image
                    style={[StylesGlobal.avatar]}
                    source={{uri: coach?.photoUrl, cache: 'force-cache'}}/>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaProvider>
            <SafeAreaView style={{justifyContent: 'space-between', flex: 1}}>
            <Calendar
                monthFormat={'MMM yyyy'}
                firstDay={1}
                minDate={moment(new Date()).format(DATE_FORMATTERS.yearMonthDay)}
                onMonthChange={onMonthChange}
                onDayPress={day => {
                    onDayPress(day);
                }}
                markingType={'custom'}
                markedDates={markedDates}
            />
            <FlatList
                style={{marginHorizontal: 10, marginTop: 20}}
                data={selectedDayTrips}
                renderItem={renderItem}/>
            {showInfoSheet && <LocationInfoSheet
                location={route.params?.location}
                ref={refInfoSheet}
                dismissCallback={() => {
                    setShowInfoSheet(false);
                }}
            />}
            </SafeAreaView>
        </SafeAreaProvider>
    );
};
