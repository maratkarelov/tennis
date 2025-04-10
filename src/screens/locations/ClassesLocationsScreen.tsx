import {FlatList, Platform, SafeAreaView, Text, TouchableOpacity, View} from 'react-native';
import Styles from './styles';
import StylesGlobal from '../../theme/styles';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import I18n from '../../locales/i18n';
import {useEffect, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {FIELDS, STORAGE_KEYS, TABLES} from '../../Const';
import firestore, {collection, getDocs, getFirestore, query, where} from '@react-native-firebase/firestore';
import {baseColor} from '../../theme/appTheme';

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
        let q = query(collection(db, TABLES.LOCATIONS));
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
                style={[StylesGlobal.row, StylesGlobal.whiteBordered]}>
                <Text>{item.name}</Text>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={[StylesGlobal.container, {paddingTop: Platform.OS === 'android' ? 50 : 0}]}>
            <View style={[StylesGlobal.rowSpace, {margin: 10, height: 60}]}>
                <TouchableOpacity
                    onPress={() => {
                        handleOpenSport();
                    }}
                    style={[StylesGlobal.rowSpace, Styles.selector, {
                        flex: 0.5,
                        height: 60,
                        marginRight: 10,
                        alignItems: 'center'
                    }]}>
                    <Text
                        maxFontSizeMultiplier={1}
                        numberOfLines={2}
                        style={Styles.selectorText}
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
                    style={[StylesGlobal.row, Styles.selector, {
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
                        style={[Styles.selectorText, {
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
                style={{marginHorizontal: 10, marginTop: 20}}
                data={locations}
                renderItem={renderItem}/>
        </SafeAreaView>
    );
};
