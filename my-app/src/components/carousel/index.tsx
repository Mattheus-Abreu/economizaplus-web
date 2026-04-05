import { Dimensions, Platform, StyleSheet, ViewStyle } from "react-native";
import React from "react";
import { BlurCarouselItemProps, BlurCarouselProps } from "./types";
import { BlurView } from "expo-blur";
import Animated, {
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  Extrapolation,
} from "react-native-reanimated";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const ITEM_WIDTH = SCREEN_WIDTH * 0.75;
const SPACING = 0;
const SIDE_SPACING = (SCREEN_WIDTH - ITEM_WIDTH) / 2;

const CarouselItem = <ItemT,>({
  item,
  index,
  scrollX,
  renderItem,
  itemWidth = ITEM_WIDTH,
  spacing = SPACING,
}: BlurCarouselItemProps<ItemT>) => {

  const blurAnimatedStyle = useAnimatedStyle(() => {
  const inputRange = [
    (index - 1) * itemWidth,
    index * itemWidth,
    (index + 1) * itemWidth,
  ];

  return {
    opacity: interpolate(
      scrollX.value,
      inputRange,
      [1, 0, 1], 
      Extrapolation.CLAMP
    ),
  };
});
  
  const animatedStyle = useAnimatedStyle<
    Required<Partial<Pick<ViewStyle, "transform" | "opacity">>>
  >(() => {
    const inputRange = [
      (index - 1) * itemWidth,
      index * itemWidth,
      (index + 1) * itemWidth,
    ];

    return {
      transform: [
        {
          scale: interpolate(
            scrollX.value,
            inputRange,
            [0.85, 1, 0.85],
            Extrapolation.CLAMP
          ),
        },
      ],
      opacity: interpolate(
        scrollX.value,
        inputRange,
        [0.5, 1, 0.5],
        Extrapolation.CLAMP
      ),
    };
  });

  const overlayAnimatedStyle = useAnimatedStyle(() => {
    const inputRange = [
      (index - 1) * itemWidth,
      index * itemWidth,
      (index + 1) * itemWidth,
    ];

    return {
      opacity: interpolate(
        scrollX.value,
        inputRange,
        [0.4, 0, 0.4],
        Extrapolation.CLAMP
      ),
    };
  });

  return (
    <Animated.View
      style={[
        styles.itemContainer,
        animatedStyle,
        { width: itemWidth },
      ]}
    >
      <Animated.View
        style={[
          styles.itemContent,
          { width: itemWidth - spacing * 2 },
        ]}
      >
        {renderItem({ item, index })}

        {Platform.OS === "ios" && (
          <Animated.View
          style={[StyleSheet.absoluteFillObject, blurAnimatedStyle]}
          pointerEvents="none"
        >
          <BlurView
            intensity={50}
            style={[StyleSheet.absoluteFillObject, styles.blurOverlay]}
          />
        </Animated.View>
        )}

        <Animated.View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFillObject,
            { backgroundColor: "rgba(255,255,255,0.15)" },
            overlayAnimatedStyle,
          ]}
        />
      </Animated.View>
    </Animated.View>
  );
};

const BlurCarousel = <ItemT,>({
  data,
  renderItem,
  horizontalSpacing = SIDE_SPACING,
  itemWidth = ITEM_WIDTH,
  spacing = SPACING,
}: BlurCarouselProps<ItemT>) => {
  const scrollX = useSharedValue(0);

  const onScroll = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
  });

  return (
    <Animated.FlatList
      data={data}
      horizontal
      pagingEnabled
      showsHorizontalScrollIndicator={false}
      keyExtractor={(_, index) => index.toString()}
      onScroll={onScroll}
      scrollEventThrottle={16}
      snapToInterval={itemWidth}
      decelerationRate="fast"
      contentContainerStyle={{
        paddingHorizontal: horizontalSpacing,
      }}
      style={{ flexGrow: 0 }}
      renderItem={({ item, index }) => (
        <CarouselItem
          item={item}
          index={index}
          scrollX={scrollX}
          renderItem={renderItem}
          itemWidth={itemWidth}
          spacing={spacing}
        />
      )}
    />
  );
};

const styles = StyleSheet.create({
  itemContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  itemContent: {
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 10,
  },
  blurOverlay: {
    borderRadius: 20,
  },
});

export { BlurCarousel };