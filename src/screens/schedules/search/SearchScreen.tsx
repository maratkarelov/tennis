import {Linking, SafeAreaView, Text, TouchableOpacity, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import {Calendar} from 'react-native-calendars';
import Styles from './styles';
import {baseColor} from '../../../theme/appTheme';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import ActionButton from '../../../components/ActionButton';
import {DATE_FORMATTERS, STORAGE_KEYS, TABLES} from '../../../Const';
import firestore from '@react-native-firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment/moment';
import {useIsFocused} from '@react-navigation/native';
import auth from '@react-native-firebase/auth';
import I18n from "../../../locales/i18n";

export const SearchScreen = ({navigation}) => {
    const [selected, setSelected] = useState('');
    const [placeDeparture, setPlaceDeparture] = useState();
    const [placeArrival, setPlaceArrival] = useState();
    const [cityUser, setCityUser] = useState();

    const isFocused = useIsFocused();

    useEffect(() => {
        firestore().collection(TABLES.USERS).doc(auth().currentUser?.uid).get().then(ds => {
            setCityUser({ref: ds.ref, ...ds.data()});
        });
        // console.log('isFocused',isFocused,firestoreContext.getCityUser()?.name)
        // if (isFocused) {
        //     setCityUser(firestoreContext.getCityUser())
        // }
    }, [isFocused]);

    const openDeparture = () => {
        navigation.navigate('SearchPlaceScreen', {
            onGoBack: data => {
                setPlaceDeparture(data);
                const json = JSON.stringify({
                    path: data.path,
                    name: data.name,
                });
                AsyncStorage.setItem(STORAGE_KEYS.placeDeparture, json);
            },
        });
    };
    const openArrival = () => {
        navigation.navigate('SearchPlaceScreen', {
            onGoBack: data => {
                setPlaceArrival(data);
                const json = JSON.stringify({
                    path: data.path,
                    name: data.name,
                });
                AsyncStorage.setItem(STORAGE_KEYS.placeArrival, json);
            },
        });
    };

    useEffect(() => {
        navigation.setOptions({
            headerShown: false,
            headerTitle: ' ',
        });
        AsyncStorage.getItem(STORAGE_KEYS.placeDeparture).then(json => {
            const place = JSON.parse(json);
            setPlaceDeparture({ref: firestore().doc(place.path), name: place.name});
        });
        AsyncStorage.getItem(STORAGE_KEYS.placeArrival).then(json => {
            const place = JSON.parse(json);
            setPlaceArrival({ref: firestore().doc(place.path), name: place.name});
        });

    }, [navigation]);

    const searchTrip = () => {
        navigation.navigate('SearchResultsScreen', {
            date: selected,
            placeDeparture: placeDeparture,
            placeArrival: placeArrival,
        });
    };
    const today = moment(new Date()).format(DATE_FORMATTERS.yearMonthDay);
    return (
        <SafeAreaView>
            <Calendar
                minDate={cityUser === undefined || !cityUser.trustedDriver ? today : ''}
                firstDay={1}
                onDayPress={day => {
                    setSelected(day.dateString);
                }}
                markedDates={{
                    [selected]: {selected: true, disableTouchEvent: true, selectedDotColor: 'orange'},
                }}
            />
            <View style={[Styles.input]}>
                <TouchableOpacity
                    style={{width: '90%'}}
                    onPress={() => openDeparture()}>
                    <Text
                        style={[Styles.inputText, {
                            color: placeDeparture ? baseColor.blue : baseColor.gray_hint,
                            fontWeight: placeDeparture ? '500' : '300',
                        }]}>{placeDeparture?.name ?? I18n.t('from')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => {
                        setPlaceDeparture(undefined);
                        AsyncStorage.setItem(STORAGE_KEYS.placeDeparture, '');
                    }}>
                    <MaterialCommunityIcons
                        size={24}
                        color={baseColor.gray_middle}
                        name={'close'}/>
                </TouchableOpacity>
            </View>
            <TouchableOpacity
                onPress={() => {
                    setPlaceDeparture(placeArrival);
                    setPlaceArrival(placeDeparture);
                }}
                style={{marginTop: 30, alignSelf: 'center'}}>
                <MaterialCommunityIcons
                    name={'swap-vertical'}
                    size={30}
                    color={baseColor.sky}/>
            </TouchableOpacity>
            <View style={[Styles.input]}>
                <TouchableOpacity
                    style={{width: '90%'}}
                    onPress={() => openArrival()}>
                    <Text
                        style={[Styles.inputText, {
                            color: placeArrival ? baseColor.blue : baseColor.gray_hint,
                            fontWeight: placeArrival ? '500' : '300',
                        }]}>{placeArrival?.name ?? I18n.t('to')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => {
                        setPlaceArrival(undefined);
                        AsyncStorage.setItem(STORAGE_KEYS.placeArrival, '');
                    }}>
                    <MaterialCommunityIcons
                        size={24}
                        color={baseColor.gray_middle}
                        name={'close'}/>
                </TouchableOpacity>
            </View>

            <ActionButton
                disable={selected === '' || (placeDeparture === undefined && placeArrival === undefined)}
                styles={{width: 100, marginTop: 50, alignSelf: 'center'}}
                onPress={() => searchTrip()}
                title={I18n.t('find')}/>
            <TouchableOpacity
                onPress={() => {
                    Linking.openURL('https://citycity.me/privacy');
                }}
                style={{marginTop: 30}}
            >
                <Text style={{textAlign: 'center', color: baseColor.sky}}>{I18n.t('terms_conditions')}</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
};
