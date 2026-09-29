import { BlurView } from "expo-blur";
import React, { useEffect, useRef } from "react";
import { Animated, Dimensions, StyleSheet, Text, TouchableWithoutFeedback, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useScreensaver } from "./ScreensaverContext";
import { useTheme } from "./ThemeContext";

const { width, height } = Dimensions.get("window");

export default function ScreensaverOverlay() {
  const { active, showTitle, resetTimer } = useScreensaver();
  const { theme, themeMode } = useTheme();
  const anim = useRef(new Animated.Value(0)).current;
  const titleScale = useRef(new Animated.Value(0.95)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (active) {
      Animated.parallel([
        Animated.timing(anim, {
          toValue: 1,
          duration: 520,
          useNativeDriver: true,
        }),
        Animated.timing(titleScale, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(titleOpacity, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        })
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(anim, {
          toValue: 0,
          duration: 420,
          useNativeDriver: true,
        }),
        Animated.timing(titleScale, {
          toValue: 0.95,
          duration: 420,
          useNativeDriver: true,
        }),
        Animated.timing(titleOpacity, {
          toValue: 0,
          duration: 420,
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [active, showTitle]);

  if (!active) return null;
  return (
    <TouchableWithoutFeedback onPress={resetTimer}>
      <Animated.View
        pointerEvents={active ? "auto" : "none"}
        style={[
          StyleSheet.absoluteFill,
          {
            zIndex: 400,
            opacity: anim,
            backgroundColor: theme.background,
            transform: [{ scale: anim.interpolate({ inputRange: [0, 1], outputRange: [0.98, 1] }) }],
          },
        ]}
      >
        <BlurView intensity={40} style={StyleSheet.absoluteFill} tint={themeMode === "dark" ? "dark" : "light"} />
        {showTitle && (
          <SafeAreaView style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1100,
            pointerEvents: "none",
          }}>
            <Animated.View style={{
              transform: [{ scale: titleScale }],
              opacity: titleOpacity,
              width: "100%",
              alignItems: "center",
              justifyContent: "center",
            }}>
              <Text
                style={{
                  fontSize: 48,
                  fontWeight: "900",
                  letterSpacing: 10,
                  color: theme.text,
                  textTransform: "uppercase",
                  textAlign: "center",
                  textShadowColor: themeMode === "dark" ? "#000" : "#fff",
                  textShadowOffset: { width: 0, height: 4 },
                  textShadowRadius: 24,
                  fontFamily: "SpaceMono",
                  includeFontPadding: false,
                  width: "100%",
                  maxWidth: 600,
                  alignSelf: "center",
                  flexShrink: 1,
                }}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                ZENCADEMY
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "600",
                  letterSpacing: 6,
                  color: theme.textSecondary,
                  textAlign: "center",
                  marginTop: 12,
                  opacity: 0.9,
                  textTransform: "uppercase",
                  width: "100%",
                  maxWidth: 600,
                  alignSelf: "center",
                  flexShrink: 1,
                }}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                MIND • BODY • SPIRIT
              </Text>
            </Animated.View>
          </SafeAreaView>
        )}
        
        {/* Press to exit text */}
        <View style={{
          position: "absolute",
          bottom: 50,
          left: 0,
          right: 0,
          alignItems: "center",
          zIndex: 1200,
          pointerEvents: "none",
        }}>
          <Text
            style={{
              fontSize: 14,
              fontWeight: "500",
              letterSpacing: 2,
              color: theme.textTertiary,
              textAlign: "center",
              opacity: 0.7,
              textTransform: "uppercase",
            }}
          >
            Press to exit
          </Text>
        </View>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
}
