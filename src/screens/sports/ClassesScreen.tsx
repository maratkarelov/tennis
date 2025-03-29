import {FlatList, SafeAreaView, Text, TouchableOpacity, View} from "react-native";
import {useEffect, useState} from "react";
import StylesGlobal from "../../theme/styles";
import {collection, getDocs, getFirestore, query} from "@react-native-firebase/firestore";
import {TABLES} from "../../Const";
import {StackScreenProps} from "@react-navigation/stack/lib/typescript/module/src";
import {BaseLayout} from "../../components/base/BaseLayout";
import I18n from "../../locales/i18n";

interface Props extends StackScreenProps<any, any> {
}

export const ClassesScreen = ({route, navigation}: Props)=>{
    const [isLoading, setLoading] = useState(true);
    const [items,setItems] = useState()

    useEffect(()=>{
        navigation.setOptions({
            headerBackTitle: ' ',
            title: I18n.t('select_class'),
        });

    },[navigation])

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
        return (
            <TouchableOpacity
                onPress={()=>{
                    route.params?.onGoBack(item);
                    navigation.goBack();
                }}
                style={[StylesGlobal.row, StylesGlobal.whiteBordered, { marginTop: 10}]}>
                <Text>{item.name}</Text>
            </TouchableOpacity>
        )
    }

    return (
        <SafeAreaView>
            <BaseLayout
                isLoading={isLoading}
            >
            <FlatList
                style={{marginHorizontal: 10, marginTop: 20}}
                data={items} renderItem={renderItem}/>
            </BaseLayout>
        </SafeAreaView>
    )
}
