import {StackScreenProps} from '@react-navigation/stack';
import React, {useContext, useEffect, useState} from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import I18n from '../../locales/i18n';
import {BackHandler, Linking, PermissionsAndroid, Platform} from 'react-native';
import {BaseLayout} from '../../components/base/BaseLayout';
import {
    ANDROID_CHANNELS,
    APP_MODE,
    DATE_FORMATTERS,
    FIELDS,
    LAST_REVIEW_PROMPT,
    PUSH_MESSAGES,
    STATUS,
    TABLES,
} from '../../Const';
import messaging from '@react-native-firebase/messaging';
import notifee from '@notifee/react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
// import CalendarScreen from '../trips/calendar/CalendarScreen';
import {CabinetScreen} from '../cabinet/CabinetScreen';
import {EmailScreen} from '../auth/email/EmailScreen';
import MyChatsScreen from '../chats/MyChatsScreen';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import {FirestoreContext} from '../../context/firestoreProvider';
import InAppReview from 'react-native-in-app-review';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';
import {useIsFocused} from '@react-navigation/native';
import {baseColor} from "../../theme/appTheme";
import {ClassesLocationsScreen} from "../locations/ClassesLocationsScreen";

const Tab = createBottomTabNavigator();

interface Props extends StackScreenProps<any, any> {
}

