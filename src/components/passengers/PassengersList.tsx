import {useEffect, useState} from 'react';
import {FlatList} from 'react-native';
import {PassengerItem} from './PassengerItem';
import firestore from '@react-native-firebase/firestore';
import {FIELDS, STATUS, TABLES} from '../../Const';

export const PassengersList = ({tripRef,navigation}) => {
    const [bookings, setBookings] = useState();

    useEffect(() => {
        return firestore().collection(TABLES.BOOKINGS)
            .where(FIELDS.TRIP_REF, '==', tripRef)
            .where(FIELDS.STATUS, '==', STATUS.ACTIVE_BOOKING)
            .onSnapshot(qs => {
                setBookings(qs.docs.map(qds => qds.data()));
            });

    }, []);

    return (
        <FlatList
            data={bookings}
            renderItem={item => {
                return <PassengerItem
                    navigation={navigation}
                    item={item.item}/>;
            }}/>);

};
