import RBSheet from "react-native-raw-bottom-sheet";
import {Linking, Platform, Text, TouchableOpacity, View} from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import StylesGlobal from '../../../theme/styles';
import {baseColor} from "../../../theme/appTheme";

export const LocationInfoSheet = ({ref, location, dismissCallback}) => {
    return (
        <RBSheet
            onClose={dismissCallback}
            ref={ref}
        >
            <View style={{marginHorizontal: 10, marginTop: 10}}>
                <TouchableOpacity
                    onPress={() => {
                        const latLng = location.coordinates.split(',')
                        console.log('latLng', latLng,location.coordinates)
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
                    style={[StylesGlobal.rowSpace, {marginTop: 10}]}
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
                    style={[StylesGlobal.rowSpace, {marginTop: 10}]}
                >
                    <Text style={StylesGlobal.text}>{location.phone}</Text>
                    <MaterialCommunityIcons
                        size={32}
                        color={baseColor.secondary}
                        name={'phone'}
                    />
                </TouchableOpacity>

            </View>
        </RBSheet>
    )
}
