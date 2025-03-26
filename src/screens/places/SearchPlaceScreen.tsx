import {StackScreenProps} from '@react-navigation/stack';
import {useEffect, useState} from 'react';
import PlacesList from '../../components/places/PlacesList';
import {SafeAreaView, Text, TouchableOpacity, View} from 'react-native';
import StylesGlobal from '../../theme/styles';
import Styles from './styles';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {baseColor} from '../../theme/appTheme';

interface Props extends StackScreenProps<any, any> {
}

export const SearchPlaceScreen = ({route, navigation}: Props) => {
    const [countryCollection, setCountryCollection] = useState();
    const [regionCollection, setRegionCollection] = useState();
    useEffect(() => {
        navigation.setOptions({
            headerShown: false,
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
                        } else {
                            navigation.goBack();
                        }
                    }}
                    style={[StylesGlobal.row, Styles.root]}>
                    <MaterialCommunityIcons
                        size={40}
                        color={countryCollection || regionCollection ? baseColor.secondary : baseColor.black}
                        name={countryCollection || regionCollection ? 'folder-open-outline' : 'chevron-left'}
                    />
                    <Text style={Styles.rootText}>{regionCollection?.name ?? countryCollection?.name}</Text>

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
