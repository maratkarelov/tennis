import {Image, TouchableOpacity, useWindowDimensions, View} from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import {baseColor} from "../../theme/appTheme";
import React, {useState} from "react";

export const UserImageView = ({photoUrl, isMyProfile}) => {
    const [isAvatarFullScreen, setIsAvatarFullScreen] = useState(false);
    const {width} = useWindowDimensions();
    const avatarSize = isAvatarFullScreen ? width : width / 4;
    return <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    }}>
        {photoUrl &&
            <TouchableOpacity
                onPress={() => {
                    setIsAvatarFullScreen(!isAvatarFullScreen);
                }}>
                <Image
                    style={{
                        marginLeft: isAvatarFullScreen ? (isMyProfile ? -10 : 0) : 10,
                        borderRadius: isAvatarFullScreen ? 0 : 20,
                        width: avatarSize,
                        height: avatarSize,
                    }}
                    source={{uri: photoUrl}}/>
            </TouchableOpacity>}
        {!photoUrl &&
            <MaterialCommunityIcons
                size={avatarSize}
                color={baseColor.light_gray_1}
                name={'account-circle'}
            />}
    </View>;

}
