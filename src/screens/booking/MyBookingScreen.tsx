import {BaseLayout} from '../../components/base/BaseLayout';
import {StackScreenProps} from '@react-navigation/stack/lib/typescript/module/src';
import {useContext, useEffect, useState} from 'react';
import moment from 'moment';
import 'moment/locale/ru';
import StylesGlobal from '../../theme/styles';
import {FlatList, Image, Text, TouchableOpacity, View} from 'react-native';
import I18n from '../../locales/i18n';
import ActionButton from '../../components/ActionButton';
import {baseColor} from '../../theme/appTheme';
import LoadingSpinner from '../../components/LoadingSpinner';
import firestore, {collection, getDocs, getFirestore, query} from '@react-native-firebase/firestore';
import {FIELDS, STATUS, TABLES} from '../../Const';
import {FirestoreContext} from '../../context/firestoreProvider';
import {NoDataView} from "../../components/noData/NoDataView";

interface Props extends StackScreenProps<any, any> {
}

export const MyBookingScreen = ({route, navigation}: Props) => {
    const firestoreContext = useContext(FirestoreContext);
    const [bookings, setBookings] = useState();
    const [members, setMembers] = useState();
    const myBooking = bookings?.find(b => b.userRef.id === firestoreContext.getCityUser()?.ref.id);
    console.log('myBooking', myBooking);
    const [loading, setLoading] = useState(false);
    const [loadingAvatar, setLoadingAvatar] = useState(true);
    const dateStr = moment(new Date(route.params?.schedule.date.seconds * 1000)).format('ddd DD MMM HH:mm');

    //================================================
    // func
    //================================================
    const handleRightClick = () => {
        setLoading(true);
        if (myBooking) {
            const updateData = {
                status: myBooking.status === STATUS.ACTIVE_BOOKING ? STATUS.CANCELED_BY_PASSENGER : STATUS.ACTIVE_BOOKING,
                dateModification: new Date(),
            };
            myBooking.ref
                .update(updateData)
                .then(() => {
                    setLoading(false);
                    readBookings();
                });
        } else {
            const data = {
                scheduleRef: route.params?.schedule.ref,
                userRef: firestoreContext.getCityUser()?.ref,
                dateModification: new Date(),
                status: STATUS.ACTIVE_BOOKING,
            };
            firestore()
                .collection(TABLES.CLASS_BOOKINGS)
                .add(data)
                .then(() => {
                    setLoading(false);
                    readBookings();
                });
        }
    };

    const handleLoad = () => {
        setLoadingAvatar(false);
    };

    async function readMembers() {
        const allMembersRefs = bookings.map(item => item.userRef);
        const list = [];
        for (const memberRef of allMembersRefs) {
            const member = (await memberRef.get()).data();
            list.push({ref: memberRef, ...member});
        }
        setMembers(list);
    }

    const readBookings = () => {
        console.log('readBookings', route.params?.schedule.ref.path);
        let q = query(collection(getFirestore(), TABLES.CLASS_BOOKINGS));
        q = q.where(FIELDS.SCHEDULE_REF, '==', route.params?.schedule.ref);
        getDocs(q)
            .then(querySnapshot => {
                console.log('querySnapshot', querySnapshot.size);
                setBookings(querySnapshot.docs.map(qds => {
                    return {ref: qds.ref, ...qds.data()};
                }));
            })
            .catch(reason => {
                console.log(reason);
            });
    };

    //================================================
    // hooks
    //================================================
    useEffect(() => {
        readBookings();
    }, []);

    useEffect(() => {
        navigation.setOptions({
            headerBackTitle: ' ',
            title: I18n.t('class'),
            headerRight: () => headerRight(),
        });
        if (bookings) {
            readMembers();
        }
    }, [navigation, bookings]);
    //================================================
    // render
    //================================================
    const headerRight = () => {
        return <ActionButton
            disable={!bookings}
            styles={{marginRight: 10, marginVertical: 4}}
            backgroundColor={myBooking?.status === STATUS.ACTIVE_BOOKING ? baseColor.red : baseColor.secondary}
            onPress={() => handleRightClick()}
            title={I18n.t(myBooking?.status === STATUS.ACTIVE_BOOKING ? 'cancel' : 'to_book')}/>;

    };

    const renderItem = ({item, index}) => {
        console.log('renderItem', item);
        const dateModification = moment(new Date(item.dateModification.seconds * 1000)).format('DD MMM,HH:mm');
        const member = members?.find(m => m.ref.id === item.userRef.id);
        return (
            <View
                style={[StylesGlobal.rowSpace, StylesGlobal.whiteBordered, {marginTop: 10, alignItems: 'flex-start'}]}>
                <Image
                    style={[StylesGlobal.avatar]}
                    source={{uri: member?.photoUrl, cache: 'force-cache'}}/>
                <View>
                    <Text style={[StylesGlobal.textHint, {textAlign: 'right'}]}>{dateModification}</Text>
                    <Text style={[StylesGlobal.text, {textAlign: 'right'}]}>{member?.name}</Text>
                </View>
                {myBooking && <View style={{
                    borderTopLeftRadius: 10,
                    paddingHorizontal: 10,
                    paddingVertical: 5,
                    borderBottomRightRadius: 10,
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    backgroundColor: myBooking?.status === STATUS.ACTIVE_BOOKING ? baseColor.green : myBooking?.status === STATUS.WAITING_CONFIRMATION_BOOKING ? baseColor.sky : baseColor.gray_middle,
                }}>
                    <Text
                        numberOfLines={1}
                        style={{color: baseColor.white}}>{I18n.t(myBooking?.status === STATUS.ACTIVE_BOOKING ? 'booking' : myBooking?.status === STATUS.WAITING_CONFIRMATION_BOOKING ? 'waiting' : 'cancelled_by_member')}</Text>

                </View>}
            </View>
        );
    };

    return (
        <BaseLayout
            isLoading={loading}>
            <View style={[StylesGlobal.rowSpace, {
                marginHorizontal: 20,
                marginTop: 20,
            }]}>
                <TouchableOpacity
                    style={{alignItems: 'center'}}
                    onPress={() => {
                        navigation.navigate('UserDetailsScreen', {user: route.params?.coach});
                    }}
                >
                    {loadingAvatar && <View style={{position: 'absolute'}}>
                        <LoadingSpinner/>
                    </View>}
                    <Image
                        onLoadEnd={handleLoad}
                        onLoad={handleLoad}
                        style={[StylesGlobal.avatar]}
                        source={{uri: route.params?.coach?.photoUrl, cache: 'force-cache'}}/>
                </TouchableOpacity>
                <View>
                    <Text style={[StylesGlobal.textGray, {
                        textAlign: 'right',
                    }]}>{route.params?.location.name}</Text>
                    <Text style={[StylesGlobal.textGray, {marginTop: 10, textAlign: 'right'}]}>{dateStr}</Text>
                    <Text style={[StylesGlobal.textGray, {
                        marginTop: 10,
                        textAlign: 'right',
                    }]}>{route.params?.coach.name}</Text>
                </View>
            </View>
            <Text style={[StylesGlobal.textHint, {textAlign: 'center',letterSpacing:1.5, fontStyle:'italic',  marginTop: 30}]}>{I18n.t('members')}</Text>
            {bookings?.length === 0 && <NoDataView/>}
            <FlatList
                style={{marginHorizontal: 10}}
                data={bookings}
                renderItem={renderItem}/>

        </BaseLayout>
    );
};
