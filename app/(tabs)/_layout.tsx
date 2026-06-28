import React, { useEffect, useRef } from 'react';
import { Tabs } from 'expo-router';
import { View, Text, StyleSheet, Platform, Animated as RNAnimated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Typography } from '../../src/constants/theme';
import {
  CodeIcon,
  UsersIcon,
  CalendarIcon,
  ImagesIcon,
  VideoIcon,
} from '../../src/components/Icons';

interface TabIconProps {
  focused: boolean;
  icon: React.ReactNode;
  focusedIcon: React.ReactNode;
  label: string;
}

function TabBarIcon({ focused, icon, focusedIcon, label }: TabIconProps) {
  const scaleAnim = useRef(new RNAnimated.Value(focused ? 1 : 0.9)).current;
  const opacityAnim = useRef(new RNAnimated.Value(focused ? 1 : 0.6)).current;
  const pillWidth = useRef(new RNAnimated.Value(focused ? 52 : 36)).current;
  const dotOpacity = useRef(new RNAnimated.Value(focused ? 1 : 0)).current;

  useEffect(() => {
    RNAnimated.parallel([
      RNAnimated.spring(scaleAnim, {
        toValue: focused ? 1.08 : 0.9,
        useNativeDriver: false,
        damping: 15,
        stiffness: 250,
      }),
      RNAnimated.timing(opacityAnim, {
        toValue: focused ? 1 : 0.55,
        duration: 220,
        useNativeDriver: false,
      }),
      RNAnimated.spring(pillWidth, {
        toValue: focused ? 52 : 36,
        useNativeDriver: false,
        damping: 18,
        stiffness: 200,
      }),
      RNAnimated.timing(dotOpacity, {
        toValue: focused ? 1 : 0,
        duration: 200,
        useNativeDriver: false,
      }),
    ]).start();
  }, [focused]);

  return (
    <View style={styles.tabItem}>
      <RNAnimated.View
        style={[
          styles.tabIconWrap,
          {
            width: pillWidth,
            opacity: opacityAnim,
            transform: [{ scale: scaleAnim }],
            backgroundColor: focused ? 'rgba(16,185,129,0.18)' : 'transparent',
          },
        ]}
      >
        {focused ? focusedIcon : icon}
      </RNAnimated.View>
      <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>
        {label}
      </Text>
      <RNAnimated.View style={[styles.activeDot, { opacity: dotOpacity }]} />
    </View>
  );
}

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = 60 + insets.bottom;

  return (
    <Tabs
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.card,
          borderBottomColor: 'rgba(120,60,210,0.25)',
          borderBottomWidth: 1,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: Colors.foreground,
        headerTitleStyle: {
          fontFamily: Typography.heading,
          fontSize: 18,
        },
        tabBarStyle: [
          styles.tabBar,
          {
            height: tabBarHeight,
            paddingBottom: insets.bottom > 0 ? insets.bottom : 10,
          },
        ],
        tabBarShowLabel: false,
        headerLeft: () => null,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'XI RPL 2',
          headerTitle: 'XI RPL 2',
          tabBarIcon: ({ focused }) => (
            <TabBarIcon
              focused={focused}
              icon={<CodeIcon size={22} color={Colors.mutedForeground} />}
              focusedIcon={<CodeIcon size={22} color={Colors.secondary} />}
              label="Home"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="students"
        options={{
          title: 'Murid & Guru',
          tabBarIcon: ({ focused }) => (
            <TabBarIcon
              focused={focused}
              icon={<UsersIcon size={22} color={Colors.mutedForeground} />}
              focusedIcon={<UsersIcon size={22} color={Colors.secondary} />}
              label="Siswa"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="schedule"
        options={{
          title: 'Jadwal',
          tabBarIcon: ({ focused }) => (
            <TabBarIcon
              focused={focused}
              icon={<CalendarIcon size={22} color={Colors.mutedForeground} />}
              focusedIcon={<CalendarIcon size={22} color={Colors.secondary} />}
              label="Jadwal"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="gallery"
        options={{
          title: 'Gallery',
          tabBarIcon: ({ focused }) => (
            <TabBarIcon
              focused={focused}
              icon={<ImagesIcon size={22} color={Colors.mutedForeground} />}
              focusedIcon={<ImagesIcon size={22} color={Colors.secondary} />}
              label="Gallery"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="videos"
        options={{
          title: 'Video',
          tabBarIcon: ({ focused }) => (
            <TabBarIcon
              focused={focused}
              icon={<VideoIcon size={22} color={Colors.mutedForeground} />}
              focusedIcon={<VideoIcon size={22} color={Colors.secondary} />}
              label="Video"
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.card,
    borderTopColor: 'rgba(120,60,210,0.25)',
    borderTopWidth: 1,
    paddingTop: 6,
    elevation: 24,
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    minWidth: 56,
  },
  tabIconWrap: {
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
  },
  tabLabel: {
    fontFamily: Typography.body,
    fontSize: 9,
    color: Colors.mutedForeground,
  },
  tabLabelActive: {
    color: Colors.secondary,
    fontFamily: Typography.bodyMedium,
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.secondary,
    marginTop: 1,
  },
});