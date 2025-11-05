import EditorScreen from "@/components/EditorScreen";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  return (
    <ScrollView>
      <SafeAreaView style={{ flex: 1 }}>
        <EditorScreen />
      </SafeAreaView>
    </ScrollView>
  );
}
