import {FlatList, Platform, SafeAreaView, StatusBar, Text, TouchableOpacity, View} from "react-native";
import {useEffect, useState} from "react";
import StylesGlobal from "../../theme/styles";
import {collection, getDocs, getFirestore, query} from "@react-native-firebase/firestore";
import {TABLES} from "../../Const";
import {StackScreenProps} from "@react-navigation/stack/lib/typescript/module/src";
import {BaseLayout} from "../../components/base/BaseLayout";
import I18n from "../../locales/i18n";
import ActionButton from "../../components/ActionButton";
import {baseColor} from "../../theme/appTheme";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

interface Props extends StackScreenProps<any, any> {
}

export const SportsScreen = ({route, navigation}: Props) => {
    const [isLoading, setLoading] = useState(true);
    const [items, setItems] = useState()
    const [selectedItems, setSelectedItems] = useState(route.params?.sports)

    useEffect(() => {
        navigation.setOptions({
            headerBackTitle: ' ',
            headerStatusBarHeight: Platform.OS === 'android' ? StatusBar.currentHeight - 20 : undefined,
            title: I18n.t('select_sport'),
        });

    }, [navigation])

    useEffect(() => {
        let q = query(collection(getFirestore(), TABLES.SPORTS));
        getDocs(q).then(querySnapshot => {
            setItems(querySnapshot.docs.map(qds => {
                return {ref: qds.ref, ...qds.data()}
            }))
            setLoading(false)
        });
    }, []);


    const renderItem = ({item, index}) => {
        const isSelected = selectedItems?.find(s => s.ref.id === item.ref.id) !== undefined
        return (
            <TouchableOpacity
                onPress={() => {
                    if (route.params?.multiplySelection) {
                        let arr = [...(selectedItems ?? [])]
                        if (isSelected) {
                            arr = arr.filter(s => s.ref.id !== item.ref.id)
                        } else {
                            arr.push(item)
                        }
                        setSelectedItems(arr)
                    } else {
                        route.params?.onGoBack(item);
                        navigation.goBack();
                    }
                }}
                style={[StylesGlobal.rowSpace, StylesGlobal.whiteBordered, {
                    marginTop: 10,
                    backgroundColor: isSelected ? baseColor.sky_light : baseColor.white
                }]}>
                <Text style={[StylesGlobal.text, {
                    fontSize: 18,
                }]}>{item.name}</Text>
                {route.params?.multiplySelection && isSelected && <MaterialCommunityIcons name={'check'} size={20} color={baseColor.secondary}/>}
            </TouchableOpacity>
        )
    }

    function confirmSelect() {
        route.params?.onGoBack(selectedItems);
        navigation.goBack();
    }

    return (
        <SafeAreaView style={{flex: 1}}>
            <BaseLayout
                isLoading={isLoading}
            >
                <View style={{justifyContent: 'space-between', flex: 1}}>
                    <FlatList
                        style={{marginHorizontal: 10, marginTop: 20}}
                        data={items} renderItem={renderItem}/>
                    {route.params?.multiplySelection &&
                        <ActionButton
                            disable={selectedItems === undefined || selectedItems?.length === 0}
                            styles={{margin: 20}}
                            onPress={confirmSelect}
                            title={I18n.t('confirm')}/>}
                </View>
            </BaseLayout>
        </SafeAreaView>
    )
}
