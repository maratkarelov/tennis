import {FlatList, Image, Text, TextInput, TouchableOpacity, View} from 'react-native';
import React, {useContext, useEffect, useRef, useState} from 'react';
import PhoneInput from 'react-native-phone-input/dist';
import firestore from '@react-native-firebase/firestore';
import {EXTERNAL_USER_ID, FIELDS, TABLES} from '../../Const';
import I18n from '../../locales/i18n';
import {baseColor} from '../../theme/appTheme';
import LoadingSpinner from '../LoadingSpinner';
import Styles from './styles';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import moment from 'moment/moment';
import {BaseLayout} from '../base/BaseLayout';
import {FirestoreContext} from "../../context/firestoreProvider";

export const PhoneSearchUser = ({navigation, foundPhoneCallback, nextInputRef}) => {
    const firestoreContext = useContext(FirestoreContext);
    const [error, setError] = useState(undefined);
    const [isLoading, setLoading] = useState(false);
    const [name, setName] = useState(false);
    const [foundExternalPhone, setFoundExternalPhone] = useState();
    const [foundUsers, setFoundUsers] = useState([]);
    const [searchingExternalPhone, setSearchingExternalPhone] = useState(false);
    const [externalUserName, setExternalUserName] = useState();
    const [phone, setPhone] = useState();
    const [selectedCityUser, setSelectedCityUser] = useState();
    const [lastBlackListRecord, setLastBlackListRecord] = useState();
    const phoneInput = useRef<PhoneInput>(null);
    const nameRef = useRef<TextInput>();
    //================================================
    // hooks
    //================================================
    useEffect(() => {
        if (foundExternalPhone) {
            foundPhoneCallback(foundExternalPhone);
        } else if (selectedCityUser) {
            foundPhoneCallback(selectedCityUser);
        }
    }, [foundExternalPhone, selectedCityUser]);

    const subscribeBlackListState = () => {
        return firestore()
            .collection(TABLES.BLACK_LIST)
            .where(FIELDS.PHONE, '==', phone)
            .limit(1)
            .orderBy(FIELDS.DATE, 'desc')
            .onSnapshot(qs => {
                if (qs?.docs.length > 0) {
                    const res = qs.docs.map(qds => qds.data());
                    setLastBlackListRecord(res[0]);
                } else {
                    setLastBlackListRecord(undefined);
                }
            });

    };
    useEffect(() => {
        if (phone) {
            findExternalPhones();
            findUsersByPhone();
            const subscribe = subscribeBlackListState();
            return () => {
                subscribe();
            };
        }
    }, [phone]);

    useEffect(() => {
        if (foundUsers.length === 1) {
            setSelectedCityUser(foundUsers[0]);
            phoneInput.current.blur();
        }
    }, [foundUsers]);

    //=================================================================================
    // FUNCTIONS
    //=================================================================================

    const findExternalPhones = () => {
        setSearchingExternalPhone(true);
        firestore().collection(TABLES.EXTERNAL_PHONES)
            .where(FIELDS.PHONE, '==', phone)
            .limit(1)
            .get()
            .then(async qs => {
                phoneInput.current.blur();
                if (qs.docs.length === 0) {
                    setSearchingExternalPhone(false);
                    if (nameRef?.current as TextInput) {
                        nameRef.current.focus();
                    }
                } else {
                    const externalPhoneData = qs.docs[0]?.data();
                    const {name, photoUrl} = (await externalPhoneData?.authorRef.get()).data();
                    setName(externalPhoneData?.name);
                    setFoundExternalPhone(
                        {
                            ref: qs.docs[0].ref,
                            author: {ref: externalPhoneData?.authorRef, name, photoUrl},
                            name: externalPhoneData?.name,
                            phone: externalPhoneData?.phone,
                            photoUrl: externalPhoneData?.photoUrl,
                            dateRegistration: externalPhoneData?.dateRegistration,
                        }
                    );
                    setSearchingExternalPhone(false);
                }
            })
            .catch(e => {
                setSearchingExternalPhone(false);
                console.log(e.toString());
            });

    };
    const findUsersByPhone = () => {
        setSearchingExternalPhone(true);
        firestore().collection(TABLES.USERS)
            .where(FIELDS.PHONE, '==', phone)
            .get()
            .then(qs => {
                setFoundUsers(qs.docs.map(qds => {
                    const {blocked, name, photoUrl, phone, dateRegistration} = qds.data();
                    return {ref: qds.ref, blocked, name, photoUrl, phone, dateRegistration};
                }));
            })
            .catch(e => {
                console.log(e.toString());
            });
    };

    const addExternalUser = async () => {
        const externalCityUser = (await firestore().collection(TABLES.USERS)?.doc(EXTERNAL_USER_ID).get()).data();
        const photoUrl = externalCityUser?.photoUrls[Math.floor(Math.random() * externalCityUser?.photoUrls.length)];
        const data = {
            dateRegistration: new Date(),
            name: externalUserName,
            phone: phone,
            authorRef: firestoreContext.getCityUser()?.ref,
            photoUrl: photoUrl,
        };
        firestore().collection(TABLES.EXTERNAL_PHONES)
            .add(data)
            .then(externalPhoneRef => {
                findExternalPhones();
            })
            .catch(e => {
                setLoading(false);
                console.log(e.toString());
            });
    };

    const openChats = () => {
        navigation.navigate('ChatsScreen', {uid: selectedCityUser.ref.id, name: selectedCityUser.name});
    };

//=================================================================================
    // RENDER
//=================================================================================
    const renderOpenChats = () => {
        return <TouchableOpacity
            style={{
                alignSelf: 'center',
                padding: 6,
                marginLeft: 20,
                borderRadius: 10,
                backgroundColor: baseColor.primary,
            }}
            onPress={() => {
                openChats();
            }}>
            <Text
                style={{
                    textAlign: 'center',
                    color: baseColor.white, fontSize: 14,
                }}>
                {I18n.t('chats')}
            </Text>
        </TouchableOpacity>
            ;
    };

    const renderPhoneInput = () => {
        return (
            <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                <PhoneInput
                    style={{
                        width: '60%',
                        borderWidth: 1,
                        alignContent: 'center',
                        paddingHorizontal: 10,
                        paddingVertical: 6,
                        borderRadius: 10,
                        borderColor: phone ? baseColor.light_gray : baseColor.red,
                    }}
                    initialValue={phone}
                    ref={phoneInput}
                    onChangePhoneNumber={(phone) => {
                        setFoundExternalPhone(undefined);
                        setSelectedCityUser(undefined);
                        setFoundUsers([]);
                        foundPhoneCallback(undefined);
                        setSearchingExternalPhone(false);
                        if (phoneInput.current?.isValidNumber(phone)) {
                            setPhone(phone);
                        } else {
                            setPhone(undefined);
                        }
                    }}
                    textStyle={{fontSize: 16, color: baseColor.black}}
                    placeholderTextColor={baseColor.gray_hint}
                    textProps={{
                        placeholder: '+7...', placeholderTextColor:baseColor.gray_hint
                    }}
                />
                {searchingExternalPhone && <LoadingSpinner/>}
                {selectedCityUser && firestoreContext.getCityUser()?.someBoolean && renderOpenChats()}
                {!searchingExternalPhone && phone && !foundExternalPhone && foundUsers.length === 0 &&
                    <Text style={Styles.text_hint}>{I18n.t('user_not_found')}</Text>}
                {!phone && <Text style={Styles.text}>{I18n.t('auth.auth/invalid-phone-number')}</Text>}
            </View>

        );
    };

    const renderBlackListIcon = (phone) => {
        return (
            <TouchableOpacity
                style={{
                    marginRight: 0,
                    backgroundColor: baseColor.white,
                    padding: 5,
                    borderRadius: 25,
                    flexDirection: 'row',
                }}
                onPress={() => {
                    navigation.navigate('BlackListScreen', {phone: phone});
                }}>
                <MaterialCommunityIcons
                    size={30}
                    color={lastBlackListRecord ? (lastBlackListRecord.value === true ? baseColor.black : baseColor.orange) : baseColor.light_gray_1}
                    name={'block-helper'}
                />
            </TouchableOpacity>

        );
    };

    const renderCityUser = (user) => {
        return (
            <TouchableOpacity
                onPress={() => {
                    navigation.navigate('UserDetailsScreen', {user: user});
                }}>
                {foundExternalPhone && <Text style={{marginTop: 0}}>{I18n.t('author')}</Text>}
                {user?.photoUrl && <Image style={Styles.avatar} source={{uri: user.photoUrl}}/>}
                {!user?.photoUrl && <MaterialCommunityIcons
                    size={60}
                    color={baseColor.gray_hint}
                    name={'account-circle'}
                />}
            </TouchableOpacity>);
    };

    function renderFoundExternalPhone() {
        return (
            <View style={Styles.foundPhone}>
                {foundExternalPhone?.photoUrl &&
                    <TouchableOpacity
                        onPress={() => {
                            navigation.navigate('UserDetailsScreen', {user: foundExternalPhone});
                        }}>
                        <Image style={Styles.avatar} source={{uri: foundExternalPhone?.photoUrl}}/></TouchableOpacity>}
                {lastBlackListRecord && renderBlackListIcon(foundExternalPhone.phone)}
                <View>
                    <TextInput
                        style={Styles.commentInput}
                        defaultValue={name}
                        value={name}
                        keyboardType="default"
                        placeholderTextColor={baseColor.gray_hint}
                        returnKeyType={'next'}
                        onChangeText={v => setName(v)}
                        onSubmitEditing={() => {
                            foundExternalPhone.ref.update({name: name});
                        }}
                    />
                    <Text style={Styles.text}>{moment(new Date(foundExternalPhone?.dateRegistration.seconds * 1000)).format('DD MMM YYYY, HH:mm')}</Text>
                </View>
                {renderCityUser(foundExternalPhone.author)}
            </View>
        );
    }


    const renderFoundUser = (user: any) => {
        return (
            <TouchableOpacity
                onPress={() => {
                    setSelectedCityUser(user);
                }}
                style={[Styles.foundPhone, {borderColor: selectedCityUser?.ref?.id === user?.ref?.id ? baseColor.primary : baseColor.white}]}>
                {user?.photoUrl && <Image style={Styles.avatar} source={{uri: user?.photoUrl}}/>}
                <View>
                    {lastBlackListRecord && renderBlackListIcon(user.phone)}
                    {user.blocked && <Text style={{color: baseColor.red}}>{I18n.t('blocked')}</Text>}
                </View>
                <View>
                    <Text style={Styles.text}>{user.name}</Text>
                    <Text style={Styles.text}>{moment(new Date(user.dateRegistration.seconds * 1000)).format('DD MMM YYYY, HH:mm')}</Text>
                </View>
            </TouchableOpacity>);

    };

    const renderInputAddUser = () => {
        return (
            <View style={{flexDirection: 'row', marginTop: 20, justifyContent: 'space-between'}}>
                <TextInput
                    ref={nameRef}
                    placeholderTextColor={baseColor.gray_hint}
                    style={[{
                        width: '60%',
                        color: baseColor.black,
                        padding: 10,
                        backgroundColor: baseColor.white,
                        borderWidth: 1,
                        borderRadius: 10,
                        borderColor: baseColor.gray_hint,
                    }]}
                    placeholder={I18n.t('external_user_name')}
                    keyboardType="default"
                    returnKeyType={'next'}
                    onSubmitEditing={() => {
                        nextInputRef?.current?.focus();
                    }}
                    value={externalUserName}
                    onChangeText={(v) => setExternalUserName(v)}
                />
                <TouchableOpacity
                    style={{
                        alignSelf: 'center',
                        padding: 6,
                        marginLeft: 20,
                        borderRadius: 10,
                        backgroundColor: externalUserName ? baseColor.primary : baseColor.light_gray,
                    }}
                    onPress={() => {
                        if (externalUserName) {
                            addExternalUser();
                        }
                    }}>
                    <Text
                        style={{
                            textAlign: 'center',
                            color: baseColor.white, fontSize: 14,
                        }}>
                        {I18n.t('add')}
                    </Text>
                </TouchableOpacity>
            </View>

        );
    };

    return (
        <BaseLayout
            error={error}
            isLoading={isLoading}
            callbackError={() => setError(undefined)}
        >

            <View style={{marginHorizontal: 10, paddingBottom: 120, justifyContent: 'space-between'}}>
                {renderPhoneInput()}
                {!searchingExternalPhone && phone && !foundExternalPhone && foundUsers.length === 0 && renderInputAddUser()}
                {foundExternalPhone && renderFoundExternalPhone()}
                {foundUsers.length > 0 && <FlatList
                    style={{
                        marginVertical: 10,
                    }}
                    data={foundUsers}
                    renderItem={(item) => renderFoundUser(item.item)}/>}
            </View>

        </BaseLayout>
    );
};
