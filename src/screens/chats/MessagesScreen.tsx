import {StackScreenProps} from '@react-navigation/stack';
import {Keyboard, Platform, SafeAreaView, Text, TextInput, TouchableOpacity, View} from 'react-native';
import React, {useContext, useEffect, useState} from 'react';
import firestore from '@react-native-firebase/firestore';
import {FIELDS, TABLES} from '../../Const';
import {baseColor} from '../../theme/appTheme';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Styles from './styles';
import I18n from '../../locales/i18n';
import {getChatId} from '../../tools/common';
import moment from 'moment/moment';
import LoadingSpinner from '../../components/LoadingSpinner';
import {PagingLayout} from '../../components/base/PagingLayout';
import {FirestoreContext} from '../../context/firestoreProvider';

interface Props extends StackScreenProps<any, any> {
}

export const MessagesScreen = ({route, navigation}: Props) => {
    // const myUid = auth().currentUser?.uid;
    // const authorRef = firestore().collection(TABLES.USERS).doc(myUid);
    const firestoreContext = useContext(FirestoreContext);
    const corrId = route.params?.corrId ?? firestoreContext.getCityUser()?.ref.id;
    const chatId = getChatId(route.params?.user?.ref?.id, corrId);
    const [lastReadDate, setLastReadDate] = useState();
    const [sending, setSending] = useState(false);
    const [message, setMessage] = useState();

    const [keyboardStatus, setKeyboardStatus] = useState(false);

    //================================================
    // hooks
    //================================================

    useEffect(() => {
        const showSubscription = Keyboard.addListener('keyboardDidShow', () => {
            setKeyboardStatus(true);
        });
        const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
            setKeyboardStatus(false);
        });

        return () => {
            showSubscription.remove();
            hideSubscription.remove();
        };
    }, []);

    useEffect(() => {
        navigation.setOptions({
            headerShown: true,
            headerBackTitle: ' ',
            headerTitle: route.params?.user?.name,
        });
    }, [navigation]);

    useEffect(() => {
        if (route.params?.user) {
            markChatAsRead();
        }
        firestore().collection(TABLES.CHATS).doc(chatId).onSnapshot(s => {
            const chat = s.data();
            setLastReadDate(chat?.lastReadDate);
        });
    }, [route.params?.user]);
    // console.log('lastReadDate', lastReadDate)
    //=================================================================================
    // FUNCTIONS
    //=================================================================================
    function markChatAsRead() {
        if (route.params?.corrId === firestoreContext.getCityUser()?.ref.id) {
            const chatRef = firestore().collection(TABLES.CHATS).doc(chatId);
            chatRef.get().then(ds => {
                    const chat = ds.data();
                    if (chat?.authorRef.id !== firestoreContext.getCityUser()?.ref.id) {
                        const dataChat = {
                            countUnread: 0,
                            lastReadDate: new Date(),
                        };
                        firestore().collection(TABLES.CHATS).doc(chatId).update(dataChat).then(ref => {
                        });
                    }
                }
            );
        }
    }

    function gitFilteredQuery() {
        return firestore()
            .collection(TABLES.MESSAGES)
            .where(FIELDS.ID, '==', chatId);
    }

    const sendNewMessage = () => {
        setSending(true);
        const dataMessage = {
            authorRef: firestoreContext.getCityUser()?.ref,
            userRef: route.params?.user?.ref,
            text: message,
            date: new Date(),
            id: chatId,
            sendNotificationOnMessage: true,
        };
        firestore().collection(TABLES.MESSAGES)
            .add(dataMessage)
            .then(ref => {
                setMessage(undefined);
                setSending(false);
            })
            .catch(reason => {
                console.log(reason.toString());
            });
        const chatRef = firestore().collection(TABLES.CHATS).doc(chatId);
        let dataChat = {
            authorRef: firestoreContext.getCityUser()?.ref,
            userRef: route.params?.user?.ref,
            lastMessage: message,
            date: new Date(),
            chat_members: [firestoreContext.getCityUser()?.ref.id, route.params?.user?.ref.id],
        };
        chatRef.get().then(ds => {
                const chat = ds.data();
                let countUnread = 1;
                if (chat?.authorRef.id === firestoreContext.getCityUser()?.ref.id) {
                    countUnread = chat?.countUnread + 1;
                }
                dataChat = {
                    ...dataChat,
                    countUnread: countUnread,
                };
                firestore().collection(TABLES.CHATS).doc(chatId).update(dataChat).then(ref => {
                });
            }
        );
    };

    //================================================
    // render UI
    //================================================
    // console.log('route.params',route.params)
    const renderItem = (item) => {
        const dateStrFull = moment(new Date(item?.date.seconds * 1000)).format('DD MMM HH:mm');
        return (
            <View style={[Styles.shadowProp, {
                marginVertical: 6,
                padding: 10,
                marginHorizontal: 10,
                backgroundColor: route.params?.user?.ref?.id === item.authorRef.id ? baseColor.white : baseColor.primary_light,
                borderRadius: 10,
            }]}>
                <Text style={{color: baseColor.black, fontSize: 18}}>{item.text}</Text>
                <View style={{alignItems: 'center', justifyContent: 'flex-end', flexDirection: 'row'}}>
                    {item.userRef.id !== corrId && lastReadDate?.seconds >= item.date.seconds && <MaterialCommunityIcons
                        size={24}
                        color={baseColor.primary}
                        name={'check-all'}
                    />}
                    <Text style={{color: baseColor.gray_hint, textAlign: 'right', marginLeft: 10}}>{dateStrFull}</Text>

                </View>
            </View>
        );

    };
    return (
        <SafeAreaView style={{justifyContent: 'space-between', flex: 1}}>

            <PagingLayout
                inverted={true}
                query={gitFilteredQuery()}
                renderItem={item => renderItem(item)}
            />
            {route.params?.corrId === firestoreContext.getCityUser()?.ref.id && <View style={{
                flexDirection: 'row',
                alignItems: 'bottom',
                justifyContent: 'space-between',
                paddingTop: 10,
                padding: 10,
                backgroundColor: baseColor.white,
                borderTopWidth: 1, borderTopColor: baseColor.light_gray_1,
            }}>
                <TextInput
                    style={{
                        flex: 1, paddingVertical: 5, fontSize: 18, color: baseColor.black,
                    }}
                    value={message}
                    multiline={true}
                    placeholderTextColor={baseColor.gray_hint}
                    placeholder={I18n.t('type_message')}
                    onChangeText={v => setMessage(v)}/>
                {sending && <LoadingSpinner/>}
                {!sending && <TouchableOpacity onPress={() => sendNewMessage()}>
                    <MaterialCommunityIcons
                        name={'send'}
                        size={30}
                        color={message ? baseColor.primary : baseColor.light_gray_2}/>
                </TouchableOpacity>}
            </View>}
            {keyboardStatus && Platform.OS === 'ios' && <View style={{height: '50%'}}/>}
        </SafeAreaView>
    );
};

export default MessagesScreen;
