import {Image, Text, TouchableOpacity, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import Styles from './styles';
import {countReviewsAverageWeighted, toColor, totalRatingWeighted} from '../../tools/common';
import {baseColor} from '../../theme/appTheme';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import moment from "moment";
import {EXTERNAL_USER_ID} from "../../Const";

export const PassengerItem = ({item, navigation}) => {
    const [passenger, setPassenger] = useState();

    useEffect(() => {
        const userRef = item.passengerRef.id === EXTERNAL_USER_ID ? item.externalPhoneRef:item.passengerRef
        userRef.get().then(s => {
            setPassenger(s.data());
        });
    }, []);

    const renderPhoto = () => {
        const total = totalRatingWeighted(passenger);
        const count = countReviewsAverageWeighted(passenger);
        const rating = count > 0 ? (total / count).toPrecision(3) : '';
        // console.log("reviews ",total, count,reviews)
        return (<TouchableOpacity
            onPress={() => {
                navigation.navigate('UserDetailsScreen',
                    {
                        user: {
                            ...passenger,
                            ref: item.passengerRef,
                        },
                    }
                );
            }}
            >
            {passenger?.photoUrl &&
                <Image style={[Styles.avatar, {borderColor: toColor(passenger.moodColor), borderWidth: 3}]}
                       source={{uri: passenger?.photoUrl}}/>}
            {!passenger?.photoUrl &&
                <MaterialCommunityIcons
                    size={60}
                    color={baseColor.gray_hint}
                    name={'account-circle'}
                />}


            {rating && <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                position: 'absolute',
                paddingVertical: 2,
                paddingHorizontal: 4,
                backgroundColor: baseColor.light_gray_3,
                borderTopColor: baseColor.light_gray_1,
                borderLeftColor: baseColor.light_gray_1,
                borderRightColor: baseColor.light_gray_1,
                borderBottomColor: baseColor.light_gray_2,
                borderWidth: 1,
                borderRadius: 10,
                bottom: -5,
                right: -40,
            }}>
                <MaterialCommunityIcons size={16} color={baseColor.gray_middle}
                                        name={'star'} />
                <Text
                    style={{
                        marginLeft: 4,
                        color: baseColor.black,
                        fontSize: 16,
                    }}>{rating}
                </Text>
            </View>}
        </TouchableOpacity>);

    };
    return <View style={Styles.rowSpace}>
        {renderPhoto()}
        <View>
        <Text>{passenger?.name}</Text>
            <Text>{moment(new Date(passenger?.dateRegistration.seconds * 1000)).format('DD MMM YYYY')}</Text>
        </View>
    </View>;
};
