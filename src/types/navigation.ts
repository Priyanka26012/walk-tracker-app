import { NativeStackScreenProps } from '@react-navigation/native-stack';

export type RootStackParamList = {
  Home: undefined;
  SavedWalks: undefined;
};

export type HomeScreenProps = NativeStackScreenProps<RootStackParamList, 'Home'>;
export type SavedWalksScreenProps = NativeStackScreenProps<RootStackParamList, 'SavedWalks'>; 