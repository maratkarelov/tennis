import {StackScreenProps} from '@react-navigation/stack';
import {BaseLayout} from '../../../components/base/BaseLayout';
import React, {useContext, useEffect, useRef, useState} from 'react';
import DatePicker from 'react-native-date-picker';
import {
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import moment from 'moment';
import Styles from './styles';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {baseColor} from '../../../theme/appTheme';
import 'moment/locale/ru';
import I18n from '../../../locales/i18n';
import SelectDropdown from 'react-native-select-dropdown';
import firestore from '@react-native-firebase/firestore';
import {FIELDS, PATH_PATH_DIVIDER, STATUS, TABLES} from '../../../Const';
import auth from '@react-native-firebase/auth';
import ActionButton from '../../../components/ActionButton';
import 'dayjs/locale/en';
import 'dayjs/locale/ru';
import RNDateTimePicker from '@react-native-community/datetimepicker';
import {FirestoreContext} from "../../../context/firestoreProvider";

interface Props extends StackScreenProps<any, any> {
}

moment.locale('ru');

export const TripDetailScreen = ({route, navigation}: Props) => {
    const firestoreContext = useContext(FirestoreContext);
    const [confirm, setConfirm] = useState();
    const [isLoading, setLoading] = useState(false);
    const [trip] = useState(route.params?.trip);
    const offset = route.params?.copy ? 3600 * 24 : 0;
    const [modeDateDeparture, setModeDateDeparture] = useState();
    const [modeDateArrival, setModeDateArrival] = useState();
    const [dateDeparture, setDateDeparture] = useState<Date>(trip?.dateDeparture ? new Date((trip?.dateDeparture.seconds + offset) * 1000) : new Date());
    const [openDateDeparture, setOpenDateDeparture] = useState(false);
    const [dateArrival, setDateArrival] = useState<Date>(trip?.dateArrival ? new Date((trip?.dateArrival.seconds + offset) * 1000) : new Date());
    const [dateTimeArrivalStr, setDateTimeArrivalStr] = useState();
    const [openDateArrival, setOpenDateArrival] = useState(false);
    const [autoConfirmation, setAutoConfirmation] = useState(trip?.autoConfirmation ?? true);
    const [placeDeparture, setPlaceDeparture] = useState(route.params?.placeDeparture);
    const [placeArrival, setPlaceArrival] = useState(route.params?.placeArrival);
    const [price, setPrice] = useState(trip?.price ?? 400);
    const [countPlaces, setCountPlaces] = useState(trip?.countPlaces ?? 6);
    const [vehicle, setVehicle] = useState();
    const [vehicles, setVehicles] = useState([]);
    const [cancelReason, setCancelReason] = useState(I18n.t('crash'));
    const [cancelReasons] = useState([I18n.t('crash'), I18n.t('ill'), I18n.t('no_reason')]);
    const [note, setNote] = useState(trip?.note ?? '');
    const enableEditing = () => {
        return dateDeparture?.getTime() > Date.now() && dateArrival?.getTime() > dateDeparture?.getTime() && placeDeparture !== undefined && placeArrival !== undefined && vehicle !== undefined && countPlaces > 0 && price > 0;
    };
    //================================================
    // hooks
    //================================================
    useEffect(() => {
        navigation.setOptions({
            headerBackTitle: ' ',
            headerTitleStyle: {marginLeft: Platform.OS === 'ios' ? -150 : 0, fontSize: 12},
            headerTitle: I18n.t(route.params?.copy ? 'copy_trip' : trip ? dateDeparture.getTime() > Date.now() ? 'editing' : 'archive' : 'new_trip'),
            headerRight: () => !route.params?.copy && trip && trip?.countPlaces > 0 && dateDeparture?.getTime() > Date.now() && headerRight(),
        });

    }, [navigation, dateDeparture, route.params?.copy, cancelReason, enableEditing()]);

    useEffect(() => {
        firestore().collection(TABLES.VEHICLES).where(FIELDS.DRIVER_REF, '==', firestoreContext.getCityUser()?.ref)
            .get().then(qs => {
            setVehicles(qs.docs.map(qds => {
                    const {regNumber, model} = qds.data();
                    return {path: qds.ref.path, regNumber, model};
                }
            ));

        });
    }, []);
    useEffect(() => {
        if (trip) {
            trip.vehicleRef.get().then(s => {
                const {regNumber, model} = s.data();
                setVehicle({path: s.ref.path, regNumber, model});
            });
        }

    }, [route.params?.trip]);
    // console.log('vehicles', vehicles)
    useEffect(() => {
        setDateTimeArrivalStr(moment(dateArrival).format('HH:mm') + '\n' + moment(dateArrival).format('DD MMM dd'));
    }, [dateArrival]);


    //=================================================================================
    // FUNCTIONS
    //=================================================================================


    const openDeparture = () => {
        navigation.navigate('SearchPlaceScreen', {
            onGoBack: data => {
                setPlaceDeparture(data);
            },
        });
    };
    const openArrival = () => {
        navigation.navigate('SearchPlaceScreen', {
            onGoBack: data => {
                setPlaceArrival(data);
            },
        });
    };


    const openBookings = () => {
        if (trip) {
            navigation.navigate('BookingsScreen', {
                iAmAdmin: route.params?.iAmAdmin,
                trip: route.params?.trip,
                dateStrFull: route.params?.dateStrFull,
                route: route.params?.route,
                futureBookings: route.params?.futureBookings,
                futureUsers: route.params?.futureUsers,

            });
        }
    };
    const saveTrip = () => {
        setLoading(true);
        const routePath = [placeDeparture.path + PATH_PATH_DIVIDER, placeDeparture.path + PATH_PATH_DIVIDER + placeArrival.path, PATH_PATH_DIVIDER + placeArrival.path];
        const data = {
            driverRef: firestoreContext.getCityUser()?.ref,
            autoConfirmation: autoConfirmation,
            departureRef: firestore().doc(placeDeparture.path),
            arrivalRef: firestore().doc(placeArrival.path),
            routePath: routePath,
            dateDeparture: dateDeparture,
            dateArrival: dateArrival,
            currencyCountryCode: route.params?.countryCode,
            timeZone: moment(dateDeparture).format('Z').replace(':', ''),
            countPlaces: parseInt(countPlaces, 10),
            price: parseInt(price, 10),
            note: note,
            cancelReason: null,
            vehicleRef: firestore().doc(vehicle.path),
        };
        // console.log(data)
        if (trip && !route.params?.copy) {
            route.params?.trip.ref.update(data)
                .then(ref => navigation.goBack())
                .finally(() => setLoading(false));
        } else {
            firestore().collection(TABLES.TRIPS).add(data)
                .then(ref => navigation.goBack())
                .finally(() => setLoading(false));
        }
    };

    const cancelTrip = () => {
        const dataTrip = {
            cancelReason: cancelReasons.indexOf(cancelReason),
            countPlaces: 0,
            countBooked: 0,
            countWaitingConfirmation: 0,
        };
        const dataBooking = {
            sendNotificationOnWrite: true,
            status: STATUS.CANCELED_BY_DRIVER,
            dateModification: new Date(),

        };
        setLoading(true)
        route.params?.trip.ref.update(dataTrip)
            .then(() => {
                firestore().collection(TABLES.BOOKINGS)
                    .where(FIELDS.TRIP_REF, '==', route.params?.trip.ref)
                    .where(FIELDS.STATUS, '==', STATUS.ACTIVE_BOOKING)
                    .get().then(qs => {
                    qs.docs.forEach(qds => {
                        // console.log('qds', qds.ref.id);
                        qds.ref.update(dataBooking);
                    });
                });
            })
            .finally(() => {
                navigation.goBack();
            });


    };

    const timeDepartureStr = moment(dateDeparture).format('HH:mm');
    const dateDepartureStr = moment(dateDeparture).format('DD MMM dd');

    //================================================
    // render UI
    //================================================

    const headerRight = () => {
        return (
            <View style={{flexDirection: 'row'}}>

                <SelectDropdown
                    data={cancelReasons}
                    defaultValue={I18n.t('crash')}
                    onSelect={(selectedItem, index) => {
                        setCancelReason(selectedItem);
                    }}
                    renderButton={(selectedItem, isOpened) => {
                        return (renderCancelReason(selectedItem, isOpened));
                    }}
                    renderItem={(item, index, isSelected) => {
                        return (renderCancelReasonItem(item, isSelected));
                    }}
                    showsVerticalScrollIndicator={false}
                    dropdownStyle={Styles.dropdownMenuStyle}
                />

                <TouchableOpacity
                    style={{padding: 4, marginRight: 10}}
                    onPress={() => setConfirm(I18n.t('cancel_trip_question') + '\n' + I18n.t('reason') + ': ' + cancelReason)}>
                    <MaterialCommunityIcons
                        name={'stop-circle'}
                        color={baseColor.red}
                        size={30}
                    />
                </TouchableOpacity>
            </View>);

    };

    const dateDeparturePicker = () => {
        if (Platform.OS === 'android') {
            return <RNDateTimePicker
                mode={modeDateDeparture}
                value={dateDeparture}
                onChange={(event, date) => {
                    if (modeDateDeparture === 'date') {
                        setDateDeparture(date);
                        const newDateArrival = dateArrival;
                        newDateArrival.setFullYear(date?.getFullYear());
                        newDateArrival.setMonth(date?.getMonth());
                        newDateArrival.setDate(date?.getDate());
                        setDateArrival(newDateArrival);
                        setDateTimeArrivalStr(moment(newDateArrival).format('HH:mm') + '\n' + moment(newDateArrival).format('DD MMM dd'));
                        setModeDateDeparture('time');
                    } else if (modeDateDeparture === 'time') {
                        setDateDeparture(date);
                        setModeDateDeparture(undefined);
                    } else {
                        setModeDateDeparture('date');
                    }
                }
                }/>;
        } else {
            return <DatePicker
                modal
                minuteInterval={5}
                open={openDateDeparture}
                date={dateDeparture}
                onConfirm={(date) => {
                    setDateDeparture(date);
                    const newDateArrival = dateArrival;
                    newDateArrival.setFullYear(date.getFullYear());
                    newDateArrival.setMonth(date.getMonth());
                    newDateArrival.setDate(date.getDate());
                    setDateArrival(newDateArrival);
                    setDateTimeArrivalStr(moment(newDateArrival).format('HH:mm') + '\n' + moment(newDateArrival).format('DD MMM dd'));
                    setOpenDateDeparture(false);
                }}
                onCancel={() => {
                    setOpenDateDeparture(false);
                }}
            />;
        }
    };

    const dateArrivalPicker = () => {
        if (Platform.OS === 'android') {
            return <RNDateTimePicker
                mode={modeDateArrival}
                minimumDate={dateDeparture}
                value={dateArrival}
                onChange={(event, date) => {
                    if (modeDateArrival === 'date') {
                        setDateArrival(date);
                        setModeDateArrival('time');
                    } else if (modeDateArrival === 'time') {
                        setDateArrival(date);
                        setModeDateArrival(undefined);
                    } else {
                        setModeDateArrival('date');
                    }
                }
                }/>;
        } else {
            return <DatePicker
                modal
                minuteInterval={5}
                minimumDate={dateDeparture}
                open={openDateArrival}
                date={dateArrival}
                onConfirm={(date) => {
                    setOpenDateArrival(false);
                    setDateArrival(date);
                }}
                onCancel={() => {
                    setOpenDateArrival(false);
                }}
            />;
        }
    };

    const renderVehicle = (selectedItem) => {
        return <View style={[Styles.input, {paddingVertical: 8}]}>
            <Text style={[Styles.inputText, {
                color: selectedItem ? baseColor.blue : baseColor.gray_hint,
                fontWeight: selectedItem ? '500' : '300',
            }]}>
                {(selectedItem && selectedItem?.regNumber.substring(3).replace('_', '')) || '------------'}
            </Text>
        </View>

            ;
    };
    const renderVehicleItem = (item, isSelected) => {
        return <View style={{...Styles.dropdownItemStyle, ...(isSelected && {backgroundColor: '#D2D9DF'})}}>
            <Text style={Styles.dropdownItemTxtStyle}>{item?.regNumber.substring(3).replace('_', '')}</Text>
        </View>;
    };

    const renderCancelReason = (selectedItem) => {
        return <View style={[Styles.input, {paddingVertical: 8}]}>
            <Text style={[Styles.inputText, {
                color: selectedItem ? baseColor.blue : baseColor.gray_hint,
                fontWeight: selectedItem ? '500' : '300',
            }]}>
                {selectedItem}
            </Text>
        </View>

            ;
    };
    const renderCancelReasonItem = (item, isSelected) => {
        return <View style={{...Styles.dropdownItemStyle, ...(isSelected && {backgroundColor: '#D2D9DF'})}}>
            <Text style={Styles.dropdownItemTxtStyle}>{item}</Text>
        </View>;
    };

    return <BaseLayout
        confirm={confirm}
        callbackConfirm={(res) => {
            setConfirm(undefined);
            if (res) {
                cancelTrip();
            }
        }
        }
        isLoading={isLoading}
    >
        <KeyboardAvoidingView
            behavior="padding"
            enabled>
            <ScrollView style={Styles.tripContainer} keyboardShouldPersistTaps="never">
                <View style={Styles.row}>
                    <View style={{width: '45%'}}>
                        <TouchableOpacity style={Styles.input} onPress={() => {
                            if (Platform.OS === 'android') {
                                setModeDateDeparture('date');
                            } else {
                                setOpenDateDeparture(true);
                            }
                        }}>
                            <Text style={Styles.inputText}>{timeDepartureStr}{'\n'}{dateDepartureStr}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[Styles.input, {marginTop: 10}]} onPress={() => openDeparture()}>
                            <Text
                                style={[Styles.inputText, {
                                    color: placeDeparture ? baseColor.blue : baseColor.gray_hint,
                                    fontWeight: placeDeparture ? '500' : '300',
                                }]}>{placeDeparture?.name ?? I18n.t('from')}</Text>
                        </TouchableOpacity>
                        {(modeDateDeparture || Platform.OS === 'ios') && dateDeparturePicker()}
                    </View>
                    <TouchableOpacity
                        onPress={() => {
                            setPlaceDeparture(placeArrival);
                            setPlaceArrival(placeDeparture);
                        }}
                        style={{marginTop: 45}}>
                        <MaterialCommunityIcons
                            name={'transfer-right'}
                            size={30}
                            color={baseColor.sky}/>
                    </TouchableOpacity>
                    <View style={{width: '45%'}}>
                        <TouchableOpacity style={Styles.input} onPress={() => {
                            if (Platform.OS === 'android') {
                                setModeDateArrival('date');
                            } else {
                                setOpenDateArrival(true);
                            }

                        }}>
                            <Text style={Styles.inputText}>{dateTimeArrivalStr}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[Styles.input, {marginTop: 10}]} onPress={() => openArrival()}>
                            <Text style={[Styles.inputText, {
                                color: placeArrival ? baseColor.blue : baseColor.gray_hint,
                                fontWeight: placeArrival ? '500' : '300',
                            }]}>{placeArrival?.name ?? I18n.t('to')}
                            </Text>
                        </TouchableOpacity>
                        {(modeDateArrival || Platform.OS === 'ios') && dateArrivalPicker()}
                    </View>
                </View>
                <TouchableOpacity onPress={() => setAutoConfirmation(!autoConfirmation)}>
                    <View style={[{flexDirection: 'row', alignItems: 'center', marginTop: 20}]}>
                        <MaterialCommunityIcons
                            size={30}
                            color={autoConfirmation ? baseColor.sky : baseColor.light_gray}
                            name={'flash'}/>
                        <Text style={Styles.hint}>{I18n.t('auto_confirm')}</Text>
                    </View>
                </TouchableOpacity>

                <View style={[Styles.row, {marginTop: 40}]}>
                    <View style={{width: '45%'}}>
                        <Text style={Styles.hint}>{I18n.t('vehicle.label')}</Text>
                        {vehicles.length > 0 &&
                            <SelectDropdown
                                data={vehicles}
                                defaultValue={vehicle}
                                onSelect={(selectedItem, index) => {
                                    setVehicle(selectedItem);
                                }}
                                renderButton={(selectedItem, isOpened) => {
                                    return (renderVehicle(selectedItem, isOpened));
                                }}
                                renderItem={(item, index, isSelected) => {
                                    return (renderVehicleItem(item, isSelected));
                                }}
                                showsVerticalScrollIndicator={false}
                                dropdownStyle={Styles.dropdownMenuStyle}
                            />
                        }
                    </View>
                    <View style={[Styles.row, {}]}>
                        <View>
                            <Text style={Styles.hint}>{I18n.t('places')}</Text>
                            <View style={[Styles.input, {minWidth: 40}]}>
                                <TextInput
                                    style={[Styles.inputText, {
                                        paddingVertical: Platform.OS === 'ios' ? 3 : 0,
                                        minWidth: 30,
                                    }]}
                                    inputMode="tel"
                                    autoCompleteType="tel"
                                    textContentType="telephoneNumber"
                                    keyboardType="decimal-pad"
                                    autoCapitalize="none"
                                    onSubmitEditing={() => Keyboard.dismiss()}
                                    defaultValue={countPlaces?.toString()}
                                    onChangeText={(v) => {
                                        if (v.length === 0) {
                                            setCountPlaces(0);
                                        } else {
                                            setCountPlaces(parseInt(v ?? 0, 10));
                                        }
                                    }}/>
                            </View>
                        </View>
                        {!route.params?.copy && route.params?.trip && <View style={{marginLeft: 10}}>
                            <Text style={Styles.hint}>{I18n.t('requests')}</Text>
                            <TouchableOpacity style={[Styles.input, {minWidth: 30}]} onPress={() => openBookings()}>
                                <Text
                                    style={[Styles.inputText, {
                                        textAlign: 'center',
                                        paddingVertical: 3,
                                    }]}>{trip?.countBooked ?? 0} / {trip?.countWaitingConfirmation ?? 0}</Text>
                            </TouchableOpacity>
                        </View>}
                    </View>
                    <View style={{}}>
                        <Text style={Styles.hint}>{I18n.t('price')}</Text>
                        <View style={Styles.input}>
                            <TextInput
                                style={[Styles.inputText, {
                                    paddingVertical: Platform.OS === 'ios' ? 3 : 0,
                                    minWidth: 30,
                                }]}
                                value={price?.toString()}
                                onChangeText={(v) => {
                                    if (v.length === 0) {
                                        setPrice(0);
                                    } else {
                                        setPrice(parseInt(v ?? 0, 10));
                                    }
                                }}
                                inputMode="tel"
                                autoCompleteType="tel"
                                textContentType="telephoneNumber"
                                keyboardType="decimal-pad"
                                autoCapitalize="none"
                                onSubmitEditing={() => Keyboard.dismiss()}
                            />
                        </View>
                    </View>
                </View>
                {enableEditing() && <View style={[Styles.row, {marginTop: 40}]}>
                    <View style={Styles.rowStart}>
                        <TouchableOpacity onPress={() => setCountPlaces(countPlaces > 1 ? countPlaces - 1 : 1)}
                                          style={{marginHorizontal: 40}}>
                            <MaterialCommunityIcons
                                size={40}
                                color={baseColor.sky}
                                name={'minus-circle'}/>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setCountPlaces(countPlaces + 1)}>
                            <MaterialCommunityIcons
                                size={40}
                                color={baseColor.sky}
                                name={'plus-circle'}/>
                        </TouchableOpacity>
                    </View>

                    <ActionButton onPress={() => saveTrip()} title={I18n.t('save')}/>
                </View>}
                <Text style={[Styles.hint, {marginTop: 30}]}>{I18n.t('note')}</Text>
                <TextInput
                    multiline={true}
                    style={Styles.commentInput}
                    value={note}
                    onChangeText={v => setNote(v)}
                />
            </ScrollView>
        </KeyboardAvoidingView>
    </BaseLayout>;
};

export default TripDetailScreen;
