import React, {useEffect, useState} from 'react';
import firestore from '@react-native-firebase/firestore';
import {FIELDS, STORAGE_KEYS, TABLES} from '../../Const';
import {ChatItem} from './ChatItem';
import {PagingLayout} from '../../components/base/PagingLayout';
import AsyncStorage from "@react-native-async-storage/async-storage";


export const ChatsList = ({navigation, uid}) => {
    const [users, setUsers] = useState([]);
    const [storedPassengers, setStoredPassengers] = useState();
    // console.log('storedPassengers', storedPassengers)
    //================================================
    // hooks
    //================================================

    const readStoragePassengers = () => {
        AsyncStorage.getItem(STORAGE_KEYS.passengers).then(storedPassengersJson => {
            let list = []
            if (storedPassengersJson) {
                list = JSON.parse(storedPassengersJson).map(p => {
                    return {...p, ref: firestore().doc(p.path)}
                })
            }
            setStoredPassengers(list)
        })
    };
    useEffect(() => {
        navigation.setOptions({
            headerShown: false,
            headerTitle: ' ',
        });
        readStoragePassengers()
    }, [navigation]);

    //=================================================================================
    // FUNCTIONS
    //=================================================================================


    function gitFilteredQuery() {
        return firestore().collection(TABLES.CHATS)
            .where(FIELDS.CHAT_MEMBERS, 'array-contains', uid);
    }

    function readUserCallback(user) {
        users.push(user);
        setUsers(users);
    }

    return (
        <PagingLayout
            keyExtractorField={'date'}
            inverted={false}
            renderItem={item => {
                const foundUser = storedPassengers && users.find(u => u.ref.id === (item?.authorRef.id === uid ? item?.userRef.id : item?.authorRef.id))
                const foundPassenger = storedPassengers?.find(p => p.ref.id === (item?.authorRef.id === uid ? item?.userRef.id : item?.authorRef.id))
                return <ChatItem
                    chat={item}
                    readUserCallback={(user) => readUserCallback(user)}
                    foundUser={foundUser ?? foundPassenger}
                    uid={uid}
                    navigation={navigation}/>
            }
            }
            query={gitFilteredQuery()}
        />
    );
};
