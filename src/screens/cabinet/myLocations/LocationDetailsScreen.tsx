import {BaseLayout} from '../../../components/base/BaseLayout';
import {StackScreenProps} from '@react-navigation/stack';
import {
    FlatList,
    Image,
    Platform,
    ScrollView,
    StatusBar,
    Text,
    TextInput,
    TouchableOpacity,
    useWindowDimensions, View,
} from 'react-native';
import {baseColor} from '../../../theme/appTheme';
import I18n from '../../../locales/i18n';
import React, {useContext, useEffect, useState} from 'react';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {launchImageLibrary} from 'react-native-image-picker';
import storage from '@react-native-firebase/storage';
import {TABLES} from '../../../Const';
import firestore from '@react-native-firebase/firestore';
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
    const [countryRef, setCountryRef] = useState();
    const [regionRef, setRegionRef] = useState();
    const [placeRef, setPlaceRef] = useState();
    const [place, setPlace] = useState();
    const [sports, setSports] = useState();
    const [coaches, setCoaches] = useState();
    const {width} = useWindowDimensions();

    //=================================================================================
    // FUNCTIONS
    //=================================================================================

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
    const openSports = () => {
        navigation.navigate('SportsScreen', {
            multiplySelection: true,
            sports: sports,
            onGoBack: data => {
                setSports(data);
            },
        });
    };


    const handleOpenPlace = () => {
        navigation.navigate('SearchPlaceScreen', {
            onGoBack: data => {
                const placeHierarchy = data.path.split('/' + TABLES.ITEMS);
                const countryPath = placeHierarchy[0];
                if (placeHierarchy.length === 3) {
                    setCountryRef(firestore().doc(countryPath));
                    const regionPath = countryPath + '/' + TABLES.ITEMS + placeHierarchy[1];
                    setRegionRef(firestore().doc(regionPath));
                    setPlaceRef(data.ref);
                } else if (placeHierarchy.length === 2) {
                    setCountryRef(firestore().doc(countryPath));
                    setRegionRef(data.ref);
                    setPlaceRef(undefined);
                } else {
                    setCountryRef(data.ref);
                    setRegionRef(undefined);
                    setPlaceRef(undefined);
                }
                setPlace(data);
            },
        });

    };

    const switchLocation = () => {
        location?.ref.update({active: !location.active}).then(() => navigation.goBack());

    };
    const headerRight = () => {
        return (location && <ActionButton
            styles={{marginRight: 10, height: 30}}
            backgroundColor={baseColor.gray_middle}
            onPress={() => switchLocation()}
            title={I18n.t(location.active ? 'disable' : 'enable')}/>);

    };
    const handleSave = () => {
        let data = {
            phone: phone,
            name: name,
            address: address,
            coordinates: coordinates,
            countryRef: countryRef,
        };
        if (photoUrl) {
            data = {
                photoUrl: photoUrl,
                ...data,
            };
        }
        if (regionRef) {
            data = {
                regionRef: regionRef,
                ...data,
            };
        }
        if (placeRef) {
            data = {
                placeRef: placeRef,
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
            firestore().collection(TABLES.LOCATIONS)
                .add(data)
                .then(() => navigation.goBack());
        } else {
            location?.ref
                .update(data)
                .then(() => navigation.goBack());
        }

    };

    //=================================================================================
    // useEffect
    //=================================================================================

    useEffect(() => {
        navigation.setOptions({
            headerShown: true,
            headerBackTitle: ' ',
            headerStatusBarHeight: Platform.OS === 'android' ? StatusBar.currentHeight - 20 : undefined,
            headerTitle: I18n.t('editing'),
            headerRight: () => headerRight(),
        });
    }, [navigation]);

    //=================================================================================
    // RENDER
    //=================================================================================

    const renderSportItem = ({item, index}) => {
        return (
            <View style={[StylesGlobal.input, {alignItems: 'left'}]}>
                <Text style={StylesGlobal.textHint}>{item.name}</Text>
            </View>
        )

    };
    return (
        <SafeAreaProvider>
            <SafeAreaView style={{justifyContent: 'space-between', flex: 1}}>
                <BaseLayout
                    isLoading={isLoading}>
                    <ScrollView>
                        <View style={[StylesGlobal.rowSpace, {marginTop: 20}]}>
                            <View style={{width: '50%'}}>
                                <Text style={[StylesGlobal.textHint, {marginHorizontal: 10}]}>{I18n.t('phone')}</Text>
                                <TextInput
                                    style={[StylesGlobal.input, {marginHorizontal: 10}]}
                                    value={phone}
                                    onChangeText={(v) => setPhone(v)}
                                />
                            </View>
                            <View style={{width: '50%'}}>
                                <Text style={[StylesGlobal.textHint, {marginHorizontal: 10}]}>{I18n.t('place')}</Text>
                                <TouchableOpacity
                                    onPress={() => {
                                        handleOpenPlace();
                                    }}
                                    style={[StylesGlobal.input, {marginHorizontal: 10, alignItems: 'left'}]}>
                                    <Text style={[StylesGlobal.inputText]}>
                                        {place?.name ?? ' '}
                                    </Text>

                                </TouchableOpacity>
                            </View>
                        </View>
                        <Text style={[StylesGlobal.textHint, {
                            marginHorizontal: 10,
                            marginTop: 20
                        }]}>{I18n.t('name')}</Text>
                        <TextInput
                            style={[StylesGlobal.input, {marginHorizontal: 10}]}
                            value={name}
                            onChangeText={(v) => setName(v)}
                        />
                        <Text style={[StylesGlobal.textHint, {
                            marginHorizontal: 10,
                            marginTop: 20,
                        }]}>{I18n.t('address')}</Text>
                        <TextInput
                            style={[StylesGlobal.input, {marginHorizontal: 10}]}
                            value={address}
                            onChangeText={(v) => setAddress(v)}
                        />
                        <Text style={[StylesGlobal.textHint, {
                            marginHorizontal: 10,
                            marginTop: 20,
                        }]}>{I18n.t('coordinates')}</Text>
                        <TextInput
                            keyboardType={'numeric'}
                            style={[StylesGlobal.input, {marginHorizontal: 10}]}
                            value={coordinates}
                            onChangeText={(v) => setCoordinates(v)}
                        />
                        <View style={[StylesGlobal.rowSpace, {marginTop: 20}]}>
                            <View style={{
                                flex: 1,
                                marginHorizontal: 10
                            }}>
                                <TouchableOpacity
                                    onPress={() => openSports()}
                                    style={[StylesGlobal.rowSpace, StylesGlobal.input]}>
                                    <Text style={[StylesGlobal.text]}>{I18n.t('sport')}</Text>
                                    <MaterialCommunityIcons
                                        name={'chevron-right'}
                                        size={24}
                                        color={baseColor.secondary}
                                    />
                                </TouchableOpacity>
                                <FlatList data={sports} renderItem={renderSportItem}/>
                            </View>
                            <View style={{
                                flex: 1,
                                marginHorizontal: 10
                            }}>
                                <TouchableOpacity
                                    style={[StylesGlobal.rowSpace, StylesGlobal.input]}>
                                    <Text style={[StylesGlobal.text]}>{I18n.t('coaches')}</Text>
                                    <MaterialCommunityIcons
                                        name={'chevron-right'}
                                        size={24}
                                        color={baseColor.secondary}
                                    />
                                </TouchableOpacity>
                            </View>
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
                    </ScrollView>
                </BaseLayout>
                <ActionButton
                    fontSize={18}
                    disable={!name || !phone || !address || !place}
                    styles={{margin: 20}}
                    onPress={() => handleSave()}
                    title={I18n.t('save')}/>
            </SafeAreaView>
        </SafeAreaProvider>

    );
};
