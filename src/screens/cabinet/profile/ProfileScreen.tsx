import {BaseLayout} from '../../../components/base/BaseLayout';
import {StackScreenProps} from '@react-navigation/stack';
import {Platform, ScrollView, StatusBar, Text, TextInput, TouchableOpacity, View} from 'react-native';
import Styles from './styles';
import auth from '@react-native-firebase/auth';
import React, {useContext, useEffect, useRef, useState} from 'react';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {baseColor} from '../../../theme/appTheme';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import {FIELDS, STATUS, supportId, TABLES} from '../../../Const';
import I18n from '../../../locales/i18n';
import ActionButton from '../../../components/ActionButton';
import {FirestoreContext} from '../../../context/firestoreProvider';
import Toast from 'react-native-toast-message';
import PhoneInput from 'react-native-phone-input/dist';
import {useIsFocused} from '@react-navigation/native';
import {launchImageLibrary} from 'react-native-image-picker';
import {UserStatView} from '../../../components/statistics/UserStatView';
import {BookingsPieChart} from '../../../components/statistics/BookingsPieChart';
import moment from 'moment/moment';
import {UserImageView} from '../../../components/userImage/UserImageView';

interface Props extends StackScreenProps<any, any> {
}

export const ProfileScreen = ({navigation, route}: Props) => {
    const [isLoading, setIsLoading] = useState(false);
    const [wantToDeleteAccount, setWantToDeleteAccount] = useState(false);
    const [emailToDeleteAccount, setEmailToDeleteAccount] = useState();
    // console.log('emailToDeleteAccount', wantToDeleteAccount, emailToDeleteAccount)
    const [confirm, setConfirm] = useState();
    const [confirmYes, setConfirmYes] = useState();
    // console.log('avatarSize', avatarSize, new Date().toLocaleString())
    const [name, setName] = useState();
    const [phoneIsFree, setPhoneIsFree] = useState(false);
    const [phone, setPhone] = useState();

    const phoneInput = useRef<PhoneInput>(null);
    const [user, setUser] = useState();
    const [supportUser, setSupportUser] = useState(false);
    const firestoreContext = useContext(FirestoreContext);
    const isFocused = useIsFocused();
    // console.log('user',user)

    //================================================
    // functions
    //================================================

    const pickImage = async () => {
        let options = {
            mediaType: 'photo',
            quality: 0.5,
        };
        const result = await launchImageLibrary(options);
        const image = {uri: result.assets[0].uri};
        uploadImage(image);
    };

    const uploadImage = async (image) => {
        setIsLoading(true);
        const response = await fetch(image.uri);
        const blob = await response.blob();
        const storageRef = storage().ref();
        const upload = storageRef.child(TABLES.USERS).child(user.ref.id + '.jpg');
        console.log('upload',upload)
        await upload.put(blob);
        await upload.getDownloadURL()
            .then((photoUrl) => {
                setIsLoading(false);
                user.photoUrl = photoUrl;
                const newUser = {...user};
                setUser(newUser);
                firestoreContext.setCityUser(newUser);
                user.ref
                    .update({photoUrl: photoUrl})
                    .then();
            })
            .catch(reason => {
                console.log('error',reason)});
    };

    const deleteAccount = () => {
        setIsLoading(true);
        auth().currentUser?.delete()
            .then(() => {
                firestoreContext.setCityUser(undefined);
                navigation.goBack();
            })
            .catch((error) => {
                setConfirm(I18n.t(error.code));
                console.log('error',error);
                // An error happened.
            })
            .finally(() => setIsLoading(false));

    };

    const checkIsFreeNumber = () => {
        firestore().collection(TABLES.USERS)
            .where(FIELDS.PHONE, '==', phone)
            .where(firestore.FieldPath.documentId(), '!=', user.ref.id)
            .get()
            .then(qs => {
                setPhoneIsFree(qs.empty);
                if (!qs.empty) {
                    setPhone(user.phone);
                    setConfirm(I18n.t('profile.phone_is_used'));
                    setConfirmYes('cabinet.open_support_chat');
                }
            });
    };

    //================================================
    // hooks
    //================================================

    useEffect(() => {
        if (!isFocused && user) {
            const data = {};
            if (user.phone !== phone && phoneIsFree) {
                data[FIELDS.PHONE] = phone;
                user.phone = phone;
            }
            if (user.name !== name) {
                data[FIELDS.NAME] = name;
                user.name = name;
            }
            user.ref.update(data).then(() => {
                firestoreContext.setCityUser(user);
            });
        }
    }, [isFocused, user, phone, phoneIsFree, name]);

    useEffect(() => {
        firestore().collection(TABLES.USERS).doc(supportId).get().then(ds => {
            setSupportUser({ref: ds.ref, ...ds.data()});
        });
        setUser(firestoreContext.getCityUser());
        setPhone(firestoreContext.getCityUser()?.phone);
        setName(firestoreContext.getCityUser()?.name);

    }, []);
    useEffect(() => {
        if (user && phone) {
            phoneInput.current.setValue(phone);
            checkIsFreeNumber();
        }
    }, [phone, user]);

    useEffect(() => {
        navigation.setOptions({
            headerShown: true,
            headerBackTitle: ' ',
            headerStatusBarHeight: Platform.OS === 'android' ? StatusBar.currentHeight - 20 : undefined,
            headerTitle: I18n.t('profile.label'),
            headerRight: () => headerRight(),
        });
    }, [navigation, wantToDeleteAccount, emailToDeleteAccount]);

    //================================================
    // render UI
    //================================================

    const renderNameInput = () => {
        return (
            <TextInput
                style={{
                    color: baseColor.black,
                    width: '100%',
                    borderColor: baseColor.light_gray_1,
                    borderWidth: 1,
                    borderRadius: 10,
                    textAlign: 'right',
                    padding: 4,
                    fontSize: 16,
                }}
                value={name}
                onChangeText={(v) => setName(v)}
                placeholderTextColor={baseColor.light_gray_1}
                placeholder={I18n.t('profile.name')}/>
        );
    };

    function renderPhoneInput() {
        return (
            <PhoneInput
                style={{
                    marginTop: 5,
                    borderWidth: 1,
                    paddingHorizontal: 10,
                    paddingVertical: 6,
                    borderRadius: 10,
                    borderColor: phone ? baseColor.light_gray_1 : baseColor.red,
                }}
                initialValue={phone}
                ref={phoneInput}
                onChangePhoneNumber={(phone) => {
                    if (phoneInput.current?.isValidNumber(phone)) {
                        setPhone(phone);
                    } else {
                        setPhone(undefined);
                    }
                }}
                textStyle={{
                    fontSize: 16, textAlign: 'right', color: baseColor.black,
                }}
                placeholderTextColor={baseColor.gray_hint}
                textProps={{
                    placeholder: '+380...', placeholderTextColor: baseColor.gray_hint,
                }}
            />

        );
    }

    function renderConfirmEmailToDelete() {
        return <>
            {wantToDeleteAccount && <View style={{
                marginHorizontal: 10,
                marginTop: 20,
            }}>
                <Text style={{color: baseColor.red, fontSize: 16}}>{I18n.t('profile.delete_account_confirm')}</Text>
                <TextInput
                    autoCapitalize="none"
                    value={emailToDeleteAccount}
                    onChangeText={(v) => setEmailToDeleteAccount(v)}
                    style={{
                        borderColor: baseColor.red,
                        borderWidth: 1,
                        color: baseColor.black,
                        borderRadius: 4,
                        marginTop: 4,
                        padding: 4,
                        fontSize: 16,
                    }}
                    placeholderTextColor={baseColor.gray_hint}
                    placeholder={I18n.t('auth.email')}/>
            </View>}
        </>;
    }

    const headerRight = () => {
        return <ActionButton
            fontSize={12}
            styles={{marginRight: 10, height: 30}}
            backgroundColor={baseColor.gray_middle}
            onPress={() => {
                if (wantToDeleteAccount) {
                    if (emailToDeleteAccount === auth().currentUser?.email) {
                        setConfirm(I18n.t('profile.delete_account_warning'));
                        setConfirmYes('profile.delete_account');
                    } else {
                        Toast.show({
                            type: 'error',
                            text1: I18n.t('profile.delete_account_wrong_email'),
                            text1Style: {fontSize: 12, fontWeight: '400'},
                            visibilityTime: 5000,
                        });
                    }
                } else {
                    setConfirm(I18n.t('profile.delete_account_question'));
                    setConfirmYes('profile.delete_account');
                }
            }}
            title={I18n.t('profile.delete_account')}/>;
    };

    const renderAddImage = () => {
        return (
            <TouchableOpacity
                onPress={() => pickImage()}
                style={{position: 'absolute', bottom: 0, left: 10}}>
                <MaterialCommunityIcons
                    size={32}
                    color={baseColor.light_gray}
                    name={'image-plus'}
                />
            </TouchableOpacity>
        );
    };

    return (
        <BaseLayout
            isLoading={isLoading}
            confirm={confirm}
            confirmYes={confirmYes}
            confirmNo={'close'}
            callbackConfirm={(res) => {
                setConfirm(undefined);
                if (res) {
                    if (confirmYes === 'profile.delete_account') {
                        if (emailToDeleteAccount === auth().currentUser?.email) {
                            deleteAccount();
                        } else {
                            setWantToDeleteAccount(true);
                        }
                    } else if (confirmYes === 'cabinet.open_support_chat') {
                        navigation.navigate('MessagesScreen', {user: supportUser, corrId: user.ref.id});
                    }
                }
                setConfirmYes(undefined);
            }}
        >
            <ScrollView style={[Styles.container]}>
                <Text style={Styles.hint}>{I18n.t('profile.about_me')}</Text>
                <View style={[Styles.row, {margin: 10}]}>
                    <UserImageView photoUrl={user?.photoUrl} isMyProfile={true}/>
                    {renderAddImage()}
                    <View
                        style={{
                            width: '60%',
                            marginRight: 10,
                            alignItems: 'flex-end',
                            justifyContent: 'space-evenly',
                            paddingVertical: 10
                        }}>
                        {renderNameInput()}
                        {renderPhoneInput()}
                        <Text style={Styles.textBlue}>{auth().currentUser?.email}</Text>
                        <Text
                            style={Styles.textBlue}>{moment(new Date(user?.dateRegistration.seconds * 1000)).format('DD MMM YYYY, HH:mm')}</Text>
                    </View>
                </View>
                <View style={{padding: 10}}>
                    {renderConfirmEmailToDelete()}
                    <UserStatView user={user} navigation={navigation}/>
                    <TouchableOpacity
                        onPress={() => {
                            navigation.navigate('MyLocationsScreen');
                        }}
                        style={[Styles.row, {padding: 10, marginTop: 20, alignItems: 'center'}]}>
                        <MaterialCommunityIcons
                            size={40}
                            color={baseColor.primary}
                            name={'map-marker-multiple-outline'}
                        />
                        <Text style={{color: baseColor.gray_middle, fontSize: 16}}>{I18n.t('locations')}</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>


        </BaseLayout>
    );
};

export default ProfileScreen;
