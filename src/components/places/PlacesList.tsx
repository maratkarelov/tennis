import {FlatList, Text, TouchableOpacity} from 'react-native';
import {useEffect, useRef, useState} from 'react';
import firestore from '@react-native-firebase/firestore';
import {FIELDS, TABLES} from '../../Const';
import {generateSortFn} from '../../tools/common';
import Styles from './styles';

type PlacesListProps = {
    selectedPlaceCallback: any,
    selectedCollection?: { ref: any };
};
export const PlacesList = (props: PlacesListProps) => {
    const [selectedCollection, setSelectedCollection] = useState(props.selectedCollection);
    const [places, setPlaces] = useState();

    useEffect(() => {
        setSelectedCollection(props.selectedCollection);
    }, [props.selectedCollection]);
    useEffect(() => {
        const collection = selectedCollection ? selectedCollection.ref.collection(TABLES.ITEMS) : firestore().collection(TABLES.PLACES);
        collection.get().then(qs => {
            const list = qs.docs.map(qds => {
                const {name_ru, sort, isCollection} = qds.data();
                return {ref: qds.ref, path: qds.ref.path, sort: sort ?? 3, isCollection, name: name_ru};
            });
            const sortedList = list.sort(generateSortFn([{name: FIELDS.SORT}, {name: FIELDS.NAME}]));
            setPlaces(sortedList);
        });
    }, [selectedCollection]);

    const flatListRef = useRef();
    useEffect(() => {
        flatListRef?.current?.scrollToOffset({animated: true, offset: 0});
    }, [places]);

    function renderPlace(item) {
        return (
            <TouchableOpacity style={Styles.placeContainer} onPress={() => {
                if (item.isCollection) {
                    setSelectedCollection(item);
                }
                props.selectedPlaceCallback(item);
            }}>
                <Text style={[Styles.place, {
                    fontWeight: item.sort === 1 ? '600' : '400',
                    fontSize: 24 - item.sort * 2,
                    fontStyle: item.sort === 3 ? 'italic' : 'normal',
                }]}>{item.name}</Text>
            </TouchableOpacity>);
    }

    return <FlatList
        ref={flatListRef}
        data={places}
        renderItem={item => renderPlace(item.item)}/>;

};

export default PlacesList;
