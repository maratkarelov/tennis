import {StyleSheet} from 'react-native';
import {baseColor} from '../../../theme/appTheme';

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
    routeContainer: {
        alignItems: 'center',
        top: 4,
        bottom: 4,
        right: 80,
        position: 'absolute',
        width:'35%',
        justifyContent: 'space-evenly',

    },
    routeText: {
        color: baseColor.gray_middle,
        letterSpacing: 2,
        fontSize: 18,
        fontWeight: '400'
    },
    noPlaces: {
        alignSelf: 'center',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 8,
    },
    placesHint: {
        textAlign: 'center',
        color: baseColor.black,
        fontSize: 14,
        fontWeight: '300',

    },
    placesText: {
        textAlign: 'center',
        color: baseColor.black,
        fontSize: 18,
        fontWeight: '600',

    },
    places: {
        alignSelf: 'center',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 8,
    },
    row: {
        alignItems: 'center',
        flexDirection: 'row',
    },
    rowSpace: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    price_text: {
        fontWeight: '400',
        fontSize: 14,
        color: baseColor.gray_middle
    },

    time_text: {
        fontWeight: '600',
        fontSize: 18,
        color: baseColor.black
    },
    text_hint: {
        color: baseColor.gray_hint,
        marginLeft: 4,
    },
    empty_routes: {
        color: baseColor.gray_hint,
        marginLeft: 4,
        textAlign:'center',
        marginTop:30
    },
    avatarContainer: {
        position: 'absolute',
        left: 80,
        alignSelf: 'center'
    },
    avatar: {
        width: 65,
        height: 65,
        borderRadius: 20,
    },
    addTask: {
        alignContent: 'center',
        width: 40,
        height: 40,
        position: 'absolute',
        bottom: 20,
        right: 20,
        borderRadius: 20,
        backgroundColor: baseColor.sky,
        shadowColor: baseColor.black,
        shadowOpacity: 0.8,
        shadowRadius: 5,
        shadowOffset: {
            height: 1,
            width: 0,
        },
    },

});
