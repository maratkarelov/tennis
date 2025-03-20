import {StackScreenProps} from '@react-navigation/stack';
import React, {useEffect, useState} from 'react';
import {Keyboard, Text, TextInput, View} from 'react-native';
import auth from '@react-native-firebase/auth';
import Styles from '../styles';
import {useFormik} from 'formik';
import * as yup from 'yup';
import I18n from '../../../locales/i18n';
import ActionButton from '../../../components/ActionButton';
import {baseColor} from '../../../theme/appTheme';
import {BaseLayout} from '../../../components/base/BaseLayout';
import UpdateView from '../../../components/update/UpdateView';

interface Props extends StackScreenProps<any, any> {
}

export const EmailScreen = ({navigation}: Props) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(undefined);

    useEffect(() => {
        navigation.setOptions({
            headerBackTitle: ' ',
        });
    }, [navigation]);

    useEffect(() => {
        navigation.setOptions({
            headerShown: false,
        });
    }, []);

    const handleAuth = () => {
        Keyboard.dismiss();
        setLoading(true);
        auth()
            .signInWithEmailAndPassword(formik.values.email, 'hjdh!-QWE')
            .then(confirmResult => {
                setLoading(false);
            })
            .catch(error => {
                console.log('error', error)
                const data = {
                    email: formik.values.email,
                    newUser: error.code === 'auth/user-not-found',
                };
                navigation.navigate('PasswordScreen', data);
                setLoading(false);
            });
    };

    const validationSchema = yup.object().shape({
        email: yup.string().email(I18n.t('auth.email_not_valid')),
    });

    const formik = useFormik({
        initialValues: {email: ''},
        validationSchema: validationSchema,
        onSubmit: handleAuth,
        onReset: () => {
        },
    });


    return (
        <BaseLayout
            error={error}
            callbackError={() => {
                setError(undefined);
            }}>
            <View style={Styles.container}>
                {/*<Image style={Styles.bg} source={bg} />*/}
                {/*<Image style={Styles.logo} source={Logo} />*/}
                <View style={Styles.phoneInputContainer}>
                    <View style={Styles.inputs}>
                        <Text style={Styles.hint}>{I18n.t('auth.email')}</Text>
                        <TextInput
                            style={Styles.input}
                            inputMode="email"
                            textContentType="emailAddress"
                            keyboardType="email-address"
                            placeholderTextColor={baseColor.gray_hint}
                            autoCapitalize="none"
                            defaultValue={formik.values.email}
                            onChangeText={formik.handleChange('email')}
                            onSubmitEditing={() => Keyboard.dismiss()}
                        />
                        <Text style={Styles.error}>{formik.errors.email ?? ' '}</Text>
                        <View style={Styles.login}>
                            <ActionButton
                                disable={!formik.isValid || !formik.values.email}
                                isLoading={loading}
                                onPress={formik.handleSubmit}
                                title={I18n.t('auth.sign_in')}
                                backgroundColor={baseColor.sky}
                                textColor={baseColor.white}
                            />
                        </View>
                        <UpdateView/>
                    </View>
                </View>
            </View>
        </BaseLayout>
    );
};
