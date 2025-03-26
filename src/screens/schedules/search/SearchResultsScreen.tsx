import {BaseLayout} from '../../components/base/BaseLayout';
import {StackScreenProps} from '@react-navigation/stack';
import React, {useEffect, useState} from 'react';
import firestore from '@react-native-firebase/firestore';
import {DATE_FORMATTERS, FIELDS, TABLES} from '../../Const';
import {SafeAreaView} from 'react-native';
import {TripListView} from '../trips/list/TripListView';
import moment from 'moment';
import {NoDataView} from "../../components/noData/NoDataView";

interface Props extends StackScreenProps<any, any> {
}

export const SearchResultsScreen = ({route, navigation}: Props) => {
    const [trips, setTrips] = useState();
    useEffect(() => {
        navigation.setOptions({
            headerShown: true,
            headerBackTitle: ' ',
            headerTitle: moment(new Date(route.params?.date)).format(DATE_FORMATTERS.datMonthYear)
            ,
        });
    }, [navigation]);

    useEffect(() => {
        const dateStart = new Date(route.params?.date);
        dateStart.setHours(0);
        dateStart.setMinutes(0);
        dateStart.setSeconds(0);
        dateStart.setMilliseconds(0);
        const dateEnd = new Date(route.params?.date);
        dateEnd.setHours(23);
        dateEnd.setMinutes(59);
        dateEnd.setSeconds(59);
        dateEnd.setMilliseconds(999);
        let queryTrips = firestore().collection(TABLES.TRIPS)
            .where(FIELDS.DATE_DEPARTURE, '>=', dateStart)
            .where(FIELDS.DATE_DEPARTURE, '<=', dateEnd);
        if (route.params?.placeDeparture) {
            queryTrips = queryTrips.where(FIELDS.DEPARTURE_REF, '==', route.params?.placeDeparture.ref);
        }
        if (route.params?.placeArrival) {
            queryTrips = queryTrips.where(FIELDS.ARRIVAL_REF, '==', route.params?.placeArrival.ref);
        }
        return queryTrips.onSnapshot(qs => {
            setTrips(qs.docs.map(qds => {
                return {ref: qds.ref, ...qds.data()};
            }));

        });

    }, [route.params]);

    return (
        <BaseLayout>
            <SafeAreaView>
                {trips?.length > 0 && <TripListView
                    trips={trips}
                    navigation={navigation}/>}
                {trips?.length === 0 && <NoDataView/>}
            </SafeAreaView>
        </BaseLayout>
    );
};
