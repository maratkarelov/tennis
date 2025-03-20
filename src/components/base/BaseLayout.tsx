import {Modal, Pressable, Text, View} from 'react-native';
import Styles from './styles';
import React from 'react';
import I18n from '../../locales/i18n';
import LoadingSpinner from '../LoadingSpinner';

export const BaseLayout = ({
                               children,
                               confirm,
                               confirmYes,
                               confirmNo,
                               error,
                               isLoading,
                               callbackConfirm,
                               callbackError,
                           }) => {
    const renderDialog = () => {
        return (
            <Modal
                animationType="slide"
                transparent={true}
                visible={error !== undefined || confirm !== undefined}
                onRequestClose={() => {
                }}>
                <View style={Styles.centeredView}>
                    <View style={Styles.modalView}>
                        <Text style={Styles.modalText}>{confirm || error}</Text>
                        {confirm && (
                            <View>
                                <Pressable
                                    style={[Styles.button, Styles.buttonOk]}
                                    onPress={() => {
                                        callbackConfirm(true);
                                    }}>
                                    <Text style={Styles.textStyle}>{I18n.t(confirmYes ?? 'yes')}</Text>
                                </Pressable>
                            </View>
                        )}
                        <Pressable
                            style={[Styles.button, Styles.buttonClose]}
                            onPress={() => {
                                if (confirm) {
                                    callbackConfirm(false);
                                } else {
                                    callbackError();
                                }
                            }}>
                            <Text style={Styles.textStyle}>{I18n.t(confirm ? (confirmNo ?? 'no') : 'close')}</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>
        );
    };
    if (error !== undefined || confirm !== undefined) {
        return renderDialog();
    }
    if (isLoading) {
        return (
            <View
                style={{
                    flex: 1,
                    justifyContent: 'space-between',
                    alignItems: 'center',
                }}>
                <LoadingSpinner/>
            </View>
        );
    }

    return <>{children}</>;
};
