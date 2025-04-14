import {StackScreenProps} from '@react-navigation/stack';
import {
    Keyboard,
    KeyboardAvoidingView,
    Platform, ScrollView,
    StatusBar,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import {SafeAreaView, SafeAreaProvider} from 'react-native-safe-area-context';

import React, {createRef, useContext, useEffect, useRef, useState} from 'react';
import firestore, {collection, getFirestore, onSnapshot, query} from '@react-native-firebase/firestore';
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
    const [corrId, setCorrId] = useState();
    const [chatId, setChatId] = useState();
    const [chat, setChat] = useState();
    const [sending, setSending] = useState(false);
    const [message, setMessage] = useState();
    const [lastMessage, setLastMessage] = useState();

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
            headerStatusBarHeight: Platform.OS === 'android' ? StatusBar.currentHeight - 20 : undefined,
            headerTitle: route.params?.user?.name,
        });
    }, [navigation]);

    useEffect(() => {
        setCorrId(route.params?.corrId ?? firestoreContext.getCityUser()?.ref.id)
    }, [route.params]);

    useEffect(() => {
        if (corrId) {
            setChatId(getChatId(route.params?.user?.ref?.id, corrId))
        }
    }, [corrId])

    useEffect(() => {
        console.log('useEffect', chatId)
        if (chatId) {
            const subscribeChatUpdates = firestore().collection(TABLES.CHATS).doc(chatId).onSnapshot(s => {
                console.log('chat 1');
                setChat({ref: s.ref, ...s.data()});
            });
            const subscribeMessages = subscribeMessagesUpdates()
            return () => {
                subscribeChatUpdates();
                subscribeMessages();
            };

        }
    }, [chatId])

    useEffect(() => {
        console.log('useEffect lastMessage chat', lastMessage?.text, chat?.lastMessage)
        if (lastMessage && chat) {
            console.log('markChatAsRead');
            console.log('markChatAsRead START');
            if (lastMessage?.userRef.id === firestoreContext.getCityUser()?.ref.id && lastMessage.date.seconds > chat?.lastReadDate?.seconds) {
                const dataChat = {
                    countUnread: 0,
                    lastReadDate: new Date(),
                };
                chat.ref.update(dataChat).then(() => {
                    console.log('markChatAsRead SUCCESS');
                });
            }
        }
    }, [lastMessage, chat]);
    // console.log('lastReadDate', lastReadDate)
    //=================================================================================
    // FUNCTIONS
    //=================================================================================

    const subscribeMessagesUpdates = () => {
        const qLast = gitFilteredQuery().orderBy(FIELDS.DATE, 'desc').limit(1);
        return onSnapshot(
            qLast,
            querySnapshot => {
                console.log('subscribeMessagesUpdates', querySnapshot.size, querySnapshot.empty);
                if (!querySnapshot.empty) {
                    const qds = querySnapshot.docs[0];
                    const data = qds.data()
                    console.log('new mrssage', data.text)
                    setLastMessage({ref: qds.ref, ...data});
                }
            },
            error => {
                console.log(error);
            });
    };

    function gitFilteredQuery() {
        let q = query(collection(getFirestore(), TABLES.MESSAGES));
        q = q.where(FIELDS.ID, '==', chatId);
        return q;
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
                backgroundColor: route.params?.user?.ref?.id === item.authorRef.id ? baseColor.white : baseColor.sky_light,
                borderRadius: 10,
            }]}>
                <Text style={{color: baseColor.black, fontSize: 18}}>{item.text}</Text>
                <View style={{alignItems: 'center', justifyContent: 'flex-end', flexDirection: 'row'}}>
                    {item.userRef.id !== corrId && chat?.lastReadDate?.seconds >= item.date.seconds &&
                        <MaterialCommunityIcons
                            size={24}
                            color={baseColor.sky}
                            name={'check-all'}
                        />}
                    <Text style={{color: baseColor.gray_hint, textAlign: 'right', marginLeft: 10}}>{dateStrFull}</Text>

                </View>
            </View>
        );

    };
    return (
        <SafeAreaProvider>
            <SafeAreaView style={{justifyContent: 'space-between', flex: 1}}>


            {chatId && <PagingLayout
                inverted={true}
                query={gitFilteredQuery()}
                renderItem={item => renderItem(item)}
            />}
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
                        color={message ? baseColor.sky : baseColor.light_gray_2}/>
                </TouchableOpacity>}
            </View>}
            {keyboardStatus &&  <View style={{height: '50%'}}/>}
            </SafeAreaView>
        </SafeAreaProvider>
    );
};

export default MessagesScreen;
