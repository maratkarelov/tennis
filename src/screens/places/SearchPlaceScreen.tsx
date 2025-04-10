import {StackScreenProps} from '@react-navigation/stack';
import {useEffect, useState} from 'react';
import PlacesList from '../../components/places/PlacesList';
import {Platform, SafeAreaView, StatusBar, Text, TouchableOpacity, View} from 'react-native';
import StylesGlobal from '../../theme/styles';
import Styles from './styles';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {baseColor} from '../../theme/appTheme';
import {BaseLayout} from "../../components/base/BaseLayout";
import I18n from "../../locales/i18n";

interface Props extends StackScreenProps<any, any> {
}

export const SearchPlaceScreen = ({route, navigation}: Props) => {
    const [countryCollection, setCountryCollection] = useState();
    const [regionCollection, setRegionCollection] = useState();
    useEffect(() => {
        navigation.setOptions({
            headerShown: true,
            headerTopInsetEnabled: false,
            headerStatusBarHeight: Platform.OS === 'android' ? StatusBar.currentHeight - 20 : undefined,
            headerBackTitle: ' ',
            title: ' ',
        });
    }, [navigation]);
    return (
        <SafeAreaView>
            <View>
                <TouchableOpacity
                    onPress={() => {
                        if (regionCollection) {
                            setRegionCollection(undefined);
                        } else if (countryCollection) {
                            setCountryCollection(undefined);
                        }
                    }}
                    style={[StylesGlobal.row, Styles.root, {alignItems:'center'}]}>
                    <MaterialCommunityIcons
                        size={40}
                        color={countryCollection ? baseColor.secondary : baseColor.transparent}
                        name={'folder-open-outline'}
                    />
                    <Text
                        style={[Styles.rootText, {color: countryCollection ? baseColor.secondary : baseColor.gray_middle}]}>{regionCollection?.name ?? countryCollection?.name ?? I18n.t('expand_select_places')}</Text>

                </TouchableOpacity>
                <PlacesList
                    selectedCollection={regionCollection ?? countryCollection}
                    expandCollectionCallback={(place) => {
                        if (countryCollection === undefined) {
                            setCountryCollection(place);
                        } else if (regionCollection === undefined) {
                            setRegionCollection(place);
                        }
                    }}
                    selectedPlaceCallback={(place) => {
                        route.params?.onGoBack(place);
                        navigation.goBack();
                    }}/>
            </View>
        </SafeAreaView>
    );
};

export default SearchPlaceScreen;
