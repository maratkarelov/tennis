import React, {useEffect, useState} from 'react';
import moment from 'moment';
import {Image, Text, TouchableOpacity, View} from 'react-native';
import {baseColor} from '../../theme/appTheme';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import LoadingSpinner from '../LoadingSpinner';

export const ChatItem = ({uid, readUserCallback, foundUser, chat, navigation}) => {
    const [user, setUser] = useState(foundUser);
    const dateStrFull = moment(new Date(chat?.date.seconds * 1000)).format('DD MMM HH:mm');
    if (!user) {
        const userRef = chat?.userRef?.id === uid ? chat?.authorRef : chat.userRef;
        userRef.get().then(qds => {
            const {name, photoUrl, phone} = qds.data();
            setUser({ref: qds.ref, name, photoUrl, phone});
        });
    }
    useEffect(() => {
        if (user) {
            readUserCallback(user);
        }
    }, [user]);
    console.log('user', user)
    return (
        <View>
            <TouchableOpacity
                onPress={() => {
                    if (user) {
                        navigation.navigate('MessagesScreen', {user: user, corrId: uid});
                    }
                }}
                style={{
                    borderRadius: 10,
                    padding: 10,
                    marginHorizontal: 10,
                    marginVertical: 5,
                    borderWidth: 1,
                    borderColor: baseColor.light_gray_2,
                    backgroundColor: baseColor.white,
                }}>
                <View style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                }}>
                    <TouchableOpacity onPress={() => navigation.navigate('UserDetailsScreen', {user: user})}>
                        {!user && <LoadingSpinner/>}
                        {user?.photoUrl &&
                            <Image style={Styles.avatar}
                                   source={{uri: user.photoUrl}}/>}
                        {!user?.photoUrl &&
                            <MaterialCommunityIcons
                                size={60}
                                color={baseColor.gray_hint}
                                name={'account-circle'}
                            />}
                    </TouchableOpacity>
                    <View style={{flexDirection: 'row', justifyContent: 'space-between', flex: 1, marginLeft: 10}}>
                        <Text style={{
                            color: baseColor.gray,
                            fontSize: 18,
                            fontWeight: '500',
                            width: '60%',
                        }}>{user?.name}</Text>
                        <View style={{alignItems: 'flex-end'}}>
                            <Text style={{color: baseColor.gray_hint}}>{dateStrFull}</Text>
                            {chat.userRef.id === uid && chat.countUnread > 0 && <Text style={{
                                color: baseColor.primary,
                                fontWeight: '600',
                                fontSize: 16,
                                textAlign: 'right',
                            }}>Новых {chat.countUnread}</Text>}
                            {chat.userRef.id !== uid && chat.countUnread === 0 && <MaterialCommunityIcons
                                size={24}
                                color={baseColor.primary}
                                name={'check-all'}
                            ></MaterialCommunityIcons>}
                        </View>
                    </View>
                </View>
                <Text style={{textAlign: 'start', color: baseColor.blue, fontStyle: 'italic'}}>{chat.lastMessage}</Text>
            </TouchableOpacity>
        </View>
    );

};
