import {BaseLayout} from '../../../components/base/BaseLayout';
import {useContext, useEffect, useState} from 'react';
import {FlatList, Platform, StatusBar, Text, TouchableOpacity, View} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {baseColor} from '../../../theme/appTheme';
import firestore from '@react-native-firebase/firestore';
import {FirestoreContext} from '../../../context/firestoreProvider';
import {FIELDS, TABLES} from '../../../Const';
import ActionButton from '../../../components/ActionButton';
import I18n from '../../../locales/i18n';
import Styles from '../../../theme/styles';

export const MyLocationsScreen = ({navigation}) => {
    const firestoreContext = useContext(FirestoreContext);
    const [items, setItems] = useState();

    function headerRight() {
        return <ActionButton
            styles={{marginRight: 10, height: 30}}
            onPress={() => navigation.navigate('LocationDetailsScreen')}
            title={I18n.t('add')}/>;
    }

    useEffect(() => {
        navigation.setOptions({
            headerShown: true,
            headerBackTitle: ' ',
            headerStatusBarHeight: Platform.OS === 'android' ? StatusBar.currentHeight - 20 : undefined,
            headerTitle: I18n.t('locations'),
            headerRight: () => headerRight(),
        });
        firestore().collection(TABLES.LOCATIONS)
            .where(FIELDS.MANAGER_REF, '==', firestoreContext.getCityUser()?.ref)
            .onSnapshot(qs => {
                setItems(qs.docs.map(qds => {
                    return {ref: qds.ref, ...qds.data()};
                }));
            });
    }, [navigation]);

    const renderItem = (item: any) => {
        return (
            <TouchableOpacity
                onPress={() => navigation.navigate('LocationDetailsScreen', {location: item})}
                style={[Styles.whiteBordered, {
                    margin: 10,
                }]}>
                <View style={Styles.rowSpace}>
                    <MaterialCommunityIcons
                        size={24}
                        color={item.verified ? baseColor.green : baseColor.light_gray_1}
                        name={'shield-check'}/>
                    <Text style={Styles.text}>{item.phone}</Text>
                </View>
                <Text style={Styles.text}>{item.address}</Text>
                <Text style={Styles.text}>{item.name}</Text>
            </TouchableOpacity>
        );

    };
    return (
        <BaseLayout>
            <FlatList data={items} renderItem={item => renderItem(item.item)}/>

        </BaseLayout>

    );
};
