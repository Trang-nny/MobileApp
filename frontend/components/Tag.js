import React from "react";
import { View, Text, StyleSheet } from "react-native";

const Tag = ({ label, color = "#e50914" }) => (
    <View style={[styles.tag, { borderColor: color }]}>
        <Text style={[styles.text, { color }]}>{label}</Text>
    </View>
);

const styles = StyleSheet.create({
    tag:  {
        borderWidth: 1.5,
        borderRadius: 5,
        paddingHorizontal: 10,
        paddingVertical: 4,
        alignSelf: "flex-start",
    },
    text: { fontSize: 12, fontWeight: "700" },
});

export default Tag;