import React, {useEffect} from 'react';
import {StackScreenProps} from '@react-navigation/stack';
import {ChatsList} from '../../components/chats/ChatsList';

interface Props extends StackScreenProps<any, any> {
}

export const ChatsScreen = ({navigation, route}: Props) => {
    //================================================
    // hooks
    //================================================

    useEffect(() => {
        navigation.setOptions({
            headerShown: true,
            headerBackTitle: ' ',
            headerTitle: route.params?.name,
        });
    }, [navigation]);

    //=================================================================================
    // render
    //=================================================================================

    return (
        <ChatsList uid={route.params?.uid} navigation={navigation}/>
    );
};
export default ChatsScreen;
