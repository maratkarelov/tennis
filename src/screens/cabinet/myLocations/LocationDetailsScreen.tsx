import {BaseLayout} from '../../../components/base/BaseLayout';
import {StackScreenProps} from '@react-navigation/stack';
import {
    Image,
    Platform,
    ScrollView,
    StatusBar,
    Text,
    TextInput,
    TouchableOpacity,
    useWindowDimensions,
} from 'react-native';
import {baseColor} from '../../../theme/appTheme';
import I18n from '../../../locales/i18n';
import React, {useContext, useEffect, useState} from 'react';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Styles from './styles';
import {launchImageLibrary} from 'react-native-image-picker';
import storage from '@react-native-firebase/storage';
import {TABLES} from '../../../Const';
import firestore from '@react-native-firebase/firestore';
import {useIsFocused} from '@react-navigation/native';
import {FirestoreContext} from '../../../context/firestoreProvider';
import ActionButton from '../../../components/ActionButton';
import StylesGlobal from '../../../theme/styles';
import {SafeAreaProvider, SafeAreaView} from 'react-native-safe-area-context';

interface Props extends StackScreenProps<any, any> {
}

export const LocationDetailsScreen = ({navigation, route}: Props) => {
    const firestoreContext = useContext(FirestoreContext);
    const [isLoading, setIsLoading] = useState(false);
    const location = route.params?.location;
    const [photoUrl, setPhotoUrl] = useState(location?.photoUrl);
    const [phone, setPhone] = useState(location?.phone);
    const [name, setName] = useState(location?.name);
    const [address, setAddress] = useState(location?.address);
    const [coordinates, setCoordinates] = useState(location?.coordinates);
    const [place, setPlace] = useState();
    const {width} = useWindowDimensions();
    const isFocused = useIsFocused();

    const openGallery = async () => {

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
        const upload = storageRef.child(TABLES.USERS).child(firestoreContext.getCityUser()?.ref.id).child(name + address + '.jpg');
        await upload.put(blob);
        await upload.getDownloadURL()
            .then((url) => {
                setIsLoading(false);
                setPhotoUrl(url);
            });
    };

    const handleOpenPlace = () => {
        navigation.navigate('SearchPlaceScreen', {
            onGoBack: data => {
                console.log('data', data);
                setPlace(data);
            },
        });

    };

    const deleteLocation = () => {
        location?.ref.update({active: false}).then(() => navigation.goBack());

    };
    const headerRight = () => {
        return (location && <ActionButton
            styles={{marginRight: 10, height: 30}}
            backgroundColor={baseColor.gray_middle}
            onPress={() => deleteLocation()}
            title={I18n.t('hide')}/>);

    };
    useEffect(() => {
        navigation.setOptions({
            headerShown: true,
            headerBackTitle: ' ',
            headerStatusBarHeight: Platform.OS === 'android' ? StatusBar.currentHeight - 20 : undefined,
            headerTitle: I18n.t('editing'),
            headerRight: () => headerRight(),
        });
    }, [navigation]);

    const handleSave = () => {
        let data = {
            phone: phone,
            name: name,
            address: address,
            coordinates: coordinates,
        };
        if (photoUrl) {
            data = {
                photoUrl: photoUrl,
                ...data,
            };
        }
        if (location === undefined) {
            const dateCreation = new Date();
            data = {
                active: true,
                dateCreation: dateCreation,
                managerRef: firestoreContext.getCityUser()?.ref,
                verified: false,
                ...data,
            };
            firestore().collection(TABLES.LOCATIONS).add(data);

        } else {
            location?.ref
                .update(data)
                .then(() => navigation.goBack());
        }

    };
    return (
        <SafeAreaProvider>
            <SafeAreaView style={{justifyContent: 'space-between', flex: 1}}>
                <BaseLayout
                    isLoading={isLoading}>
                    <ScrollView>
                        <Text style={[Styles.hint, {marginHorizontal: 10}]}>{I18n.t('phone')}</Text>
                        <TextInput
                            style={[Styles.text, {marginHorizontal: 10}]}
                            value={phone}
                            onChangeText={(v) => setPhone(v)}
                        />
                        <Text style={[Styles.hint, {marginHorizontal: 10}]}>{I18n.t('name')}</Text>
                        <TextInput
                            style={[Styles.text, {marginHorizontal: 10}]}
                            value={name}
                            onChangeText={(v) => setName(v)}
                        />
                        <Text style={[Styles.hint, {marginHorizontal: 10}]}>{I18n.t('address')}</Text>
                        <TextInput
                            style={[Styles.text, {marginHorizontal: 10}]}
                            value={address}
                            onChangeText={(v) => setAddress(v)}
                        />
                        <Text style={[Styles.hint, {marginHorizontal: 10}]}>{I18n.t('coordinates')}</Text>
                        <TextInput
                            keyboardType={'numeric'}
                            style={[Styles.text, {marginHorizontal: 10}]}
                            value={coordinates}
                            onChangeText={(v) => setCoordinates(v)}
                        />
                        <Text style={[Styles.hint, {marginHorizontal: 10}]}>{I18n.t('place')}
                        </Text>
                        <TouchableOpacity
                            onPress={() => {
                                handleOpenPlace();
                            }}
                            style={[StylesGlobal.input, {marginHorizontal: 10}]}>
                            <Text style={[StylesGlobal.inputText]}>
                                {place?.name}
                            </Text>

                        </TouchableOpacity>

                        <TouchableOpacity
                            style={{alignItems: 'center', marginTop: 30}}
                            onPress={() => openGallery()}>
                            {photoUrl && <Image
                                width={width}
                                height={width}
                                source={{uri: photoUrl}}/>}
                            {!photoUrl &&
                                <MaterialCommunityIcons
                                    name={'camera-plus'}
                                    size={60}
                                    color={baseColor.light_gray}
                                />}
                        </TouchableOpacity>
                    </ScrollView>
                </BaseLayout>
                <ActionButton styles={{margin: 20}} onPress={() => handleSave()} title={I18n.t('save')}/>
            </SafeAreaView>
        </SafeAreaProvider>

    );
};
