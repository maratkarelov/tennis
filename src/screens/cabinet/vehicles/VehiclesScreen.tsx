import {BaseLayout} from '../../../components/base/BaseLayout';
import {useContext, useEffect, useState} from 'react';
import {FlatList, Text, TouchableOpacity, View} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {baseColor} from '../../../theme/appTheme';
import firestore from '@react-native-firebase/firestore';
import {FirestoreContext} from '../../../context/firestoreProvider';
import {FIELDS, TABLES} from '../../../Const';
import ActionButton from '../../../components/ActionButton';
import I18n from '../../../locales/i18n';
import Styles from "./styles";

export const VehiclesScreen = ({navigation}) => {
    const firestoreContext = useContext(FirestoreContext);
    const [vehicles, setVehicles] = useState();

    function headerRight() {
        return <ActionButton
            styles={{marginRight: 10, height: 30}}
            onPress={() => navigation.navigate('VehicleDetailsScreen')}
            title={I18n.t('add')}/>;
    }

    useEffect(() => {
        navigation.setOptions({
            headerShown: true,
            headerTitle: I18n.t('vehicle.label'),
            headerRight: () => headerRight(),
        });
        firestore().collection(TABLES.VEHICLES)
            .where(FIELDS.DRIVER_REF, '==', firestoreContext.getCityUser()?.ref)
            .onSnapshot(qs => {
                setVehicles(qs.docs.map(qds => {
                    return {ref: qds.ref, ...qds.data()};
                }));
            });
    }, [navigation]);

    const renderItem = (item: any) => {
        return (
            <TouchableOpacity
                onPress={() => navigation.navigate('VehicleDetailsScreen', {vehicle: item})}
                style={{
                    alignItems: 'center',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    padding: 10,
                    borderRadius: 10,
                    backgroundColor: baseColor.white,
                    margin: 10,
                }}>
                <MaterialCommunityIcons
                    size={24}
                    color={item.verified ? baseColor.green : baseColor.light_gray_1}
                    name={'shield-check'}/>
                <Text style={Styles.text}>{item.model}</Text>
                <Text style={Styles.text}>{item.regNumber.substring(3).replace('_', ' ')}</Text>
            </TouchableOpacity>
        );

    };
    return (
        <BaseLayout>
            <FlatList data={vehicles} renderItem={item => renderItem(item.item)}/>

        </BaseLayout>

    );
};
