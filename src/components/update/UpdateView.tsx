import {AppState, Platform, Text, View} from 'react-native';
import Styles from '../../screens/auth/styles';
import DeviceInfo from 'react-native-device-info';
import {baseColor} from '../../theme/appTheme';
import I18n from '../../locales/i18n';
import {AndroidInstallStatus} from 'sp-react-native-in-app-updates/src/types';
import React, {useEffect, useRef, useState} from 'react';
import SpInAppUpdates, {IAUUpdateKind, StartUpdateOptions} from 'sp-react-native-in-app-updates';

const UpdateView = ()=>{
    const [shouldUpdate, setShouldUpdate] = useState(false);
    const [percentDownloaded, setPercentDownloaded] = useState(0);
    const [androidInstallStatus, setAndroidInstallStatus] = useState(undefined);
    const appState = useRef(AppState.currentState);
    useEffect(() => {

        const subscription = AppState.addEventListener('change', nextAppState => {
            if (
                appState.current.match(/inactive|background/) &&
                nextAppState === 'active'
            ) {
                checkForUpdates();
            }

            appState.current = nextAppState;
        });
        return () => {
            subscription.remove();
        };
    }, []);

    const inAppUpdates = new SpInAppUpdates(
        true, // isDebug
    );

    const checkForUpdates = () => {
        inAppUpdates
            .checkNeedsUpdate({
                curVersion: DeviceInfo.getVersion(),
                bundleId: 'com.tennis.book',
            })
            .then(result => {
                setShouldUpdate(result.shouldUpdate);
                if (result.shouldUpdate) {
                }
            });
    };
    const handleStartUpdate = () => {
        let updateOptions: StartUpdateOptions = {};
        if (Platform.OS === 'android') {
            // android only, on iOS the user will be promped to go to your app store page
            updateOptions = {
                updateType: IAUUpdateKind.FLEXIBLE,
            };
        } else {
            updateOptions = {
                title: 'Update available',
                message:
                    'There is a new version of the app available on the App Store, do you want to update it?',
                buttonUpgradeText: 'Update',
                buttonCancelText: 'Cancel',
                bundleId: 'com.tennis.book',
                updateType: IAUUpdateKind.IMMEDIATE,
            };
        }
        inAppUpdates.addStatusUpdateListener(event => {
            setAndroidInstallStatus(event.status);
            setPercentDownloaded(
                (100 * event.bytesDownloaded) / event.totalBytesToDownload,
            );
            if (event.status === AndroidInstallStatus.DOWNLOADED) {
                inAppUpdates.installUpdate();
            }
            if (event.status === AndroidInstallStatus.INSTALLED) {
                setShouldUpdate(false);
            }
        });
        inAppUpdates.startUpdate(updateOptions).then(r => {});
    };

    return (
        <View style={Styles.versionsContainer}>
            <Text style={Styles.versions}>
                App version: {DeviceInfo.getVersion()}
            </Text>
            {
                <Text
                    onPress={() => handleStartUpdate()}
                    style={[
                        Styles.shouldUpdate,
                        {
                            backgroundColor: shouldUpdate
                                ? baseColor.primary
                                : baseColor.white_50,
                        },
                    ]}>
                    {I18n.t('cabinet.update')}
                </Text>
            }
            {androidInstallStatus === AndroidInstallStatus.DOWNLOADING && (
                <Text style={Styles.percentDownloaded}>
                    {percentDownloaded.toFixed(0)}%
                </Text>
            )}
            {androidInstallStatus === AndroidInstallStatus.INSTALLING && (
                <Text style={Styles.percentDownloaded}>
                    {I18n.t('cabinet.installing')}
                </Text>
            )}
        </View>

    );
};
export default UpdateView;
