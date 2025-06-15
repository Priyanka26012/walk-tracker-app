import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Walk } from "../types/walk";
import { formatDate, formatDuration } from "../utils/common-functions";

const Card = ({ item, handleWalkPress, handleDeleteWalk }: { item: Walk, handleWalkPress: () => void, handleDeleteWalk: () => void }) => (
    <TouchableOpacity
        style={styles.walkItem}
        onPress={handleWalkPress}
    >
        <View style={styles.walkInfo}>
            <Text style={styles.walkDate}>{formatDate(item.startTime)}</Text>
            <Text style={styles.walkDuration}>
                Duration: {formatDuration(item.duration)}
            </Text>
        </View>
        <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDeleteWalk}
        >
            <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
    </TouchableOpacity>
);

export default Card;
const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    map: {
        flex: 1,
    },
    listContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        maxHeight: '50%',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    list: {
        flex: 1,
    },
    walkItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    walkInfo: {
        flex: 1,
    },
    walkDate: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    walkDuration: {
        fontSize: 14,
        color: '#666',
        marginTop: 5,
    },
    deleteButton: {
        backgroundColor: '#F44336',
        padding: 8,
        borderRadius: 5,
    },
    deleteButtonText: {
        color: 'white',
        fontSize: 12,
    },
}); 