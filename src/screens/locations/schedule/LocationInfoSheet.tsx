import RBSheet from "react-native-raw-bottom-sheet";
import {Image, Linking, Platform, Text, TouchableOpacity, useWindowDimensions, View} from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import StylesGlobal from '../../../theme/styles';
import {baseColor} from "../../../theme/appTheme";
import I18n from "../../../locales/i18n";
import React from "react";

export const LocationInfoSheet = ({ref, location, dismissCallback, navigation, corrId}) => {
    const {width} = useWindowDimensions();
    return (
        <RBSheet
            height={width * (location.photoUrl ? 1.7 : 0.75)}
            onClose={dismissCallback}
            ref={ref}
        >
            <View>
                {location.photoUrl && <Image
                    width={width}
                    height={width}
                    source={{uri: location.photoUrl}}/>}
                <TouchableOpacity
                    onPress={() => {
                        const latLng = location.coordinates.split(',')
                        console.log('latLng', latLng, location.coordinates)
                        if (latLng?.length === 2) {
                            const lat = latLng[0]
                            const lng = latLng[1]
                            const scheme = Platform.select({
                                ios: `maps://?q=${location.name}&ll=${lat},${lng}`,
                                android: `geo:${lat},${lng}?q=${lat},${lng}(${location.name})`,
                            });
                            if (scheme) {
                                Linking.openURL(scheme).catch(err =>
                                    console.error('Error opening map: ', err),
                                );
                            }
                        }
                    }}
                    style={[StylesGlobal.rowSpace, {margin: 10}]}
                >
                    <Text style={StylesGlobal.text}>{location.address}</Text>
                    <MaterialCommunityIcons
                        size={32}
                        color={baseColor.secondary}
                        name={'map-search-outline'}
                    />
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => {
                        Linking.openURL(`tel:${location.phone}`);
                    }}
                    style={[StylesGlobal.rowSpace, {marginHorizontal: 10}]}
                >
                    <Text style={StylesGlobal.text}>{location.phone}</Text>
                    <MaterialCommunityIcons
                        size={32}
                        color={baseColor.secondary}
                        name={'phone'}
                    />
                </TouchableOpacity>

                <Text
                    style={[StylesGlobal.textHint, {
                        marginTop: 20,
                        marginHorizontal: 10
                    }]}>{I18n.t('job_complain')}
                </Text>
                <TouchableOpacity
                    onPress={() => {
                        location.managerRef.get().then(ds => {
                            navigation.navigate('MessagesScreen', {
                                user: {ref: ds.ref, ...ds.data()},
                                corrId: corrId
                            });
                            dismissCallback()
                        })
                    }}
                    style={[StylesGlobal.rowSpace, {marginHorizontal: 10}]}
                >
                    <Text style={StylesGlobal.text}>{I18n.t('contact_us')}</Text>
                    <MaterialCommunityIcons
                        size={32}
                        color={baseColor.secondary}
                        name={'send'}
                    />
                </TouchableOpacity>

            </View>
        </RBSheet>
    )
}
