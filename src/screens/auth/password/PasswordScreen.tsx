import {StackScreenProps} from '@react-navigation/stack';
import React, {useContext, useEffect, useState} from 'react';
import {Keyboard, Platform, Text, TextInput, View} from 'react-native';
import Styles from '../styles';
import {useFormik} from 'formik';
import * as yup from 'yup';
import I18n from '../../../locales/i18n';
import ActionButton from '../../../components/ActionButton';
import {baseColor} from '../../../theme/appTheme';
import {BaseLayout} from '../../../components/base/BaseLayout';
import auth from '@react-native-firebase/auth';
import messaging from '@react-native-firebase/messaging';
import {STORAGE_KEYS, TABLES} from '../../../Const';
import firestore from '@react-native-firebase/firestore';
import DeviceCountry from 'react-native-device-country';
import {FirestoreContext} from '../../../context/firestoreProvider';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Props extends StackScreenProps<any, any> {
}

export const PasswordScreen = ({route, navigation}: Props) => {
    const [loading, setLoading] = useState(false);
    const [loadingReset, setLoadingReset] = useState(false);
    const [error, setError] = useState();
    const [invitedby, setInvitedby] = useState(null);
    const [countryCode, setCountryCode] = useState();
    const firestoreContext = useContext(FirestoreContext);
    useEffect(() => {
        DeviceCountry.getCountryCode()
            .then((result) => {
                setCountryCode(result.code.toLowerCase());
                // console.log('countryCode', result);
            })
            .catch((e) => {
                console.log(e);
            });
        navigation.setOptions({
            headerShown: true,
            title: '',
        });
        AsyncStorage.getItem(STORAGE_KEYS.invitedby).then(v=>{
            setInvitedby(v);
        });

    }, []);

    const updatePushTokens = async (userRef) => {
        if (userRef) {
            console.log('userRef', userRef.id);
            const token = await messaging().getToken();
            const tokens = (await userRef.get()).data()?.tokens as [];
            const newTokens = [];
            tokens?.forEach(t => {
                newTokens.push(t);
            });
            console.log('tokens', token);
            const found = tokens?.indexOf(token);
            console.log('found', found, token);
            if (found === undefined || found === -1) {
                newTokens.push(token);
                console.log('newTokens', newTokens);
                const updateData = {tokens: newTokens};
                userRef
                    .update(updateData)
                    .then(() => {
                        setLoading(false);
                        userRef.get().then(ds => {
                            const value = {ref: ds.ref, ...ds.data()};
                            firestoreContext.setCityUser(value);
                        });
                        navigation.navigate('MainScreen', {email: route.params?.email});
                    })
                    .catch(e => {
                        console.log('newTokens', e);
                    });
            } else {
                setLoading(false);
                navigation.navigate('MainScreen', {email: route.params?.email});
            }
        }
    };

    const handlePassword = () => {
        console.log('route.params?.email, formik.values.password',route.params?.newUser, route.params?.email, formik.values.password)
        setLoading(true);
        if (route.params?.newUser) {
            auth()
                .createUserWithEmailAndPassword(route.params?.email, formik.values.password)
                .then((userCred) => {
                    // console.log('userCred.user.uid', userCred.user.uid);
                    const userRef = firestore().collection(TABLES.USERS).doc(userCred.user.uid);
                    const data = {
                        os: Platform.OS,
                        name: userCred.user.displayName,
                        email: userCred.user.email,
                        dateRegistration: new Date(),
                        countryCode: countryCode,
                        invitedby: invitedby,
                    };
                    userRef.set(data)
                        .then(() => {
                            updatePushTokens(userRef);
                        })
                        .catch(reason => {
                            console.log(reason);
                        });
                })
                .catch(error => {
                    setError(I18n.t('auth.' + error.code));
                    console.log('error',error)
                    setLoading(false);
                });

        } else {
            auth()
                .signInWithEmailAndPassword(route.params?.email, formik.values.password)
                .then(() => {
                    const userRef = firestore().collection(TABLES.USERS).doc(auth().currentUser?.uid);
                    updatePushTokens(userRef);
                })
                .catch(error => {
                    setError(I18n.t('auth.' + error.code));
                    setLoading(false);
                });
        }
    };
    const validationSchema = yup.object().shape({
        password: yup.string().test('len', I18n.t('auth.password_length'), val => {
            return val?.length > 5;
        }),
    });

    const formik = useFormik({
        initialValues: {password: ''},
        validationSchema: validationSchema,
        onSubmit: handlePassword,
        onReset: () => {
        },
    });

    function handleResetPassword() {
        setLoadingReset(true);
        auth().sendPasswordResetEmail(route.params?.email)
            .then(res => {
                setLoadingReset(false);
                setError(I18n.t('auth.reset_password_send_to_email') + ' ' + route.params?.email);
            });
    }

    return (
        <BaseLayout
            isLoading={loading}
            error={error}
            callbackError={() => {
                setError(undefined);
            }}>
            <View style={Styles.container}>
                <View style={Styles.phoneInputContainer}>
                    <View style={Styles.inputs}>
                        <Text
                            style={Styles.hint}>{I18n.t(route.params?.newUser ? 'auth.create_password_hint' : 'auth.enter_password_hint')}<Text
                            style={Styles.email}>{route.params?.email}</Text></Text>
                        <TextInput
                            style={Styles.input}
                            placeholderTextColor={baseColor.gray_hint}
                            defaultValue={formik.values.password}
                            onChangeText={formik.handleChange('password')}
                            onSubmitEditing={() => Keyboard.dismiss()}
                        />
                        <Text style={Styles.error}>{formik.errors.password ?? ' '}</Text>
                        <View style={Styles.login}>
                            <ActionButton
                                disable={!formik.isValid || !formik.values.password}
                                isLoading={loading}
                                onPress={formik.handleSubmit}
                                title={I18n.t('auth.sign_in')}
                                backgroundColor={baseColor.primary}
                                textColor={baseColor.white}
                            />
                        </View>
                        {!route.params?.newUser && <View style={Styles.login}>
                            <ActionButton
                                isLoading={loadingReset}
                                onPress={() => handleResetPassword()}
                                title={I18n.t('auth.forgot_password')}
                                backgroundColor={baseColor.light_gray_2}
                                textColor={baseColor.black}
                            />
                        </View>}
                    </View>
                </View>
            </View>
        </BaseLayout>
    );
};
