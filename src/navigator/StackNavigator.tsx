import React from 'react';
import {baseColor} from '../theme/appTheme';
import {FirestoreContext} from '../context/firestoreProvider';
import {PasswordScreen} from '../screens/auth/password/PasswordScreen';
import ChatsScreen from '../screens/chats/ChatsScreen';
// import MessagesScreen from '../screens/chats/MessagesScreen';
// import ProfileScreen from '../screens/cabinet/profile/ProfileScreen';
// import {ReviewsScreen} from '../screens/reviews/ReviewsScreen';
import {CabinetScreen} from '../screens/cabinet/CabinetScreen';
// import {SettingsScreen} from '../screens/settings/SettingsScreen';
import {EmailScreen} from '../screens/auth/email/EmailScreen';
import {createStackNavigator} from '@react-navigation/stack';
import {MainScreen} from '../screens/main/MainScreen';
import SearchPlaceScreen from '../screens/places/SearchPlaceScreen';
import {ClassesScreen} from '../screens/sports/ClassesScreen';
import {LocationScheduleScreen} from '../screens/locations/schedule/LocationScheduleScreen';
import {MyBookingScreen} from '../screens/booking/MyBookingScreen';
import ProfileScreen from '../screens/cabinet/profile/ProfileScreen';
import UserDetailsScreen from '../screens/user/details/UserDetailsScreen';
import {ScheduleDetailsScreen} from '../screens/training/ScheduleDetailsScreen';
import {CoachLocationsScreen} from "../screens/locations/CoachLocationsScreen";

export type RootStackParams = {
    StartScreen: undefined;
    SelectModeScreen: undefined;
    MainScreen: undefined;
    TripDetailScreen: undefined;
    BookingsScreen: undefined;
    SearchPlaceScreen: undefined;
    UserDetailsScreen: undefined;
    BookExternalPhoneScreen: undefined;
    BlackListScreen: undefined;
    ChatsScreen: undefined;
    MessagesScreen: undefined;
    ProfileScreen: undefined;
    FilterRoutesScreen: undefined;
    MyBookingDetail: undefined;
    ReviewsScreen: undefined;
    ReviewDetailsScreen: undefined;
    SearchScreen: undefined;
    SearchResultsScreen: undefined;
    VehicleDetailsScreen: undefined;
    QuizScreen: undefined;
    QuizProfileScreen: undefined;
    QuizProfileTracksScreen: undefined;
    QuizTrackReactionsScreen: undefined;
    QuizMemberScreen: undefined;
    QuizMemberTracksScreen: undefined;

    LocationScheduleScreen: undefined;
    ScheduleDetailsScreen: undefined;
};

const Stack = createStackNavigator<RootStackParams>();
let cityUser;
const firestoreContext = {
    setCityUser: (value) => {
        cityUser = value;
    },
    getCityUser: () => {
        return cityUser;
    },
};

export const StackNavigator = () => {
    return (
        <FirestoreContext.Provider value={firestoreContext}>
            <Stack.Navigator
                initialRouteName={'MainScreen'}
                screenOptions={{
                    headerTintColor: 'black',
                    headerStyle: {
                        backgroundColor: baseColor.white,
                        elevation: 0,
                    },
                    animationEnabled: true,
                }}>
                <Stack.Screen name="EmailScreen" component={EmailScreen}/>
                <Stack.Screen name="PasswordScreen" component={PasswordScreen}/>
                <Stack.Screen
                    name="MainScreen"
                    options={{headerShown: false}}
                    component={MainScreen}
                />
                {/*<Stack.Screen name="SearchScreen" component={SearchScreen}/>*/}
                {/*<Stack.Screen name="SearchResultsScreen" component={SearchResultsScreen}/>*/}
                <Stack.Screen name="ScheduleDetailsScreen" component={ScheduleDetailsScreen}/>
                {/*<Stack.Screen name="BookingsScreen" component={BookingsScreen}/>*/}
                <Stack.Screen name="CoachLocationsScreen" component={CoachLocationsScreen}/>
                <Stack.Screen name="LocationScheduleScreen" component={LocationScheduleScreen}/>
                <Stack.Screen name="MyBookingScreen" component={MyBookingScreen}/>
                {/*<Stack.Screen name="BlackListScreen" component={BlackListScreen}/>*/}
                <Stack.Screen name="SearchPlaceScreen" component={SearchPlaceScreen}/>
                <Stack.Screen name="ClassesScreen" component={ClassesScreen}/>
                <Stack.Screen name="UserDetailsScreen" component={UserDetailsScreen}/>
                <Stack.Screen name="ChatsScreen" component={ChatsScreen}/>
                {/*<Stack.Screen name="MessagesScreen" component={MessagesScreen}/>*/}
                {/*<Stack.Screen name="UserSearchScreen" component={UserSearchScreen}/>*/}
                <Stack.Screen name="CabinetScreen" component={CabinetScreen}/>
                <Stack.Screen name="ProfileScreen" component={ProfileScreen}/>
                {/*<Stack.Screen name="FilterRoutesScreen" component={FilterRoutesScreen}/>*/}
                {/*<Stack.Screen name="MyBookingDetail" component={MyBookingDetail}/>*/}
                {/*<Stack.Screen name="ReviewsScreen" component={ReviewsScreen}/>*/}
                {/*<Stack.Screen name="ReviewDetailsScreen" component={ReviewDetailsScreen}/>*/}
                {/*<Stack.Screen name="VehiclesScreen" component={VehiclesScreen}/>*/}
                {/*<Stack.Screen name="VehicleDetailsScreen" component={VehicleDetailsScreen}/>*/}
                {/*<Stack.Screen name="SettingsScreen" component={SettingsScreen}/>*/}
                {/*<Stack.Screen name="QuizProfileScreen" component={QuizProfileScreen}/>*/}
                {/*<Stack.Screen name="QuizProfileTracksScreen" component={QuizProfileTracksScreen}/>*/}
                {/*<Stack.Screen name="QuizTrackReactionsScreen" component={QuizTrackReactionsScreen}/>*/}
                {/*<Stack.Screen name="QuizMemberScreen" component={QuizMemberScreen}/>*/}
                {/*<Stack.Screen name="QuizMemberTracksScreen" component={QuizMemberTracksScreen}/>*/}
            </Stack.Navigator>
        </FirestoreContext.Provider>
    );
};
