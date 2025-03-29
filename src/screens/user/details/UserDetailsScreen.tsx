import {StackScreenProps} from '@react-navigation/stack';
import {Image, SafeAreaView, ScrollView, Text, TouchableOpacity, useWindowDimensions, View} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {baseColor} from '../../../theme/appTheme';
import React, {useContext, useEffect, useState} from 'react';
import firestore from '@react-native-firebase/firestore';
import {FIELDS, TABLES} from '../../../Const';
import Clipboard from '@react-native-clipboard/clipboard';
import {BookingsPieChart} from "../../../components/statistics/BookingsPieChart";
import Toast from "react-native-toast-message";
import {UserStatView} from "../../../components/statistics/UserStatView";
import {FirestoreContext} from "../../../context/firestoreProvider";
import Styles from "../../cabinet/profile/styles";
import moment from "moment";

interface Props extends StackScreenProps<any, any> {
}

export const UserDetailsScreen = ({route, navigation}: Props) => {
    const firestoreContext = useContext(FirestoreContext);
    const [user, setUser] = useState();
    const [lastBlackListRecord, setLastBlackListRecord] = useState();

    useEffect(() => {
        navigation.setOptions({
            headerShown: true,
            headerBackTitle: ' ',
            headerTitle: user ? user?.name : ' ',
        });
    }, [navigation, user]);

    useEffect(() => {
        firestore().doc(route.params?.user.path ?? route.params?.user.ref.path).get().then(qs => {
            setUser({ref: qs.ref, ...qs.data()});
        });

        const subscribe = firestore().collection(TABLES.BLACK_LIST)
            .where(FIELDS.USER_REF, '==', route.params?.user.ref)
            .orderBy(FIELDS.DATE, 'desc')
            .limit(1)
            .onSnapshot(qs => {
                    if (qs?.docs.length > 0) {
                        const res = qs.docs.map(qds => qds.data());
                        setLastBlackListRecord(res[0]);
                    } else {
                        setLastBlackListRecord(undefined);
                    }
                },
                error => {
                    console.log(error.message);
                })
        ;
        return () => {
            subscribe();
        };

    }, [route.params?.user]);
    const {width} = useWindowDimensions()
    return (
        <SafeAreaView>
            <ScrollView>
                {user?.photoUrl &&
                    <Image
                        style={{
                            width: width,
                            height: width
                        }}
                        source={{uri: user.photoUrl}}/>
                }
                {(firestoreContext.getCityUser()?.someBoolean || firestoreContext.getCityUser()?.trustedDriver) &&
                    <View style={{
                        width: '40%', marginLeft: 10,
                    }}>
                        <TouchableOpacity onPress={() => {
                            Toast.show({
                                type: 'info',
                                position: 'bottom',
                                text1: 'Номер спопирован',
                            });
                            Clipboard.setString(user?.phone);
                        }
                        }>
                            <Text style={{
                                marginTop: 10,
                                color: baseColor.sky,
                                fontSize: 16,
                                fontWeight: '600',
                            }}>{user?.phone}
                            </Text>
                        </TouchableOpacity>
                        <Text
                            style={Styles.text}>{moment(new Date(user?.dateRegistration.seconds * 1000)).format('DD MMM YYYY, HH:mm')}</Text>
                    </View>}
                {lastBlackListRecord && <TouchableOpacity
                    onPress={() => {
                        navigation.navigate('BlackListScreen', {phone: user?.phone});
                    }
                    }>
                    <MaterialCommunityIcons
                        size={30}
                        color={lastBlackListRecord ? (lastBlackListRecord.value === true ? baseColor.black : baseColor.orange) : baseColor.light_gray_1}
                        name={'block-helper'}
                    />
                </TouchableOpacity>}
                <View style={{padding: 10}}>
                    <UserStatView user={user} navigation={navigation}></UserStatView>
                    {route.params?.uid && <BookingsPieChart uid={route.params?.uid}/>}
                </View>
            </ScrollView>
        </SafeAreaView>
    )
        ;
};
export default UserDetailsScreen;
