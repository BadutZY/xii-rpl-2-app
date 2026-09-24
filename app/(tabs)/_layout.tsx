import React, { useEffect, useMemo, useRef } from 'react';
import { Tabs, useRouter } from 'expo-router';
import { View, Text, TouchableOpacity, StyleSheet, Animated as RNAnimated, type GestureResponderEvent } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Typography, type ThemeColors } from '../../src/constants/theme';
import { useTheme } from '../../src/context/ThemeContext';
import { useAuth } from '../../src/context/AuthContext';
import {
  CodeIcon,
  UsersIcon,
  CalendarIcon,
  ImagesIcon,
  VideoIcon,
  SunIcon,
  MoonIcon,
  UserCircleIcon,
  ShieldCheckIcon,
} from '../../src/components/Icons';

interface TabIconProps {
  focused: boolean;
  icon: React.ReactNode;
  focusedIcon: React.ReactNode;
  label: string;
}

function TabBarIcon({ focused, icon, focusedIcon, label }: TabIconProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const opacityAnim = useRef(new RNAnimated.Value(focused ? 1 : 0.6)).current;
  const pillWidth = useRef(new RNAnimated.Value(focused ? 52 : 36)).current;
  const dotOpacity = useRef(new RNAnimated.Value(focused ? 1 : 0)).current;

  useEffect(() => {
    RNAnimated.parallel([
      RNAnimated.timing(opacityAnim, {
        toValue: focused ? 1 : 0.55,
        duration: 200,
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
        duration: 180,
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
            backgroundColor: focused ? colors.surface2 : 'transparent',
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

// Header button that toggles between dark and light theme — shown on every tab.
function ThemeToggleButton() {
  const { colors, isDark, toggleTheme } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const handlePress = (e: GestureResponderEvent) => {
    const { pageX, pageY } = e.nativeEvent;
    toggleTheme({ x: pageX, y: pageY });
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={styles.themeToggleBtn}
      hitSlop={8}
      activeOpacity={0.75}
    >
      {isDark
        ? <SunIcon size={17} color={colors.foreground} />
        : <MoonIcon size={17} color={colors.foreground} />}
    </TouchableOpacity>
  );
}

// Header button that opens Admin — shown only for admin accounts, sits
// directly to the left of the login/profile button.
function AdminHeaderButton() {
  const { colors } = useTheme();
  const router = useRouter();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <TouchableOpacity
      onPress={() => router.push('/admin')}
      style={styles.adminBtn}
      hitSlop={8}
      activeOpacity={0.75}
    >
      <ShieldCheckIcon size={15} color={colors.emerald} />
    </TouchableOpacity>
  );
}

// Rightmost header button — "Login" (long-form label) when signed out, or
// the person's nickname/username when signed in — mirrors the login button
// in the top-right corner of the website's Navbar.
function LoginHeaderButton() {
  const { colors } = useTheme();
  const { session, profile } = useAuth();
  const router = useRouter();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const label = session ? profile?.nickname?.trim() || profile?.username || 'Profil' : 'Login';

  return (
    <TouchableOpacity
      onPress={() => router.push(session ? '/profile' : '/login')}
      style={[styles.loginBtn, session && styles.loginBtnSignedIn]}
      hitSlop={8}
      activeOpacity={0.8}
    >
      <UserCircleIcon size={14} color={session ? colors.foreground : colors.primaryForeground} />
      <Text
        style={[styles.loginBtnLabel, session && { color: colors.foreground }]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

// Groups theme toggle → admin shortcut (only for admins) → login/profile
// button, in that left-to-right order, all inside headerRight so the login
// button always lands in the very top-right corner of the header.
function HeaderRightButtons() {
  const { isAdmin } = useAuth();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <ThemeToggleButton />
      {isAdmin && <AdminHeaderButton />}
      <LoginHeaderButton />
    </View>
  );
}

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = 60 + insets.bottom;
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <Tabs
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.background,
          borderBottomColor: colors.border,
          borderBottomWidth: 1,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: colors.foreground,
        headerTitleStyle: {
          fontFamily: Typography.heading,
          fontSize: 17,
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
        headerRight: () => <HeaderRightButtons />,
        // Unmount each tab's screen when you navigate away from it, so it
        // fully remounts (fresh state + entrance animations replay) every
        // time you switch back — matching how a real page navigation
        // behaves on the website, not just once on first launch.
        unmountOnBlur: true,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'XII RPL 2',
          headerTitle: 'XII RPL 2',
          tabBarIcon: ({ focused }) => (
            <TabBarIcon
              focused={focused}
              icon={<CodeIcon size={20} color={colors.mutedForeground} />}
              focusedIcon={<CodeIcon size={20} color={colors.foreground} />}
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
              icon={<UsersIcon size={20} color={colors.mutedForeground} />}
              focusedIcon={<UsersIcon size={20} color={colors.foreground} />}
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
              icon={<CalendarIcon size={20} color={colors.mutedForeground} />}
              focusedIcon={<CalendarIcon size={20} color={colors.foreground} />}
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
              icon={<ImagesIcon size={20} color={colors.mutedForeground} />}
              focusedIcon={<ImagesIcon size={20} color={colors.foreground} />}
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
              icon={<VideoIcon size={20} color={colors.mutedForeground} />}
              focusedIcon={<VideoIcon size={20} color={colors.foreground} />}
              label="Video"
            />
          ),
        }}
      />
    </Tabs>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  tabBar: {
    backgroundColor: colors.background,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    paddingTop: 6,
    elevation: 12,
    shadowColor: '#242220',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
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
    color: colors.mutedForeground,
  },
  tabLabelActive: {
    color: colors.foreground,
    fontFamily: Typography.bodyMedium,
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.foreground,
    marginTop: 1,
  },
  themeToggleBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    marginRight: 8,
  },
  adminBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(63,125,87,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(63,125,87,0.25)',
    marginRight: 8,
  },
  loginBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 32,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: colors.primary,
    marginRight: 16,
    maxWidth: 130,
  },
  loginBtnSignedIn: {
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  loginBtnLabel: {
    fontFamily: Typography.bodyMedium,
    fontSize: 12.5,
    color: colors.primaryForeground,
    flexShrink: 1,
  },
});