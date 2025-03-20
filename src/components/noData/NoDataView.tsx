import {Image, Text, View} from 'react-native';
import {baseColor} from '../../theme/appTheme';
import I18n from '../../locales/i18n';
import React from 'react';

const emptyData = require('../../assets/empty_data.png');

export const NoDataView = ()=>{
    return <View style={{alignItems: 'center'}}>
        <Image source={emptyData}/>
        <Text style={{fontSize: 16, color: baseColor.gray_hint}}>{I18n.t('no_data')}</Text>
    </View>;
};
