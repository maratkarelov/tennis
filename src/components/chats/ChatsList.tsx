import React, {useEffect, useState} from 'react';
import firestore, {collection, getFirestore, onSnapshot, query} from '@react-native-firebase/firestore';
import {FIELDS, STORAGE_KEYS, TABLES} from '../../Const';
import {ChatItem} from './ChatItem';
import {PagingLayout} from '../../components/base/PagingLayout';
import AsyncStorage from "@react-native-async-storage/async-storage";


export const ChatsList = ({navigation, uid}) => {
    const [users, setUsers] = useState([]);
    const [storedPassengers, setStoredPassengers] = useState();
    const [last, setLast] = useState();
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
    const subscribeChats = () => {
        const qLast = gitFilteredQuery().orderBy(FIELDS.DATE, 'desc').limit(1)
        return onSnapshot(
            qLast,
            querySnapshot => {
                // console.log('querySnapshot', querySnapshot.size);
                setLast(querySnapshot.docs.map(qds => {
                    return qds.data().date;
                }));
            },
            error => {
                console.log(error);
            });
    };

    useEffect(() => {
        navigation.setOptions({
            headerShown: false,
            headerTitle: ' ',
        });
        readStoragePassengers()
        return subscribeChats()
    }, [navigation]);

    //=================================================================================
    // FUNCTIONS
    //=================================================================================


    function gitFilteredQuery() {
        let q = query(collection(getFirestore(), TABLES.CHATS));
        q = q.where(FIELDS.CHAT_MEMBERS, 'array-contains', uid);
        return q;
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
            queryName={'chats'}
        />
    );
};
