import {Platform, StatusBar, Text, TouchableOpacity, View} from 'react-native';
import React, {useContext, useEffect} from 'react';
import auth from '@react-native-firebase/auth';
import {StackScreenProps} from '@react-navigation/stack';
import {ChatsList} from '../../components/chats/ChatsList';
import {baseColor} from '../../theme/appTheme';
import I18n from '../../locales/i18n';
import {FirestoreContext} from '../../context/firestoreProvider';
import {FIELDS, TABLES} from '../../Const';
import firestore from '@react-native-firebase/firestore';
import {SafeAreaProvider, SafeAreaView} from "react-native-safe-area-context";

interface Props extends StackScreenProps<any, any> {
}

export const MyChatsScreen = ({navigation, route}: Props) => {
    const firestoreContext = useContext(FirestoreContext);

    //================================================
    // hooks
    //================================================

    useEffect(() => {
        navigation.setOptions({
            headerStatusBarHeight: Platform.OS === 'android' ? StatusBar.currentHeight - 20 : undefined,
            headerShown: false,
            headerTitle: ' ',
        });
    }, [navigation]);

    //=================================================================================
    // render
    //=================================================================================

    const markAllAsRead = () => {
        firestore()
            .collection(TABLES.CHATS)
            .where(FIELDS.USER_REF, '==', firestoreContext.getCityUser()?.ref)
            .where(FIELDS.COUNT_UNREAD, '>', 0)
            .get()
            .then(qs => {
                qs.docs.forEach(qds => {
                    qds.ref.update({countUnread: 0});
                });
            })
            .catch(reason => {
                console.log(reason)
            });

    };
    return (
        <SafeAreaView>
            <View style={{flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: 10}}>
                <TouchableOpacity
                    onPress={() => {
                        markAllAsRead();
                    }}
                    style={{padding: 10}}
                >
                    <Text style={{
                        color: baseColor.primary,
                        marginRight: 8,
                        textAlign: 'right',
                    }}>{I18n.t('mark_as_read')}</Text>
                </TouchableOpacity>
            </View>
            {firestoreContext.getCityUser()?.ref &&
                <ChatsList
                    userRef={firestoreContext.getCityUser()?.ref}
                    uid={auth().currentUser?.uid}
                    navigation={navigation}/>}
        </SafeAreaView>
    );
};
export default MyChatsScreen;
