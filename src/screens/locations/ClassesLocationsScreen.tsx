import {FlatList, Platform, StatusBar, Text, TouchableOpacity, View} from 'react-native';
import StylesGlobal from '../../theme/styles';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import I18n from '../../locales/i18n';
import {useEffect, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {FIELDS, STORAGE_KEYS, TABLES} from '../../Const';
import firestore, {collection, getDocs, getFirestore, query, where} from '@react-native-firebase/firestore';
import {baseColor} from '../../theme/appTheme';
import {SafeAreaProvider, SafeAreaView} from "react-native-safe-area-context";

export const ClassesLocationsScreen = ({navigation}) => {
    const [place, setPlace] = useState();
    const [sport, setSport] = useState();
    const [locations, setLocations] = useState();

    const handleOpenPlace = () => {
        navigation.navigate('SearchPlaceScreen', {
            onGoBack: data => {
                console.log('data', data);
                AsyncStorage.setItem(STORAGE_KEYS.place, JSON.stringify({path: data.ref.path, name: data.name}));
                setPlace(data);
            },
        });

    };
    const handleOpenSport = () => {
        navigation.navigate('ClassesScreen', {
            onGoBack: data => {
                console.log('data', data);
                AsyncStorage.setItem(STORAGE_KEYS.sport, JSON.stringify({path: data.ref.path, name: data.name}));
                setSport(data);
            },
        });

    };

    const filterLocations = () => {
        const db = getFirestore();
        let q = query(collection(db, TABLES.LOCATIONS)).where(FIELDS.ACTIVE,'==', true);
        if (sport) {
            q = query(q, where(FIELDS.SPORTS_REF, 'array-contains', sport.ref));
        }
        if (place) {
            const placeHierarchy = place.ref.path.split(TABLES.ITEMS)
            const placeField = placeHierarchy.length === 3 ? FIELDS.PLACE_REF : placeHierarchy.length === 2 ? FIELDS.REGION_REF : FIELDS.COUNTRY_REF
            // console.log('placeField', placeField)
            q = query(q, where(placeField, '==', place.ref));
        }
        getDocs(q).then(querySnapshot => {
            setLocations(querySnapshot.docs.map(qds => {
                return {ref: qds.ref, ...qds.data()};
            }));
        });

    };

    useEffect(() => {
        navigation.setOptions({
            headerShown: false,
            headerStatusBarHeight: Platform.OS === 'android' ? StatusBar.currentHeight - 20 : undefined,
            headerTitle: ' ',
        });
        AsyncStorage.getItem(STORAGE_KEYS.place).then(json => {
            const placeValue = JSON.parse(json);
            setPlace({ref: firestore().doc(placeValue.path), name: placeValue.name});
        });
        AsyncStorage.getItem(STORAGE_KEYS.sport).then(json => {
            const sportValue = JSON.parse(json);
            setSport({ref: firestore().doc(sportValue.path), name: sportValue.name});
        });
    }, [navigation]);

    useEffect(() => {
        if (place) {
            filterLocations();
        }
    }, [sport, place]);

    const renderItem = ({item, index}) => {
        return (
            <TouchableOpacity
                onPress={() => {
                    navigation.navigate('LocationCalendarScreen', {location: item})
                }}
                style={[StylesGlobal.row, StylesGlobal.whiteBordered, {marginTop: 10}]}>
                <Text>{item.name}</Text>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaProvider>
            <SafeAreaView style={[StylesGlobal.container, {justifyContent: 'space-between', flex: 1}]}>
                <View style={[StylesGlobal.rowSpace, { height: 60}]}>
                    <TouchableOpacity
                        onPress={() => {
                            handleOpenSport();
                        }}
                        style={[StylesGlobal.rowSpace, StylesGlobal.selector, {
                            flex: 0.5,
                            height: 60,
                            marginRight: 10,
                            alignItems: 'center'
                        }]}>
                        <Text
                            maxFontSizeMultiplier={1}
                            numberOfLines={2}
                            style={StylesGlobal.selectorText}
                        >{sport?.name ?? I18n.t('select_class')}
                        </Text>
                        {sport && <TouchableOpacity
                            style={{position: 'absolute', right: 10}}
                            onPress={() => {
                                setSport(undefined)
                            }}>
                            <MaterialCommunityIcons
                                size={24}
                                color={baseColor.primary}
                                name={'close'}
                            />
                        </TouchableOpacity>}

                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => {
                            handleOpenPlace();
                        }}
                        style={[StylesGlobal.row, StylesGlobal.selector, {
                            borderColor: baseColor.secondary,
                            marginLeft: 10,
                            flex: 0.5,
                            height: 60,
                            alignItems: 'center'
                        }]}>
                        <MaterialCommunityIcons
                            size={24}
                            color={baseColor.secondary}
                            name={'map-marker'}
                        />
                        <Text
                            maxFontSizeMultiplier={1}
                            numberOfLines={2}
                            style={[StylesGlobal.selectorText, {
                                color: baseColor.secondary,
                                textAlign: 'center',
                                paddingRight: 10,
                                width: '100%'
                            }]}>
                            {place?.name ?? I18n.t('select_location')}
                        </Text>

                    </TouchableOpacity>
                </View>
                <FlatList
                    style={{marginTop: 20}}
                    data={locations}
                    renderItem={renderItem}/>
            </SafeAreaView>
        </SafeAreaProvider>
    );
};
