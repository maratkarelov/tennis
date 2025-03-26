import {FlatList, Text, TouchableOpacity} from 'react-native';
import {useEffect, useRef, useState} from 'react';
import firestore from '@react-native-firebase/firestore';
import {FIELDS, TABLES} from '../../Const';
import {generateSortFn} from '../../tools/common';
import Styles from './styles';
import StylesGlobal from '../../theme/styles';
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import {baseColor} from "../../theme/appTheme";

type PlacesListProps = {
    selectedPlaceCallback: any,
    expandCollectionCallback: any,
    selectedCollection?: { ref: any };
};
export const PlacesList = (props: PlacesListProps) => {
    const [selectedCollection, setSelectedCollection] = useState(props.selectedCollection);
    const [places, setPlaces] = useState();
    // console.log('selectedCollection', selectedCollection)
    // console.log('places', places)

    useEffect(() => {
        setSelectedCollection(props.selectedCollection);
    }, [props.selectedCollection]);
    useEffect(() => {
        const collection = selectedCollection ? selectedCollection.ref.collection(TABLES.ITEMS) : firestore().collection(TABLES.PLACES);
        collection.get()
            .then(qs => {
                const list = qs.docs.map(qds => {
                    const {name, sort, isCollection} = qds.data();
                    return {ref: qds.ref, path: qds.ref.path, sort: sort ?? 3, isCollection, name: name};
                });
                const sortedList = list.sort(generateSortFn([{name: FIELDS.SORT}, {name: FIELDS.NAME}]));
                setPlaces(sortedList);
            })
            .catch(r => {
                console.log(r)
            });
    }, [selectedCollection]);

    const flatListRef = useRef();
    useEffect(() => {
        flatListRef?.current?.scrollToOffset({animated: true, offset: 0});
    }, [places]);

    function renderPlace(item) {
        return (
            <TouchableOpacity
                style={[StylesGlobal.rowSpace, StylesGlobal.whiteBordered]}
                onPress={() => {
                    console.log('item', item)
                    props.selectedPlaceCallback(item);
                }}>
                <Text style={[Styles.place, {
                    fontWeight: item.sort === 1 ? '600' : '400',
                    fontSize: 24 - item.sort * 2,
                    fontStyle: item.sort === 3 ? 'italic' : 'normal',
                }]}>{item.name}</Text>
                {item.isCollection && <TouchableOpacity
                    onPress={() => {
                        props.expandCollectionCallback(item);
                        setSelectedCollection(item);
                    }}
                >
                    <MaterialCommunityIcons
                        size={40}
                        color={baseColor.secondary}
                        name={'chevron-down'}
                    />
                </TouchableOpacity>}
            </TouchableOpacity>);
    }

    return <FlatList
        style={{marginHorizontal: 10, marginTop: 20}}

        ref={flatListRef}
        data={places}
        renderItem={item => renderPlace(item.item)}/>;

};

export default PlacesList;
