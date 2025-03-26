import React, {useContext, useEffect, useState} from 'react';
import {Modal, Share, Text, TouchableOpacity, View} from 'react-native';
import Styles from './styles';
import I18n from '../../locales/i18n';
import auth from '@react-native-firebase/auth';
import {StackScreenProps} from '@react-navigation/stack';
import {BaseLayout} from '../../components/base/BaseLayout';
import {baseColor} from '../../theme/appTheme';
import UpdateView from '../../components/update/UpdateView';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {FirestoreContext} from '../../context/firestoreProvider';
import messaging from '@react-native-firebase/messaging';
import QRCode from 'react-native-qrcode-svg';
import firestore from "@react-native-firebase/firestore";
import {supportId, TABLES} from "../../Const";

interface Props extends StackScreenProps<any, any> {
}


export const CabinetScreen = ({navigation, route}: Props) => {
    const [isLoading, setLoading] = useState(false);
    const [modalTitle, setModalTitle] = useState(undefined);
    const [shareUrl, setShareUrl] = useState();
    const [showQr, setShowQr] = useState(false);
    const [supportUser, setSupportUser] = useState(false);
    const firestoreContext = useContext(FirestoreContext);
    // console.log('shareUrl',shareUrl)
    // console.log('firestoreContext.getCityUser()',firestoreContext.getCityUser())
    useEffect(() => {
        navigation.setOptions({
            headerShown: true,
            headerTitle: ' ',
            headerLeft: () => (
                <TouchableOpacity style={{marginLeft: 12}} onPress={() => navigation.navigate('ProfileScreen')}>
                    <MaterialCommunityIcons
                        name="account-circle"
                        color={baseColor.primary}
                        size={40}
                    />
                </TouchableOpacity>
            ),
            headerRight: () => (
                <TouchableOpacity onPress={handleLogout}>
                    <Text style={Styles.sign_out_text}>
                        {I18n.t('cabinet.sign_out')}
                    </Text>
                </TouchableOpacity>
            ),
        });

    }, [navigation]);

    useEffect(() => {
        firestore().collection(TABLES.USERS).doc(supportId).get().then(ds => {
            setSupportUser({ref: ds.ref, ...ds.data()})
        })
        prepareShareAppLink();
    }, []);

    function signOut() {
        auth()
            .signOut()
            .then(() => {
                firestoreContext.setCityUser(undefined);
            })
            .catch(e => {
                console.log(e.toString());
            })
            .finally(() => {
                setLoading(false);
            });
    }

    const handleLogout = async () => {
        setLoading(true);
        messaging().getToken()
            .then(token => {
                const newTokens = firestoreContext.getCityUser()?.tokens?.filter(t => t !== token);
                firestoreContext.getCityUser()?.ref
                    .update({tokens: newTokens})
                    .then(() => {
                        signOut();
                    })
                    .catch(e => {
                        signOut();
                        console.log(e.toString());
                    });
            })
            .catch(e => {
                signOut();
                console.log(e.toString());
            });
    };

    const prepareShareAppLink = () => {
        // branch.createBranchUniversalObject('content/12345', {
        //     title: 'City Pro',
        //     contentDescription: 'Новое приложение по поиску попутчиков в совместных поездках\nИспользуйте мою реферальную ссылку',
        //     contentMetadata: {
        //         customMetadata: {
        //             invitedby: firestoreContext.getCityUser()?.ref.id,
        //         },
        //     },
        // }).then(buo => {
        //     let linkProperties = {
        //         // feature: 'sharing',
        //         // channel: 'facebook',
        //         // campaign: 'content 123 launch'
        //     };
        //
        //     let controlParams = {
        //         $desktop_url: 'https://citycity.me',
        //         custom: 'data',
        //     };
        //     buo.generateShortUrl(linkProperties, controlParams)
        //         .then(url => {
        //             setShareUrl(url.url);
        //         })
        //         .catch(reason => {
        //             console.log(reason);
        //         });
        //
        // });
        //
        // console.log('buo', buo);

    };
    const renderSupport = () => {
        return (<TouchableOpacity
            onPress={() => {
                navigation.navigate('MessagesScreen', {
                    user: supportUser,
                    corrId: firestoreContext.getCityUser()?.ref.id
                })
            }}
            style={[Styles.row, {
                marginTop: 20,
                padding: 5,
                marginBottom: 20,
                backgroundColor: baseColor.white,
                borderRadius: 10
            }]}
        >
            <MaterialCommunityIcons
                name={'headset'}
                size={40}
                color={baseColor.primary}
            ></MaterialCommunityIcons>
            <Text style={Styles.open_support_chat}>{I18n.t('cabinet.open_support_chat')}</Text>
        </TouchableOpacity>)
    }
    const renderSettings = () => {
        return (<TouchableOpacity
            onPress={() => {
                navigation.navigate('SettingsScreen')
            }}
            style={[Styles.row, {
                marginTop: 10,
                padding: 5,
                marginBottom: 20,
                backgroundColor: baseColor.white,
                borderRadius: 10
            }]}
        >
            <MaterialCommunityIcons
                name={'cog-outline'}
                size={40}
                color={baseColor.primary}
            ></MaterialCommunityIcons>
            <Text style={Styles.open_support_chat}>{I18n.t('settings')}</Text>
        </TouchableOpacity>)
    }

    const renderDialog = () => {
        return (
            <Modal
                animationType="slide"
                transparent={true}
                visible={showQr}
                onRequestClose={() => {
                }}>
                <View style={{
                    backgroundColor: baseColor.white,
                    height: '50%',
                    alignItems: 'center',
                    borderRadius: 20,
                }}>
                    <TouchableOpacity
                        style={{
                            position: 'absolute',
                            right: 20,
                            top: 20,
                        }}
                        onPress={() => {
                            setShowQr(false);
                        }}
                    >
                        <MaterialCommunityIcons
                            size={40}
                            color={baseColor.primary}
                            name={'close'}
                        />
                    </TouchableOpacity>

                    <Text style={{
                        marginTop: 20,
                        textAlign: 'center',
                        color: baseColor.gray_middle,
                    }}>{I18n.t('cabinet.share_app')}</Text>
                    <Text style={{
                        marginVertical: 20,
                        textAlign: 'center',
                        color: baseColor.gray_middle,
                    }}>{I18n.t('cabinet.point_camera_to_scan')}</Text>
                    <QRCode
                        size={200}
                        value={shareUrl}
                    />
                </View>
            </Modal>
        );
    };

    function renderShare() {
        return <>
            {shareUrl && <View>
                <Text style={{
                    fontWeight: '600',
                    marginTop: 20,
                    textAlign: 'center',
                    color: baseColor.gray_middle,
                }}>{I18n.t('cabinet.share_app')}</Text>
                <View style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    marginTop: 10,
                    marginHorizontal: 0,
                }}>
                    <TouchableOpacity
                        onPress={() => {
                            Share.share({
                                message: shareUrl,
                            });
                        }}
                    >
                        <View style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            borderRadius: 10,
                            paddingHorizontal: 10,
                            backgroundColor: baseColor.white,
                        }}>
                            <MaterialCommunityIcons
                                size={40}
                                color={baseColor.primary}
                                name={'share'}
                            />
                            <Text style={{color: baseColor.primary, marginLeft: 10}}>{I18n.t('cabinet.send')}</Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => {
                            setShowQr(true);
                        }}
                    >
                        <View style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            borderRadius: 10,
                            paddingHorizontal: 10,
                            backgroundColor: baseColor.white,
                        }}>
                            <MaterialCommunityIcons
                                size={40}
                                color={baseColor.primary}
                                name={'qrcode'}
                            />
                            <Text style={{color: baseColor.primary, marginLeft: 10}}>{I18n.t('cabinet.qr_code')}</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>}
        </>;
    }

    return (
        <BaseLayout
            isLoading={isLoading}
            error={modalTitle}
            callbackDialog={() => {
                setModalTitle(undefined);
            }}>
            <View style={Styles.container}>
                <View>
                    {renderSupport()}
                    {renderSettings()}
                </View>
                <View>
                    {showQr && renderDialog()}
                    {renderShare()}
                    <UpdateView/>
                </View>
            </View>

        </BaseLayout>
    );
};
