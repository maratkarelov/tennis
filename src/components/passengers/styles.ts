import {StyleSheet} from 'react-native';
import {baseColor} from '../../theme/appTheme';

export default StyleSheet.create({
    tripContainer: {
        flex: 1,
        justifyContent: 'space-between',
        flexDirection: 'row',
        paddingHorizontal: 10,
        marginHorizontal: 10,
        marginVertical: 10,
        backgroundColor: baseColor.white,
        borderRadius: 10,
        borderColor: baseColor.light_gray_2,
        borderWidth: 1,
    },
    leftContainer: {
        alignSelf: 'center',
    },
    booked: {
        flexDirection: 'row',
    },
    bookedText: {
        textAlign: 'center',
        color: baseColor.white,
        fontWeight: '600',
    },
    row: {
        alignItems: 'center',
        flexDirection: 'row',
    },
    rowSpace: {
        padding:10,
        marginTop:10,
        borderRadius:10,
        backgroundColor:baseColor.white,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    text_hint: {
        color: baseColor.gray_hint,
        marginLeft: 4,
    },
    avatarContainer: {
        position: 'absolute',
        left: 80,
        alignSelf: 'center',
    },
    avatar: {
        top: 1,
        width: 60,
        height: 60,
        borderRadius: 30,
    },

});
