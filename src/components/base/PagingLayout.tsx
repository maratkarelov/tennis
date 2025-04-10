import {FlatList, Text, TouchableOpacity, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import {getCountFromServer} from '@react-native-firebase/firestore';
import {FIELDS, PAGE_COUNT} from '../../Const';
import Styles from './styles';
import I18n from '../../locales/i18n';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {baseColor} from '../../theme/appTheme';
import {NoDataView} from '../noData/NoDataView';


export const PagingLayout = ({query, renderItem, inverted, keyExtractorField}) => {
    const [refresh, setRefresh] = useState(true);
    const [page, setPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [items, setItems] = useState([]);

    //================================================
    // hooks
    //================================================

    const subscribeTop = () => {
        console.log('subscribeTop==========')
        query = query.orderBy(FIELDS.DATE, 'desc');
        return query
            .limit(PAGE_COUNT)
            .onSnapshot(querySnapshot => {
                setPage(1);
                setItems([]);
                setRefresh(true);
                onResult(querySnapshot);
            });
    };

    useEffect(() => {
        getPagingTotalCount();
        return subscribeTop();
    }, []);

    useEffect(() => {
        if (page > 1) {
            runPagingQuery(query, items);
        }
    }, [page]);

    //================================================
    // functions
    //================================================


    function runPagingQuery(query, items) {
        if (items?.length < totalCount) {
            console.log('runPagingQuery')
            query = query.orderBy(FIELDS.DATE, 'desc');
            if (items?.length > 0) {
                const lastDocument = items[items?.length - 1].doc;
                query = query.startAfter(lastDocument); // fetch data following the last document accessed
            }
            query
                .limit(PAGE_COUNT)
                .get()
                .then(querySnapshot => {
                    onResult(querySnapshot);
                })
                .catch(onError);
        }
    }

    async function getPagingTotalCount() {
        const snapshot = await getCountFromServer(query);
        setTotalCount(snapshot.data().count);
    }

    function onError(error) {
        console.log(error);
        setRefresh(false);
    }

    console.log('totalCount', totalCount)
    console.log('items', items)
    function onResult(documentSnapshot) {
        const list = [];
        console.log('onResult',documentSnapshot?.size)
        documentSnapshot?.docs?.forEach(doc => {
            const task = {
                ...doc.data(),
                doc: doc,
            };
            list.push(task);
        });

        setItems(page === 1 ? list : [...items, ...list]);
        setRefresh(false);
    }

    function loadMore(item) {
        return <>
            {items?.length >= PAGE_COUNT && item.item === items[items?.length - 1] && (
                <TouchableOpacity
                    style={Styles.refresh}
                    onPress={() => setPage(page + 1)}>
                    <Text style={Styles.showed}>
                        {I18n.t('showed') + items?.length} / {totalCount}
                    </Text>
                    <MaterialCommunityIcons
                        name="sync"
                        color={baseColor.blue}
                        size={40}
                    />
                </TouchableOpacity>
            )}
        </>;
    }

    if (!refresh && items.length === 0) {
        return <NoDataView/>;
    }

    if (items.length > 0) {
        return <FlatList
            style={{backgroundColor: baseColor.yellow_10}}
            refreshing={refresh}
            keyExtractor={item => item[keyExtractorField]}
            data={items}
            inverted={inverted}
            renderItem={item => (
                <View>
                    {inverted && loadMore(item)}
                    {renderItem(item.item)}
                    {!inverted && loadMore(item)}
                </View>
            )}
        />
            ;
    }
};
