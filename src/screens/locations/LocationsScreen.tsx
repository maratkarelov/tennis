import {FlatList, SafeAreaView, Text, TouchableOpacity, View} from "react-native";
import Styles from './styles'
import StylesGlobal from '../../theme/styles'
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import I18n from "../../locales/i18n";
import {useEffect, useState} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {FIELDS, STORAGE_KEYS, TABLES} from "../../Const";
import firestore, {collection, getDocs, getFirestore, query, where} from "@react-native-firebase/firestore";
import {baseColor} from "../../theme/appTheme";

export const LocationsScreen = ({navigation}) => {
    const [place, setPlace] = useState();
    const [sport, setSport] = useState();
    const [locations, setLocations] = useState();
    // console.log('place',place)
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
        const db = getFirestore();

        let q = query(collection(db, TABLES.LOCATIONS));
        if (sport) {
            q = query(q, where(FIELDS.SPORT_REF, '==', sport.ref));
        }
        if (place) {
            q = query(q, where(FIELDS.PLACE_REF, '==', place.ref));
        }
        getDocs(q).then(querySnapshot => {
            setLocations(querySnapshot.docs.map(qds => {
                return {ref: qds.ref, ...qds.data()}
            }))
        });


    }, [navigation]);
    const renderItem = ({item, index}) => {
        return (
            <View style={[StylesGlobal.row, StylesGlobal.whiteBordered]}>
                <Text>{item.name}</Text>
            </View>
        )
    }

    const handleOpenPlace = () => {
        navigation.navigate('SearchPlaceScreen', {
            onGoBack: data => {
                setPlace(data);
            },
        });

    };
    const handleOpenSport = () => {

    };
    return (
        <SafeAreaView>
            <View style={[StylesGlobal.rowSpace, {margin: 10}]}>
                <TouchableOpacity
                    onPress={()=>{
                        handleOpenSport()
                    }}
                    style={[StylesGlobal.row, Styles.selector, {flex:1, marginRight:10}]}>
                    <MaterialCommunityIcons
                        size={24}
                        color={baseColor.primary}
                        name={'tennis'}
                    ></MaterialCommunityIcons>
                    <Text
                        numberOfLines={1}
                        style={Styles.selectorText}>{I18n.t('tennis')}</Text>

                </TouchableOpacity>
                <TouchableOpacity
                    onPress={()=>{
                        handleOpenPlace()
                    }}
                    style={[StylesGlobal.row, Styles.selector, {borderColor: baseColor.secondary,flex:1, marginLeft:10}]}>
                    <MaterialCommunityIcons
                        size={24}
                        color={baseColor.secondary}
                        name={'map-marker'}
                    ></MaterialCommunityIcons>
                    <Text
                        numberOfLines={1}
                        style={[Styles.selectorText, {color: baseColor.secondary}]}>{place?.name??I18n.t('select')}</Text>

                </TouchableOpacity>
            </View>
            <FlatList
                style={{marginHorizontal:10, marginTop:20}}
                data={locations}
                renderItem={renderItem}/>
        </SafeAreaView>
    )
}
