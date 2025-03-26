import {FlatList, Image, Text, TouchableOpacity, View} from 'react-native';
import moment from 'moment';
import Styles from './styles';
import {countReviewsAverageWeighted, generateSortFn, toColor, totalRatingWeighted} from '../../../tools/common';
import {baseColor} from '../../../theme/appTheme';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import React, {useContext, useEffect, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {FIELDS, STORAGE_KEYS} from '../../../Const';
import firestore from '@react-native-firebase/firestore';
import {getParamByISO} from 'iso-country-currency';
import I18n from '../../../locales/i18n';
import {FirestoreContext} from "../../../context/firestoreProvider";
import {Laurel} from "../../../components/SVG";


export const TripListView = ({trips, navigation}) => {
    const [drivers, setDrivers] = useState([]);
    const [places, setPlaces] = useState([]);
    const firestoreContext = useContext(FirestoreContext);

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

    async function readPlaces(placePaths: any[]) {
        const storedPlaces = JSON.parse(await AsyncStorage.getItem(STORAGE_KEYS.places) as string);
        const placesArray = [];
        placePaths.forEach(path => {
            const storedPlace = storedPlaces?.find(d => d.path === path);
            if (storedPlace) {
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
                });
            }
        });
    }

    useEffect(() => {
        const placePaths = [];
        const driverPaths = [];
        trips?.forEach(trip => {
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
        readPlaces(placePaths);
    }, [trips]);

    const renderTrip = (trip) => {
        const dateStr = moment(new Date(trip.dateDeparture.seconds * 1000)).utcOffset(trip.timeZone).format('HH:mm');
        const dateStrFull = moment(new Date(trip.dateDeparture.seconds * 1000)).utcOffset(trip.timeZone).format('HH:mm, ddd DD MMM');
        const driver = drivers.find(d => d.path === trip.driverRef.path);
        const direction = places.findIndex(item => item.path === trip.departureRef.path);
        const placeDeparture = places.find(item => item.path === trip.departureRef.path);
        const placeArrival = places.find(item => item.path === trip.arrivalRef.path);
        const total = totalRatingWeighted(driver);
        const count = countReviewsAverageWeighted(driver);
        const rating = count > 0 ? (total / count).toPrecision(3) : '';
        return (
            <TouchableOpacity
                onPress={() => {
                    if (firestoreContext.getCityUser() === undefined) {
                        navigation.navigate('EmailScreen', {});
                    } else {
                        navigation.navigate('MyBookingDetail', {
                            trip: trip,
                            driver: driver,
                            dateStrFull: dateStrFull,
                            route: placeDeparture?.name + ' -> ' + placeArrival?.name,
                        });
                    }
                }}
                style={[Styles.tripContainer, {
                    backgroundColor: trip.countPlaces === 0 ? baseColor.light_gray_0 : baseColor.white,
                    borderColor: trip.countPlaces === 0 ? baseColor.gray_10 : baseColor.white,
                }]}>
                <View>
                    <Text maxFontSizeMultiplier={1.2} style={Styles.time_text}>{dateStr}</Text>
                    <Text
                        maxFontSizeMultiplier={1.2}
                        style={Styles.price_text}>
                        {trip.price} {driver?.countryCode !== undefined && getParamByISO(driver.countryCode.toUpperCase(), 'symbol')}
                    </Text>
                </View>
                <TouchableOpacity
                    onPress={() => {
                        navigation.navigate('UserDetailsScreen',
                            {
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
                        <Laurel fill={toColor(driver?.moodColor)} size={65}></Laurel>
                    </View>
                    <View style={Styles.driverRating}>
                        <MaterialCommunityIcons size={16} color={baseColor.gray_middle}
                                                name={'star'}/>
                        <Text
                            maxFontSizeMultiplier={1.0}
                            style={{
                                marginLeft: 4,
                                color: baseColor.black,
                                fontSize: 16,
                            }}>{rating}
                        </Text>
                    </View>
                </TouchableOpacity>
                <View style={Styles.routeContainer}>
                    <Text
                        maxFontSizeMultiplier={1}
                        style={[Styles.routeText, {
                            fontWeight: 700,
                            fontSize: 20,
                            color: direction === -1 ? baseColor.gray_middle : direction === 1 ? baseColor.blue : baseColor.red_dark,
                        }]}
                        numberOfLines={1}>{placeDeparture?.name}</Text>
                    <Text maxFontSizeMultiplier={1} style={Styles.routeText} numberOfLines={1}>{placeArrival?.name}</Text>
                </View>
                {trip.countPlaces > 0 && (trip.countBooked ?? 0) === trip.countPlaces &&
                    <View
                        style={[Styles.noPlaces, {backgroundColor: trip.countPlaces === 0 ? baseColor.light_gray_0 : baseColor.orange_50}]}>
                        <Text maxFontSizeMultiplier={1} style={Styles.placesHint}>{I18n.t('no_places')}</Text>
                    </View>
                }
                {trip.countPlaces > (trip.countBooked ?? 0) &&
                    <View style={Styles.places}>
                        <Text maxFontSizeMultiplier={1} style={Styles.placesHint}>{I18n.t('places')}</Text>
                        <Text maxFontSizeMultiplier={1} style={Styles.placesText}>{trip.countPlaces - (trip.countBooked ?? 0)}</Text>
                    </View>
                }


            </TouchableOpacity>
        );

    };
    return (
        <FlatList data={trips} renderItem={item => renderTrip(item.item)}/>
    );
};
