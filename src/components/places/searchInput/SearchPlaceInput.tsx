import React, {useEffect, useState} from 'react';
import {FIELDS, TABLES} from '../../../Const';
import {Text, TextInput, TouchableOpacity, View} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import {baseColor} from "../../../theme/appTheme";

const SearchPlaceInput = ({editable, setPlace, place}) => {

    const [strSearch, setStrSearch] = useState(place?.name ?? '');
    const [isShowAutocomplete, setIsShowAutocomplete] = useState(false);
    const [foundPlaces, setFoundPlaces] = useState([]);
    const searchPlaces = () => {
        const strLength = strSearch?.length ?? 0;
        if (strLength < 3) {
            setFoundPlaces([]);
            return null;
        }
        const strFrontCode = strSearch.slice(0, strLength - 1);
        const strEndCode = strSearch.slice(strLength - 1, strSearch.length);

        const startcode = strSearch;
        const endcode = strFrontCode + String.fromCharCode(strEndCode.charCodeAt(0) + 1);
        firestore().collection(TABLES.PLACE_NAMES)
            .where(FIELDS.NAME, '>=', startcode)
            .where(FIELDS.NAME, '<', endcode)
            .get()
            .then(qs => {
                const foundPlacesTemp = [];
                qs.docs.forEach((doc) => {
                    foundPlacesTemp.push(doc.data());
                });
                setFoundPlaces(foundPlacesTemp);

            })

    };

    useEffect(() => {
        setStrSearch(place?.name);
    }, [place]);

    useEffect(() => {
        searchPlaces();
    }, [strSearch]);


    const handleFilter = (value) => {
        // setPlace(null);
        setIsShowAutocomplete(true);
        setStrSearch(value);
    };

    const handleSelectPlace = (value) => {
        setPlace(value);
        setStrSearch(value.name);
        setIsShowAutocomplete(false);

    };

    return (
        <View>
            <TextInput
                style={{
                    width:200,
                    color: baseColor.black,
                    padding: 10,
                    fontSize: 14,
                    borderRadius: 10,
                    borderColor: baseColor.light_gray,
                    borderWidth: 1
                }}
                type="text"
                placeholder="Нас. пункт"
                editable={editable}
                value={strSearch}
                onChangeText={v => handleFilter(v)}
            />
            {isShowAutocomplete && foundPlaces.length > 0 && (
                <View style={{
                    position: 'absolute',
                    top: 40,
                    fontSize: 18,
                    padding: 10,
                    backgroundColor: baseColor.primary_light,
                    width: 300
                }}>
                    {foundPlaces.map((value, key) => {
                        return (
                            <TouchableOpacity
                                style={{
                                    padding: 8,
                                    borderBottomColor: baseColor.light_gray,
                                    borderBottomWidth: foundPlaces.length > 1 && key < (foundPlaces.length - 1) ? 1 : 0,
                                }}
                                onPress={() => handleSelectPlace(value)}>
                                <Text style={{color: baseColor.black, fontSize: 18}}>{value.name}</Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            )}
        </View>
    );


};
export default SearchPlaceInput;
