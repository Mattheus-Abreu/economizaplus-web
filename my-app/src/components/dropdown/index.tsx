import React, {
  useState,
  createContext,
  useContext,
  useRef,
  ReactNode,
  Children,
  useCallback,
  JSX,
} from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Portal } from "react-native-paper";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  Easing,
  withSpring,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import * as Haptics from "expo-haptics";

import {
  SCREEN_WIDTH,
  SCREEN_HEIGHT,
  SPACING,
} from "@/components/dropdown/const";

import type {
  ContentProps,
  DropdownContextValue,
  ItemProps,
  Styles,
  TriggerLayout,
  TriggerProps,
} from "@/components/dropdown/types";

const DropdownContext = createContext<DropdownContextValue | undefined>(
  undefined
);

const useDropdownContext = (): DropdownContextValue => {
  const context = useContext(DropdownContext);
  if (!context) {
    throw new Error("Dropdown components must be used within a Dropdown");
  }
  return context;
};

interface DropdownProps {
  children: ReactNode;
}

const Dropdown = ({ children }: DropdownProps): JSX.Element => {
  const [visible, setVisible] = useState(false);
  const [triggerLayout, setTriggerLayout] =
    useState<TriggerLayout | null>(null);

  const flipAnim = useSharedValue(0);
  const activeItemIndex = useSharedValue(-1);

  const open = () => {
    setVisible(true);
    flipAnim.value = withSpring(1, {
      damping: 15,
      stiffness: 150,
      mass: 0.8,
    });
  };

  const close = (onClosed?: () => void) => {
    flipAnim.value = withTiming(0, {
      duration: 200,
      easing: Easing.bezier(0.4, 0, 0.6, 1),
    });
    activeItemIndex.value = -1;
    setTimeout(() => {
      setVisible(false);
      onClosed?.();
    }, 200);
  };

  const contextValue: DropdownContextValue = {
    visible,
    open,
    close,
    triggerLayout,
    setTriggerLayout,
    flipAnim,
    activeItemIndex,
  };

  return (
    <DropdownContext.Provider value={contextValue}>
      {children}
    </DropdownContext.Provider>
  );
};

const Trigger = ({ children, style }: TriggerProps): JSX.Element => {
  const { open, setTriggerLayout } = useDropdownContext();
  const triggerRef = useRef<View>(null);

  const handlePress = () => {
    triggerRef.current?.measure(
      (_x, _y, width, height, pageX, pageY) => {
        setTriggerLayout({ x: pageX, y: pageY, width, height });
        open();
      }
    );
  };

  return (
    <TouchableOpacity
      ref={triggerRef}
      onPress={handlePress}
      style={style}
      activeOpacity={0.7}
    >
      {children}
    </TouchableOpacity>
  );
};

const Content = ({
  children,
  style,
  position = "auto",
}: ContentProps): JSX.Element | null => {
  // Captura o contexto ANTES do Portal para repassá-lo dentro
  const contextValue = useDropdownContext();
  const { visible, close, triggerLayout, flipAnim, activeItemIndex } = contextValue;

  const itemCount = Children.count(children);
  const contentRef = useRef<View>(null);

  const [contentDimensions, setContentDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);

  const calculatePosition = useCallback(() => {
    if (!triggerLayout || !contentDimensions) {
      return { top: 0, left: 0 };
    }

    const { x, y, width, height } = triggerLayout;
    const { width: contentWidth, height: contentHeight } = contentDimensions;

    let top = y + height + SPACING;
    let left = x;

    if (position === "auto") {
      const spaceBelow = SCREEN_HEIGHT - (y + height);
      const spaceAbove = y;

      if (spaceBelow >= contentHeight + SPACING) {
        top = y + height + SPACING;
      } else if (spaceAbove >= contentHeight + SPACING) {
        top = y - contentHeight - SPACING;
      }

      if (x + contentWidth > SCREEN_WIDTH - SPACING) {
        left = x + width - contentWidth;
      }

      if (left < SPACING) left = SPACING;
    }

    return { top, left };
  }, [triggerLayout, contentDimensions, position]);

  const { top, left } = calculatePosition();

  const animatedStyle = useAnimatedStyle(() => {
    const progress = flipAnim.value;
    return {
      opacity: interpolate(progress, [0, 1], [0, 1]),
      transform: [{ scale: interpolate(progress, [0, 1], [0.9, 1]) }],
    };
  });

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      "worklet";
      const index = Math.floor(event.y / 44);
      activeItemIndex.value = Math.max(0, Math.min(index, itemCount - 1));
    })
    .onEnd(() => {
      "worklet";
      activeItemIndex.value = -1;
    });

  const childrenWithIndex = Children.map(children, (child, index) =>
    React.isValidElement<{ index?: number }>(child)
      ? React.cloneElement(child, { index })
      : child
  );

  if (!visible || !triggerLayout) return null;

  return (
    <Portal>
      {/*
        Portal quebra a árvore React e perde o contexto.
        Repassamos o contextValue manualmente aqui dentro.
      */}
      <DropdownContext.Provider value={contextValue}>
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => close()}
        >
          <TouchableOpacity activeOpacity={1}>
            <GestureDetector gesture={panGesture}>
              <Animated.View
                ref={contentRef}
                onLayout={(e) => {
                  const { width, height } = e.nativeEvent.layout;
                  setContentDimensions({ width, height });
                }}
                style={[
                  styles.content,
                  style,
                  {
                    top,
                    left,
                    minWidth: triggerLayout.width,
                  },
                  animatedStyle,
                ]}
              >
                {childrenWithIndex}
              </Animated.View>
            </GestureDetector>
          </TouchableOpacity>
        </TouchableOpacity>
      </DropdownContext.Provider>
    </Portal>
  );
};

const Item = ({
  children,
  onPress,
  style,
  index = 0,
}: ItemProps): JSX.Element => {
  const { close } = useDropdownContext();

  const handlePress = () => {
    // onPress só é chamado após o dropdown fechar completamente
    close(onPress);
  };

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={handlePress}
      style={[styles.item, style]}
    >
      {children}
    </TouchableOpacity>
  );
};

Dropdown.Trigger = Trigger;
Dropdown.Content = Content;
Dropdown.Item = Item;

const styles = StyleSheet.create<Styles>({
  overlay: { flex: 1 },
  content: {
    position: "absolute",
    borderRadius: 12,
    padding: 8,
    backgroundColor: "#FFF",
    elevation: 8,
  },
  item: {
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
  },
});

export default Dropdown;