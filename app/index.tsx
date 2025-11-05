import EditorScreen from "@/components/EditorScreen";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  return (
    <View className="flex-1 bg-lr-darker">
      <SafeAreaView style={{ flex: 1 }}>
        <EditorScreen />
      </SafeAreaView>
    </View>
  );
}
