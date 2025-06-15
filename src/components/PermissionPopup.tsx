import { Linking, Button, View, Modal, Text } from "react-native";

const LocationPermissionPopup = ({ visible, onClose }: { visible: boolean, onClose: () => void }) => {
    const openSettings = () => {
        Linking.openSettings();
        onClose();
    };

    return (
        <Modal visible={visible} transparent animationType="slide">
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#00000099' }}>
                <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 10 }}>
                    <Text>Location permission is required. Please enable it in settings.</Text>
                    <Button title="Go to Settings" onPress={openSettings} />
                </View>
            </View>
        </Modal>
    );
};
export default LocationPermissionPopup;