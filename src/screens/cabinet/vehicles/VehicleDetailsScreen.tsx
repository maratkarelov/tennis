import {BaseLayout} from '../../../components/base/BaseLayout';
import {StackScreenProps} from '@react-navigation/stack';
import {Image, Text, TextInput, TouchableOpacity, useWindowDimensions, View} from 'react-native';
import {baseColor} from '../../../theme/appTheme';
import I18n from '../../../locales/i18n';
import React, {useContext, useEffect, useState} from 'react';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Styles from './styles';
import {launchImageLibrary} from 'react-native-image-picker';
import storage from '@react-native-firebase/storage';
import {CONSTANTS, SUPPORT_REGIONS, TABLES} from '../../../Const';
import firestore from '@react-native-firebase/firestore';
import {useIsFocused} from '@react-navigation/native';
import {FirestoreContext} from '../../../context/firestoreProvider';
import ActionButton from '../../../components/ActionButton';

interface Props extends StackScreenProps<any, any> {
}

export const VehicleDetailsScreen = ({navigation, route}: Props) => {
    const firestoreContext = useContext(FirestoreContext);
    const [isLoading, setIsLoading] = useState(false);
    const vehicle = route.params?.vehicle;
    const [photoUrl, setPhotoUrl] = useState(vehicle?.photoUrl);
    const [model, setModel] = useState(vehicle?.model);
    const [regNumber, setRegNumber] = useState(vehicle?.regNumber.substring(3, vehicle?.regNumber.lastIndexOf('_')));
    const [region, setRegion] = useState(vehicle?.regNumber.substring(vehicle?.regNumber.lastIndexOf('_') + 1));
    const [supportRegions, setSupportRegions] = useState(false);
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
        const upload = storageRef.child(TABLES.USERS).child(firestoreContext.getCityUser()?.ref.id).child(model + regNumber + '.jpg');
        await upload.put(blob);
        await upload.getDownloadURL()
            .then((url) => {
                setIsLoading(false);
                setPhotoUrl(url);
            });
    };

    useEffect(() => {
        if (!isFocused && model && regNumber && (supportRegions ? region : true)) {
            let data = {
                model: model,
                regNumber: firestoreContext.getCityUser()?.countryCode + '_' + regNumber + (supportRegions ? ('_' + region) : ''),
            };
            if (vehicle === undefined) {
                const dateCreation = new Date();
                data = {
                    modelOriginal: model,
                    regNumberOriginal: firestoreContext.getCityUser()?.countryCode + '_' + regNumber + (supportRegions ? ('_' + region) : ''),
                    dateCreation: dateCreation,
                    dateRegistration: dateCreation,
                    driverRefOriginal: firestoreContext.getCityUser()?.ref,
                    driverRef: firestoreContext.getCityUser()?.ref,
                    verified: false,
                    ...data,
                };
                if (photoUrl) {
                    data = {
                        photoUrlOriginal: photoUrl,
                        ...data,
                    };
                }
                firestore().collection(TABLES.VEHICLES).add(data);

            } else {
                if (photoUrl) {
                    data = {
                        photoUrl: photoUrl,
                        ...data,
                    };
                }
                if (!vehicle.photoUrl && photoUrl){
                    data = {
                        photoUrlOriginal: photoUrl,
                        ...data,
                    };
                }
                vehicle?.ref
                    .update(data)
                    .then();
            }

        }
    }, [isFocused]);

    const deleteVehicle = () => {
        vehicle?.ref.update({driverRef: null}).then(() => navigation.goBack());

    };
    const headerRight = () => {
        return (vehicle && <ActionButton
            styles={{marginRight: 10, height: 30}}
            backgroundColor={baseColor.gray_middle}
            onPress={() => deleteVehicle()}
            title={I18n.t('delete')}/>);

    };
    useEffect(() => {
        navigation.setOptions({
            headerShown: true,
            headerTitle: I18n.t('editing'),
            headerRight: () => headerRight(),
        });
        firestore().collection(TABLES.ADMINISTRATION).doc(CONSTANTS).get()
            .then(ds => {
                const value = ds.data()[SUPPORT_REGIONS].includes(firestoreContext.getCityUser()?.countryCode ?? '');
                setSupportRegions(value);
            });
    }, [navigation]);

    return (
        <BaseLayout
            isLoading={isLoading}>
            <Text style={[Styles.hint, {marginHorizontal: 10}]}>{I18n.t('vehicle.model')}</Text>
            <TextInput
                style={[Styles.text, {marginHorizontal: 10}]}
                value={model}
                onChangeText={(v) => setModel(v)}
            />
            <View style={{flexDirection: 'row', margin: 10}}>
                <View>
                    <Text style={Styles.hint}>{I18n.t('vehicle.regNumber')}</Text>
                    <TextInput
                        style={Styles.text}
                        value={regNumber}
                        onChangeText={(v) => setRegNumber(v)}
                    />
                </View>
                {supportRegions && <View style={{marginLeft: 20}}>
                    <Text style={[Styles.hint]}>{I18n.t('vehicle.region')}</Text>
                    <TextInput
                        keyboardType={'numeric'}
                        style={Styles.text}
                        value={region}
                        onChangeText={(v) => setRegion(v)}
                    />
                </View>}
            </View>
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
        </BaseLayout>
    );
};
