import {StyleSheet} from 'react-native';
import {baseColor} from '../../theme/appTheme';

export default StyleSheet.create({
    container: {
        flexDirection: 'column',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    logo: {
        marginTop: 100,
    },
    bg: {
        position: 'absolute',
        width: '100%',
        height: '100%',
    },
    hint: {
        color: baseColor.gray,
    },
    email: {
        color: baseColor.black,
        fontWeight: '600'
    },
    inputs: {
        width: '100%',
        flexDirection: 'column',
    },

    phoneInputContainer: {
        marginTop: 100,
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        paddingHorizontal: 20,
    },

    input: {
        backgroundColor: 'white',
        fontSize: 14,
        paddingHorizontal: 15,
        width: '100%',
        height: 50,
        borderRadius: 10,
        borderColor: '#b9a7a7',
        marginTop: 20,
        borderWidth: 1,
        color: baseColor.black
    },
    error: {
        color: 'red',
    },
    cancel: {
        padding: 10,
        marginTop: 40,
        textAlign: 'center',
        color: baseColor.light_gray,
    },

    login: {
        height: 60,
        marginTop: 50,
    },
    centeredView: {
        backgroundColor: baseColor.gray_30,
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 22,
    },
    modalView: {
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 35,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    button: {
        borderRadius: 20,
        padding: 10,
        elevation: 2,
    },
    buttonOpen: {
        backgroundColor: '#F194FF',
    },
    buttonClose: {
        backgroundColor: '#2196F3',
    },
    textStyle: {
        color: 'white',
        width: 100,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    modalText: {
        marginBottom: 15,
        textAlign: 'center',
    },
    versionsContainer: {
        padding: 16,
        borderRadius: 10,
        marginTop: 30,
        backgroundColor: baseColor.darkBlue,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    versions: {
        fontSize: 14,
        lineHeight: 20,
        color: baseColor.white,
    },

    shouldUpdate: {
        color: baseColor.white,
        padding: 8,
        marginLeft: 16,
        fontSize: 13,
        lineHeight: 20,
        borderRadius: 8,
    },

    percentDownloaded: {
        marginLeft: 10,
        fontSize: 16,
        lineHeight: 20,
        color: baseColor.sky,
    },

});