export const MainScreen = ({route, navigation}: Props) => {
    const [confirm, setConfirm] = useState(undefined);
    const [confirmYes, setConfirmYes] = useState(undefined);
    const [confirmNo, setConfirmNo] = useState(undefined);
    const [cityUser, setCityUser] = useState();
    const [unreviewedTripRef, setUnreviewedTripRef] = useState();
    const [unreviewedDriver, setUnreviewedDriver] = useState();
    const [appMode, setAppMode] = useState();
    const firestoreContext = useContext(FirestoreContext);
    const isFocused = useIsFocused();
    globalThis.RNFB_SILENCE_MODULAR_DEPRECATION_WARNINGS = true;
    useEffect(() => {
        AsyncStorage.getItem(APP_MODE.MODE).then(mode => {
            setAppMode(mode);
        });

    }, [isFocused]);

    useEffect(() => {
        navigation.setOptions({
            headerBackTitle: ' ',
        });
    }, [navigation]);

    async function requestUserPermission() {
        const authStatus = await messaging().requestPermission({
            criticalAlert: true,
            sound: true,
        });
        return (
            authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
            authStatus === messaging.AuthorizationStatus.PROVISIONAL
        );
    }

    async function configChannels() {
        await messaging().registerDeviceForRemoteMessages();
        await notifee.createChannel({
            id: ANDROID_CHANNELS.BOOKING,
            bypassDnd: true,
            importance: 4,
            visibility: 1,
            name: 'Бронирование',
        });
        await notifee.createChannel({
            id: ANDROID_CHANNELS.MESSAGES,
            name: 'Сообщения',
        });
        return true;
    }

    useEffect(() => {
        requestUserPermission().then(enabled => {
            if (enabled) {
                if (Platform.OS === 'android') {
                    configChannels();
                }
            } else {
                setConfirmYes('yes')
                setConfirmNo('no')
                setConfirm(I18n.t('enable_notification_title'));
            }
        });
        if (Platform.OS === 'android' && Platform.Version >= 33) {
            PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
            ).then(status => {
                if (status === 'granted') {
                    if (Platform.OS === 'android') {
                        configChannels();
                    }
                } else {
                    setConfirmYes('yes')
                    setConfirmNo('no')
                    setConfirm(I18n.t('enable_notification_title'));
                }
            });
        }

        async function onMessageReceivedFore(message: any) {
            Toast.show({
                type: 'success',
                text1: message.data.title === PUSH_MESSAGES.REVIEW_RECEIVED ? I18n.t('review_received') : message.data.title,
                text2: message.data.body,
                visibilityTime: 1000000,
            });
        }

        const subscribeMessages = messaging().onMessage(onMessageReceivedFore);

        const backAction = () => {
            if (navigation.canGoBack()) {
                navigation.goBack();
            } else {
                // RNExitApp.exitApp();
            }
            return true;
        };
        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            backAction,
        );

        const subscribeAuth = auth().onAuthStateChanged(async user => {
            if (user?.isAnonymous) {
                setCityUser(undefined);
                setUnreviewedDriver(undefined);
                setUnreviewedTripRef(undefined);
            } else if (user !== null) {
                firestore().collection(TABLES.USERS).doc(auth().currentUser?.uid).get().then(ds => {
                    const value = {ref: ds.ref, ...ds.data()};
                    setCityUser(value);
                });
            } else {
                setCityUser(undefined);
                setUnreviewedDriver(undefined);
                setUnreviewedTripRef(undefined);
            }
            return true;
        });

        return () => {
            subscribeMessages();
            subscribeAuth();
            backHandler.remove();
        };

    }, []);

    async function checkReviewPrompt() {
        const lastReviewPrompt = await AsyncStorage.getItem(LAST_REVIEW_PROMPT);
        const today = moment(new Date(Date.now())).format(DATE_FORMATTERS.yearMonthDay);
        if (today !== lastReviewPrompt) {
            await AsyncStorage.setItem(LAST_REVIEW_PROMPT, moment(new Date(Date.now())).format(DATE_FORMATTERS.yearMonthDay));
            const monthAgo = new Date();
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            firestore().collection(TABLES.BOOKINGS)
                .where(FIELDS.PASSENGER_REF, '==', cityUser.ref)
                .where(FIELDS.STATUS, '==', STATUS.ACTIVE_BOOKING)
                .where(FIELDS.DATE_DEPARTURE, '>', monthAgo)
                .limit(30)
                .orderBy(FIELDS.DATE_DEPARTURE, 'desc')
                .get()
                .then(qsBookings => {
                    if (!qsBookings.empty) {
                        const tripRefs = qsBookings.docs.map(qds => qds.data().tripRef);
                        firestore().collection(TABLES.REVIEWS)
                            .where(FIELDS.AUTHOR_REF, '==', cityUser.ref)
                            .where(FIELDS.TRIP_REF, 'in', tripRefs)
                            .get()
                            .then(qsReviews => {
                                const reviewedTripRefs = qsReviews.docs.map(qds => qds.data().tripRef);
                                const unreviewedTripRefs = tripRefs.filter(ref => !reviewedTripRefs.map(ref => ref.id).includes(ref.id));
                                if (unreviewedTripRefs.length > 0) {
                                    setUnreviewedTripRef(unreviewedTripRefs[0]);
                                    // console.log('unreviewedTripRefs[0]',unreviewedTripRefs[0])
                                    unreviewedTripRefs[0].get().then(sTrip => {
                                        const trip = sTrip.data();
                                        trip.driverRef.get().then(sDriver => {
                                            setUnreviewedDriver({ref: sDriver.ref, ...sDriver.data()});
                                        });
                                    });
                                }
                            })
                            .catch(reason => {
                                console.log(reason);
                            });
                    }
                })
                .catch(reason => {
                    console.log(reason);
                });
        }
    }

    useEffect(() => {
        firestoreContext.setCityUser(cityUser);
        if (cityUser?.dateRegistration !== undefined) {
            // console.log('cityUser',cityUser.dateRegistration)
            const period = cityUser.lastAppRateDate === undefined ? 1 : 3;
            const periodAgo = new Date();
            periodAgo.setMonth(periodAgo.getMonth() - period);
            const date = cityUser.lastAppRateDate === undefined ? cityUser.dateRegistration : cityUser.lastAppRateDate;
            const time = new Date(date.seconds * 1000).getTime();
            if (time < periodAgo.getTime()) {
                InAppReview.RequestInAppReview()
                    .then((hasFlowFinishedSuccessfully) => {
                        if (hasFlowFinishedSuccessfully) {
                            cityUser.ref.update({lastAppRateDate: new Date()});
                        }
                    })
                    .catch((error) => {
                        console.log(error);
                    });
            } else {
                checkReviewPrompt();
            }
        }
    }, [cityUser]);

    useEffect(() => {
        if (unreviewedTripRef && unreviewedDriver) {
            // console.log('unreviewedTripRef',unreviewedTripRef.id)
            // console.log('unreviewedDriver',unreviewedDriver)
            setConfirm(I18n.t('you_have_unreviewed_trips'));
            setConfirmYes('open_last')
        }
    }, [unreviewedDriver, unreviewedTripRef]);
    // console.log('cityUser?.someBoolean',cityUser?.someBoolean)

    return (
        <BaseLayout
            confirm={confirm}
            confirmYes={confirmYes}
            confirmNo={confirmNo}
            callbackConfirm={result => {
                if (confirm === I18n.t('enable_notification_title') && result) {
                    Linking.openSettings();
                } else if (confirm === I18n.t('you_have_unreviewed_trips') && result) {
                    navigation.navigate('ReviewDetailsScreen', {
                        tripRef: unreviewedTripRef,
                        user: unreviewedDriver,
                    });
                    setUnreviewedDriver(undefined);
                    setUnreviewedTripRef(undefined);
                }
                setConfirm(undefined);
                setConfirmYes(undefined);
                setConfirmNo(undefined);
            }}>
            <Tab.Navigator
                initialRouteName={'ClassesLocationsScreen'}
                screenOptions={{
                    tabBarActiveTintColor: baseColor.green,
                }}
            >
                <Tab.Screen
                    name="ClassesLocationsScreen"
                    component={ClassesLocationsScreen}
                    options={{
                        tabBarLabel: I18n.t('search'),
                        tabBarIcon: ({color}) => (
                            <MaterialCommunityIcons
                                name="map-search-outline"
                                color={color}
                                size={22}
                            />
                        ),
                    }}
                />
                {auth().currentUser && <Tab.Screen
                    name="MyChatsScreen"
                    component={MyChatsScreen}
                    options={{
                        tabBarLabel: I18n.t('chats'),
                        tabBarIcon: ({color}) => (
                            <MaterialCommunityIcons
                                name="message"
                                color={color}
                                size={22}
                            />
                        ),
                    }}

                />}
                {auth().currentUser !== null && <Tab.Screen
                    name="CabinetScreen"
                    component={CabinetScreen}
                    options={{
                        tabBarLabel: I18n.t('cabinet.label'),
                        tabBarIcon: ({color}) => (
                            <MaterialCommunityIcons
                                name="view-dashboard-outline"
                                color={color}
                                size={22}
                            />
                        ),
                    }}
                />}
                {auth().currentUser === null && <Tab.Screen
                    name="EmailScreen"
                    component={EmailScreen}
                    options={{
                        tabBarLabel: I18n.t('auth.title'),
                        tabBarIcon: ({color}) => (
                            <MaterialCommunityIcons
                                name="account-circle"
                                color={color}
                                size={22}
                            />
                        ),
                    }}
                />}
            </Tab.Navigator>
        </BaseLayout>

    );
};
