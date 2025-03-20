import {StyleSheet} from 'react-native';
import {baseColor} from '../../theme/appTheme';

export default StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginVertical: 16,
    justifyContent: 'space-between',
  },
  centeredView: {
    backgroundColor: baseColor.gray_10,
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
    marginVertical:20,
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  buttonOpen: {
    backgroundColor: '#F194FF',
  },
  buttonOk: {
    backgroundColor: '#2196F3',
  },
  buttonClose: {
    marginTop: 20,
    backgroundColor: baseColor.gray,
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
    color: baseColor.black,
  },
  showed: {
    marginHorizontal: 20,
    textAlign: 'center',
    color: baseColor.blue,
  },
  refresh: {
    flexDirection: 'row',
    flex: 1,
    padding: 10,
    margin: 20,
    backgroundColor: baseColor.white,
    borderRadius: 16,
    alignItems: 'center',
    alignContent: 'center',
    alignSelf: 'center',
  },

});
