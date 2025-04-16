import {BaseLayout} from '../../components/base/BaseLayout';
import {FlatList, Platform, StatusBar, Text, TouchableOpacity} from 'react-native';
import {useContext, useEffect, useState} from 'react';
import StylesGlobal from '../../theme/styles';
import {FirestoreContext} from '../../context/firestoreProvider';
import I18n from '../../locales/i18n';
import {StackScreenProps} from "@react-navigation/stack/lib/typescript/module/src";

interface Props extends StackScreenProps<any, any> {
}

export const CoachLocationsScreen = ({route, navigation}: Props) => {
    const firestoreContext = useContext(FirestoreContext);
    const [locations, setLocations] = useState();

    useEffect(() => {
        navigation.setOptions({
            headerBackTitle: ' ',
            headerStatusBarHeight: Platform.OS === 'android' ? StatusBar.currentHeight - 20 : undefined,
            headerTitle: I18n.t('select_location'),
        });
    }, [navigation]);

    const readLocations = async () => {
        const list = [];
        for (const locationRef of firestoreContext.getCityUser()?.locations) {
            const location = (await locationRef.get()).data();
            if (location.active) {
                list.push({ref: locationRef, ...location});
            }
        }
        setLocations(list);
    };

    useEffect(() => {
        if (firestoreContext.getCityUser()) {
            readLocations();
        }
    }, [firestoreContext.getCityUser()]);


    const renderItem = ({item, index}) => {
        return (
            <TouchableOpacity
                onPress={() => {
                    route.params?.onGoBack(item);
                    navigation.goBack();
                }}
                style={[StylesGlobal.row, StylesGlobal.whiteBordered]}>
                <Text>{item.name}</Text>
            </TouchableOpacity>
        );
    };

    return (
        <BaseLayout>
            <FlatList
                style={{marginHorizontal: 10, marginTop: 20}}
                data={locations}
                renderItem={renderItem}/>

        </BaseLayout>
    );
};
