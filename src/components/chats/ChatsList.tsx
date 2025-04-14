import React, {useEffect, useState} from 'react';
import firestore, {collection, getFirestore, query} from '@react-native-firebase/firestore';
import {FIELDS, STORAGE_KEYS, TABLES} from '../../Const';
import {ChatItem} from './ChatItem';
import {PagingLayout} from '../base/PagingLayout';
import AsyncStorage from '@react-native-async-storage/async-storage';


export const ChatsList = ({navigation, uid}) => {
    const [users, setUsers] = useState([]);
    const [storedPassengers, setStoredPassengers] = useState();
    const [last, setLast] = useState();
    console.log('ChatsList', last);
    // console.log('storedPassengers', storedPassengers)

    //================================================
    // functions
    //================================================

    function gitFilteredQuery() {
        let q = query(collection(getFirestore(), TABLES.CHATS));
        q = q.where(FIELDS.CHAT_MEMBERS, 'array-contains', uid);
        return q;
    }

    function readUserCallback(user) {
        users.push(user);
        setUsers(users);
    }

    const readStoragePassengers = () => {
        AsyncStorage.getItem(STORAGE_KEYS.passengers).then(storedPassengersJson => {
            let list = [];
            if (storedPassengersJson) {
                list = JSON.parse(storedPassengersJson).map(p => {
                    return {...p, ref: firestore().doc(p.path)};
                });
            }
            setStoredPassengers(list);
        });
    };

    //================================================
    // hooks
    //================================================

    useEffect(() => {
        navigation.setOptions({
            headerShown: false,
            headerTitle: ' ',
        });
        readStoragePassengers();
    }, [navigation]);

    useEffect(() => {
        const onFocus = navigation.addListener('focus', () => {
            console.log('onFocus ChatsList', uid)
            gitFilteredQuery()
                .orderBy(FIELDS.DATE, 'desc')
                .limit(1)
                .get()
                .then(qs=>{
                    console.log('onFocus querySnapshot', qs.size);
                    const qds = qs.docs[0];
                    const data = qds.data()
                    console.log('data.date.toISOString()',data.date.toISOString())
                    setLast(data.date.toISOString());
                });
        });
        return () => {
            onFocus();
        };

    }, []);

    //=================================================================================
    // RENDER
    //=================================================================================

    return (
        <PagingLayout
            keyExtractorField={'date'}
            inverted={false}
            renderItem={item => {
                const foundUser = storedPassengers && users.find(u => u.ref.id === (item?.authorRef.id === uid ? item?.userRef.id : item?.authorRef.id));
                const foundPassenger = storedPassengers?.find(p => p.ref.id === (item?.authorRef.id === uid ? item?.userRef.id : item?.authorRef.id));
                return <ChatItem
                    chat={item}
                    readUserCallback={(user) => readUserCallback(user)}
                    foundUser={foundUser ?? foundPassenger}
                    uid={uid}
                    navigation={navigation}/>;
            }
            }
            query={gitFilteredQuery()}
        />
    );
};
