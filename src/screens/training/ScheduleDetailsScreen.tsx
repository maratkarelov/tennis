import {StackScreenProps} from '@react-navigation/stack/lib/typescript/module/src';
import {BaseLayout} from '../../components/base/BaseLayout';
import DatePicker from 'react-native-date-picker';
import RNDateTimePicker from '@react-native-community/datetimepicker';
import 'dayjs/locale/en';
import 'dayjs/locale/ru';
import 'moment/locale/ru';
import moment from 'moment';
import I18n from '../../locales/i18n';
import SelectDropdown from 'react-native-select-dropdown';
import {useContext, useEffect, useRef, useState} from 'react';
import {FirestoreContext} from '../../context/firestoreProvider';
import StylesGlobal from '../../theme/styles';
import {Keyboard, Platform, StatusBar, Text, TextInput, TouchableOpacity, View,} from 'react-native';
import {baseColor} from '../../theme/appTheme';
import {CANCEL_REASON, FIELDS, STATUS, TABLES} from '../../Const';
import firestore from '@react-native-firebase/firestore';
import ActionButton from '../../components/ActionButton';


interface Props extends StackScreenProps<any, any> {
}

export const ScheduleDetailsScreen = ({route, navigation}: Props) => {
    const firestoreContext = useContext(FirestoreContext);
    const [confirm, setConfirm] = useState();
    const [isLoading, setLoading] = useState(false);
    const [schedule] = useState(route.params?.schedule);
    const offset = route.params?.copy ? 3600 * 24 : 0;
    const [modeDate, setModeDate] = useState();
    const [date, setDate] = useState<Date>(schedule?.date ? new Date((schedule?.date.seconds + offset) * 1000) : new Date());
    const [openDate, setOpenDate] = useState(false);
    const [location, setLocation] = useState(route.params?.location);
    const [sport, setSport] = useState(route.params?.sport);
    const [price, setPrice] = useState(schedule?.price ?? 400);
    const [countPlaces, setCountPlaces] = useState(schedule?.countPlaces ?? 6);
    const [duration, setDuration] = useState(schedule?.duration ?? 60);
    const [cancelReason, setCancelReason] = useState();
    const cancelReasons = [I18n.t('reschedule'), I18n.t('ill'), I18n.t('no_reason')];
    const [note, setNote] = useState(schedule?.note ?? '');
    const [openReasonSelectDropdown, setOpenReasonSelectDropdown] = useState(false);
    const refReasonSelectDropdown = useRef(null)
    const enableEditing = () => {
        return date?.getTime() > Date.now() && location !== undefined && countPlaces > 0 && price > 0 && duration > 0;
    };


    //=================================================================================
    // FUNCTIONS
    //=================================================================================


    const openMySports = () => {
        navigation.navigate('SportsScreen', {
            onGoBack: data => {
                setSport(data);
            },
        });
    };

    const openMyLocations = () => {
        navigation.navigate('CoachLocationsScreen', {
            onGoBack: data => {
                setLocation(data);
            },
        });
    };

    const openBookings = () => {
        if (schedule) {
            navigation.navigate('BookingsScreen', {
                iAmAdmin: route.params?.iAmAdmin,
                trip: route.params?.trip,
                dateStrFull: route.params?.dateStrFull,
                route: route.params?.route,

            });
        }
    };
    const saveSchedule = () => {
        setLoading(true);
        // console.log(data)
        if (schedule && !route.params?.copy) {
            const updateData = {
                date: date,
                timeZone: moment(date).format('Z').replace(':', ''),
                countPlaces: parseInt(countPlaces, 10),
                price: parseInt(price, 10),
                note: note,
                cancelReason: CANCEL_REASON.UNDEFINED
            };
            schedule.ref.update(updateData)
                .then(ref => navigation.goBack())
                .catch(reason => {
                    console.log('reason', reason.toString());
                })
                .finally(() => setLoading(false));
        } else {
            const data = {
                coachRef: firestoreContext.getCityUser()?.ref,
                locationRef: location.ref,
                date: date,
                duration: duration,
                currencyCountryCode: firestoreContext.getCityUser()?.countryCode,
                timeZone: moment(date).format('Z').replace(':', ''),
                countPlaces: parseInt(countPlaces, 10),
                price: parseInt(price, 10),
                note: note,
                cancelReason: CANCEL_REASON.UNDEFINED
            };
            console.log('data', data)
            firestore().collection(TABLES.SCHEDULE).add(data)
                .then(ref => navigation.goBack())
                .catch(reason => {
                    console.log('reason', reason.toString());
                })
                .finally(() => setLoading(false));
        }
    };

    const cancelSchedule = () => {
        const data = {
            cancelReason: cancelReasons.indexOf(cancelReason),
            countPlaces: 0,
            countBooked: 0,
            countWaitingConfirmation: 0,
        };
        const dataBooking = {
            status: STATUS.CANCELED_BY_DRIVER,
            dateModification: new Date(),

        };
        setLoading(true);
        route.params?.schedule.ref.update(data)
            .then(() => {
                firestore().collection(TABLES.BOOKINGS)
                    .where(FIELDS.SCHEDULE_REF, '==', route.params?.schedule.ref)
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

    //================================================
    // hooks
    //================================================
    useEffect(() => {
        navigation.setOptions({
            headerShown: true,
            headerTopInsetEnabled: false,
            headerStatusBarHeight: Platform.OS === 'android' ? StatusBar.currentHeight - 20 : undefined,
            headerBackTitle: ' ',
            headerTitle: I18n.t(route.params?.copy ? 'copy_schedule' : schedule ? date.getTime() > Date.now() ? 'editing' : 'archive' : 'new_schedule'),
        });

    }, [navigation, date, schedule]);

    useEffect(() => {
        if (cancelReason) {
            setConfirm(I18n.t('cancel_schedule_question') + '\n' + I18n.t('reason') + ': ' + cancelReason)
        }
    }, [cancelReason])


    //================================================
    // render UI
    //================================================
    const timeStr = moment(date).format('HH:mm');
    const dateStr = moment(date).format('DD MMM dd');

    const datePicker = () => {
        if (Platform.OS === 'android') {
            return <RNDateTimePicker
                mode={modeDate}
                value={date}
                onChange={(event, date) => {
                    if (modeDate === 'date') {
                        setDate(date);
                        setModeDate('time');
                    } else if (modeDate === 'time') {
                        setDate(date);
                        setModeDate(undefined);
                    } else {
                        setModeDate('date');
                    }
                }
                }/>;
        } else {
            return <DatePicker
                modal
                minuteInterval={5}
                open={openDate}
                date={date}
                onConfirm={(date) => {
                    setDate(date);
                    setOpenDate(false);
                }}
                onCancel={() => {
                    setOpenDate(false);
                }}
            />;
        }
    };

    const renderCancelReason = (selectedItem) => {
        return <View style={[StylesGlobal.input, {
            paddingVertical: 8,
            backgroundColor: openReasonSelectDropdown ? baseColor.white : baseColor.light_gray_3
        }]}>
            <Text style={[StylesGlobal.inputText, {
                color: selectedItem && openReasonSelectDropdown ? baseColor.blue : baseColor.gray_hint,
                fontWeight: selectedItem ? '500' : '300',
            }]}>
                {selectedItem}
            </Text>
        </View>

            ;
    };
    const renderCancelReasonItem = (item, isSelected) => {
        return <View style={{...StylesGlobal.dropdownItemStyle, ...(isSelected && {backgroundColor: '#D2D9DF'})}}>
            <Text style={StylesGlobal.dropdownItemTxtStyle}>{item}</Text>
        </View>;
    };

    function renderPrice() {
        return <View>
            <Text style={StylesGlobal.textHint}>{I18n.t('price')}</Text>
            <View style={StylesGlobal.input}>
                <TextInput
                    style={[StylesGlobal.inputText, {
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
        </View>;
    }

    const renderCount = () => {
        return (
            <View>
                <Text style={StylesGlobal.textHint}>{I18n.t('places')}</Text>
                <View style={[StylesGlobal.input, {minWidth: 40}]}>
                    <TextInput
                        style={[StylesGlobal.inputText, {
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
        );
    };
    const renderDuration = () => {
        return (
            <View>
                <Text style={StylesGlobal.textHint}>{I18n.t('duration')}</Text>
                <View style={[StylesGlobal.input, {minWidth: 40}]}>
                    <View style={[StylesGlobal.row, {alignItems: 'center'}]}>
                        <TextInput
                            style={[StylesGlobal.inputText, {
                                paddingVertical: Platform.OS === 'ios' ? 3 : 0,
                                minWidth: 30,
                                marginRight: 10,
                                paddingHorizontal: 0,
                            }]}
                            maxLength={3}
                            inputMode="tel"
                            autoCompleteType="tel"
                            textContentType="telephoneNumber"
                            keyboardType="decimal-pad"
                            autoCapitalize="none"
                            onSubmitEditing={() => Keyboard.dismiss()}
                            defaultValue={duration?.toString()}
                            onChangeText={(v) => {
                                if (v.length === 0) {
                                    setDuration(0);
                                } else {
                                    setDuration(parseInt(v ?? 0, 10));
                                }
                            }}/>
                        <Text style={StylesGlobal.textHint}>{I18n.t('minutes')}</Text>
                    </View>
                </View>
            </View>
        );
    };

    const renderCountBooked = () => {
        return (<View>
                <Text style={StylesGlobal.textHint}>{I18n.t('requests')}</Text>
                <TouchableOpacity
                    disabled={route.params?.copy || route.params?.schedule === undefined}
                    style={[StylesGlobal.input, {minWidth: 30}]}
                    onPress={() => openBookings()}>
                    <Text
                        style={[StylesGlobal.inputText, {
                            color: schedule ? baseColor.primary : baseColor.gray_hint,
                            paddingVertical: Platform.OS === 'ios' ? 3 : 0,
                            minWidth: 30,
                        }]}>{schedule?.countBooked ?? 0} / {schedule?.countWaitingConfirmation ?? 0}</Text>
                </TouchableOpacity>
            </View>
        );
    };

    const renderCancel = () => {
        return !route.params?.copy && schedule && schedule?.countPlaces > 0 && date?.getTime() > Date.now() && (
            <View>

                <ActionButton
                    backgroundColor={baseColor.red_dark}
                    title={I18n.t('cancel')}
                    style={{padding: 4, marginRight: 10}}
                    onPress={() => {
                        setOpenReasonSelectDropdown(true)
                        refReasonSelectDropdown.current.openDropdown()
                    }}>
                </ActionButton>
                <View style={{marginTop: 20}}>
                    <Text style={StylesGlobal.textHint}>{I18n.t('reason')}</Text>
                    <SelectDropdown
                        disabled={!openReasonSelectDropdown}
                        ref={refReasonSelectDropdown}
                        data={cancelReasons}
                        defaultValue={I18n.t('reschedule')}
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
                        dropdownStyle={StylesGlobal.dropdownMenuStyle}
                    />
                </View>
            </View>);

    };

    const renderSave = () => {
        return (enableEditing() &&
            <ActionButton
                disable={!enableEditing()}
                onPress={saveSchedule}
                title={I18n.t('save')}/>);
    };
    return <BaseLayout
        confirm={confirm}
        callbackConfirm={(res) => {
            setConfirm(undefined);
            if (res) {
                cancelSchedule();
            }
        }
        }
        isLoading={isLoading}
    >
        <View style={StylesGlobal.container}>
            <View style={[StylesGlobal.rowSpace, {marginTop: 5}]}>
                <View style={[{width: '40%'}]}>
                    <TouchableOpacity style={StylesGlobal.input} onPress={() => {
                        if (Platform.OS === 'android') {
                            setModeDate('date');
                        } else {
                            setOpenDate(true);
                        }
                    }}>
                        <View style={[StylesGlobal.row, {
                            paddingVertical: Platform.OS === 'ios' ? 3 : 0,
                            minWidth: 30,
                        }]}>
                            <Text style={StylesGlobal.textGray}>{dateStr}</Text>
                            <Text style={StylesGlobal.textSecondary}> {timeStr}</Text>
                        </View>
                    </TouchableOpacity>
                    <View style={[StylesGlobal.rowSpace, {marginTop: 10}]}>
                        {renderPrice()}
                        {renderCount()}
                    </View>
                </View>
                <View style={[{width: '50%'}]}>
                    <TouchableOpacity style={[StylesGlobal.input]} onPress={() => openMySports()}>
                        <Text
                            numberOfLines={1}
                            style={[StylesGlobal.inputText, {
                                color: sport ? baseColor.secondary : baseColor.gray_hint,
                                paddingVertical: Platform.OS === 'ios' ? 3 : 0,
                                minWidth: 30,
                            }]}
                        >{sport?.name ?? I18n.t('sport')}</Text>
                    </TouchableOpacity>
                    <View style={[StylesGlobal.rowSpace, {marginTop: 10}]}>
                        {renderDuration()}
                        {renderCountBooked()}
                    </View>
                </View>
                {(modeDate || Platform.OS === 'ios') && datePicker()}
            </View>
            <TouchableOpacity style={[StylesGlobal.input, {marginTop:20}]} onPress={() => openMyLocations()}>
                <Text
                    numberOfLines={1}
                    style={[StylesGlobal.inputText, {
                        color: location ? baseColor.secondary : baseColor.gray_hint,
                        paddingVertical: Platform.OS === 'ios' ? 3 : 0,
                        minWidth: 30,
                    }]}
                >{location?.name ?? I18n.t('location')}</Text>
            </TouchableOpacity>

            <Text style={[StylesGlobal.textHint, {marginTop: 30}]}>{I18n.t('note')}</Text>
            <TextInput
                multiline={true}
                style={StylesGlobal.commentInput}
                value={note}
                onChangeText={v => setNote(v)}
            />
            <View style={[StylesGlobal.rowSpace, {marginTop: 50, alignItems: 'flex-start'}]}>
                {renderCancel()}
                {renderSave()}
            </View>
        </View>

    </BaseLayout>;
};
