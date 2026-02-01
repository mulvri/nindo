import { cssInterop } from "nativewind";
import { SafeAreaView } from "react-native-safe-area-context";

// Configure SafeAreaView pour fonctionner avec NativeWind/className
cssInterop(SafeAreaView, { className: "style" });
