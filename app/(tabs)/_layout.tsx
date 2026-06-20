import React from 'react';
import { Tabs } from 'expo-router';
import { View, Text, StyleSheet, Platform } from 'react-native';
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
  return (
    <View style={styles.tabItem}>
      <View style={[styles.tabIconWrap, focused && styles.tabIconWrapActive]}>
        {focused ? focusedIcon : icon}
      </View>
      <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>
        {label}
      </Text>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.card,
          borderBottomColor: Colors.border,
          borderBottomWidth: 1,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: Colors.foreground,
        headerTitleStyle: {
          fontFamily: Typography.heading,
          fontSize: 18,
        },
        tabBarStyle: styles.tabBar,
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
    borderTopColor: Colors.border,
    borderTopWidth: 1,
    height: Platform.OS === 'ios' ? 84 : 64,
    paddingBottom: Platform.OS === 'ios' ? 24 : 8,
    paddingTop: 8,
    elevation: 0,
    shadowOpacity: 0,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  tabIconWrap: {
    width: 36,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
  },
  tabIconWrapActive: {
    backgroundColor: 'rgba(16,185,129,0.15)',
  },
  tabLabel: {
    fontFamily: Typography.body,
    fontSize: 10,
    color: Colors.mutedForeground,
  },
  tabLabelActive: {
    color: Colors.secondary,
    fontFamily: Typography.bodyMedium,
  },
});