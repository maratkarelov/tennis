import {StyleSheet} from 'react-native';
import {baseColor} from '../../../theme/appTheme';

export default StyleSheet.create({

    avatar: {
        width: 65,
        height: 65,
        borderRadius: 20,
    },

    avatar_full_screen: {
        width: 300,
        height: 300,
        borderRadius: 20,
        overflow: 'hidden',
        borderColor: baseColor.gray_30,
    },
});
