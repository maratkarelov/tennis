import RBSheet from 'react-native-raw-bottom-sheet';
import {Text, TouchableOpacity, useWindowDimensions, View} from 'react-native';
import I18n from '../../../locales/i18n';
import {baseColor} from '../../../theme/appTheme';
import React, {useEffect, useState} from 'react';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import DatePicker from 'react-native-date-picker';

export const CopyTripsSheet = ({
                                   date,
                                   refCopyTrips,
                                   dismissCallback,
                                   copyTripsCallback,
                                   setStartCopyDateCallback,
                                   setCountCallback,
                                   enableConfirm,
                               }) => {
    const {height} = useWindowDimensions();
    const [count, setCount] = useState(1);
    const [startCopyDate, setStartCopyDate] = useState();

    useEffect(() => {
        const selectedDate = new Date(date);
        const nextDate = new Date(date);
        nextDate.setDate(selectedDate.getDate() + 1);
        setStartCopyDate(nextDate);
        setStartCopyDateCallback(nextDate);

    }, [date]);

    useEffect(() => {
        setCountCallback(count);
    }, [count]);
    return <RBSheet
        height={0.3 * height}
        onClose={dismissCallback}
        ref={refCopyTrips}
        customStyles={{
            wrapper: {
                backgroundColor: baseColor.gray_10,
            },
            draggableIcon: {
                backgroundColor: '#000',
            },
        }}
        useNativeDriver={false}>
        <View style={{marginHorizontal: 10, marginTop: 10}}>
            <View style={{
                justifyContent: 'space-evenly',
                flexDirection: 'row',
                alignItems: 'center'
            }}>
                <Text style={{
                    fontSize: 14,
                    color: baseColor.sky,
                    marginRight: 20,
                }}>{I18n.t('copy_trips_for_date')}</Text>
                <TouchableOpacity onPress={() => setCount(count > 1 ? count - 1 : 1)}
                >
                    <MaterialCommunityIcons
                        size={40}
                        color={baseColor.sky}
                        name={'minus-circle'}/>
                </TouchableOpacity>
                <Text
                    style={{marginHorizontal: 10, fontSize: 20, color: baseColor.sky, fontWeight: '600'}}>{count}</Text>
                <TouchableOpacity onPress={() => setCount(count + 1)}>
                    <MaterialCommunityIcons
                        size={40}
                        color={baseColor.sky}
                        name={'plus-circle'}/>
                </TouchableOpacity>

            </View>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <DatePicker
                    theme={'light'}
                    locale={'ru'}
                    style={{flex: 3}}
                    minimumDate={new Date()}
                    mode={'date'}
                    date={startCopyDate}
                    onDateChange={(date) => {
                        setStartCopyDate(date);
                        setStartCopyDateCallback(date);
                    }}/>

                <TouchableOpacity
                    style={{
                        flex: 1,
                        padding: 6,
                        marginLeft: 20,
                        borderRadius: 10,
                        backgroundColor: enableConfirm ? baseColor.sky : baseColor.light_gray,
                    }}
                    onPress={() => {
                        if (enableConfirm) {
                            copyTripsCallback();
                        }
                    }}>
                    <View
                    >
                        <Text
                            style={{
                                textAlign: 'center',
                                color: baseColor.white, fontSize: 14,
                            }}>
                            {I18n.t('confirm')}
                        </Text>
                    </View>
                </TouchableOpacity>
            </View>
        </View>
    </RBSheet>;
};
export default CopyTripsSheet;
