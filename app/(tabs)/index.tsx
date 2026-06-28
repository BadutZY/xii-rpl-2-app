import React, { useRef, useCallback, useEffect } from 'react';
import {
  ScrollView, View, Text, TouchableOpacity, Image,
  StyleSheet, Dimensions, ImageBackground,
} from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring, withTiming,
  withDelay, withRepeat, withSequence,
  FadeInDown, ZoomIn, interpolate, useAnimatedScrollHandler, Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useFocusEffect } from 'expo-router';
import { Colors, Typography, BorderRadius, Spacing } from '../../src/constants/theme';
import {
  CodeIcon, UsersIcon, CalendarIcon, ArrowRightIcon,
  DatabaseIcon, CpuIcon, ImagesIcon, BookIcon, RocketIcon, SchoolIcon, AwardIcon,
} from '../../src/components/Icons';
import { galleryPreview } from '../../src/data/gallery';

const { width: SCREEN_W } = Dimensions.get('window');
const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

function SectionDivider() {
  return (
    <View style={styles.divider}>
      <LinearGradient colors={['#7c3aed','#10b981']} start={{x:0,y:0}} end={{x:1,y:0}} style={styles.dividerLine} />
    </View>
  );
}

// Pulse ring — no entering, only transform via useAnimatedStyle
function PulseRing({ color, delay }: { color: string; delay: number }) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.6);
  useEffect(() => {
    scale.value = withDelay(delay, withRepeat(withSequence(
      withTiming(1.8,{duration:1800,easing:Easing.out(Easing.ease)}),
      withTiming(1,{duration:0})
    ),-1,false));
    opacity.value = withDelay(delay, withRepeat(withSequence(
      withTiming(0,{duration:1800,easing:Easing.out(Easing.ease)}),
      withTiming(0.6,{duration:0})
    ),-1,false));
  }, []);
  const style = useAnimatedStyle(() => ({
    position:'absolute' as const, width:80, height:80, borderRadius:40,
    borderWidth:1.5, borderColor:color,
    transform:[{scale:scale.value}], opacity:opacity.value,
  }));
  return <Animated.View style={style} />;
}

// Floating dot — no entering
function FloatingDot({ x, y, color, delay }: { x:number; y:number; color:string; delay:number }) {
  const ty = useSharedValue(0);
  const op = useSharedValue(0.3);
  useEffect(() => {
    ty.value = withDelay(delay, withRepeat(withSequence(
      withTiming(-12,{duration:2200,easing:Easing.inOut(Easing.ease)}),
      withTiming(0, {duration:2200,easing:Easing.inOut(Easing.ease)})
    ),-1,false));
    op.value = withDelay(delay, withRepeat(withSequence(
      withTiming(0.8,{duration:2200}), withTiming(0.3,{duration:2200})
    ),-1,false));
  }, []);
  const style = useAnimatedStyle(() => ({
    position:'absolute' as const, left:x, top:y, width:5, height:5, borderRadius:3,
    backgroundColor:color, transform:[{translateY:ty.value}], opacity:op.value,
  }));
  return <Animated.View style={style} />;
}

// PressCard — scale on inner, onPress on TouchableOpacity
function PressCard({ onPress, children, style }: { onPress:()=>void; children:React.ReactNode; style?:any }) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform:[{scale:scale.value}] }));
  return (
    <Animated.View style={[animStyle, style]}>
      <TouchableOpacity
        onPressIn={() => { scale.value = withSpring(0.96,{damping:20,stiffness:300}); }}
        onPressOut={() => { scale.value = withSpring(1,{damping:20,stiffness:300}); }}
        onPress={onPress} activeOpacity={1}
      >
        {children}
      </TouchableOpacity>
    </Animated.View>
  );
}

// Bouncing arrow — transform only (no entering conflict)
function ArrowDownBounce({ onPress }: { onPress:()=>void }) {
  const ty = useSharedValue(0);
  useEffect(() => {
    ty.value = withRepeat(withSequence(
      withTiming(-10,{duration:700,easing:Easing.inOut(Easing.ease)}),
      withTiming(0, {duration:700,easing:Easing.inOut(Easing.ease)})
    ),-1,false);
  }, []);
  const style = useAnimatedStyle(() => ({ transform:[{translateY:ty.value}] }));
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Animated.View style={[styles.scrollDownInner, style]}>
        <ArrowRightIcon size={22} color={`${Colors.foreground}80`} strokeWidth={1.8} />
      </Animated.View>
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  const scrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler({ onScroll:(e) => { scrollY.value = e.contentOffset.y; } });
  const scrollToAbout = () => scrollRef.current?.scrollTo({y:500,animated:true});

  useFocusEffect(useCallback(() => {
    scrollRef.current?.scrollTo({y:0,animated:false});
  },[]));

  const heroParallax = useAnimatedStyle(() => ({
    transform:[{translateY:interpolate(scrollY.value,[0,300],[0,-60])}],
    opacity:interpolate(scrollY.value,[0,200],[1,0.4]),
  }));

  return (
    <AnimatedScrollView ref={scrollRef} style={styles.container} showsVerticalScrollIndicator={false} bounces onScroll={scrollHandler} scrollEventThrottle={16}>

      {/* ── HERO ── */}
      <View style={styles.hero}>
        <ImageBackground source={require('../../assets/gallery/hero-class.jpeg')} style={[StyleSheet.absoluteFill,{transform:[{scale:1.08}]}]} resizeMode="cover" />
        <LinearGradient colors={['rgba(10,14,40,0.75)','rgba(8,11,28,0.96)']} style={StyleSheet.absoluteFill} />
        <FloatingDot x={30}           y={80}  color={Colors.primary}       delay={0}    />
        <FloatingDot x={SCREEN_W-50}  y={120} color={Colors.secondary}     delay={700}  />
        <FloatingDot x={60}           y={300} color={Colors.primaryLight}   delay={400}  />
        <FloatingDot x={SCREEN_W-80}  y={350} color={Colors.secondaryLight} delay={1100} />

        {/* heroParallax carries transform — Animated.View, NO entering */}
        <Animated.View style={[styles.heroContent, heroParallax]}>

          {/* Badge: ZoomIn on outer; PulseRings carry transforms internally */}
          <Animated.View entering={ZoomIn.duration(600).springify()} style={styles.heroBadgeWrap}>
            <PulseRing color={Colors.primary} delay={0} />
            <PulseRing color={Colors.secondary} delay={600} />
            <LinearGradient colors={['rgba(124,58,237,0.25)','rgba(16,185,129,0.25)']} style={styles.heroBadgeGrad}>
              <CodeIcon size={38} color={Colors.secondary} />
            </LinearGradient>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(150).duration(600).springify()}>
            <View style={styles.heroLabelWrap}>
              <LinearGradient colors={['rgba(124,58,237,0.3)','rgba(16,185,129,0.3)']} style={styles.heroLabel} start={{x:0,y:0}} end={{x:1,y:0}}>
                <Text style={styles.heroLabelText}>SMK INFOKOM</Text>
              </LinearGradient>
            </View>
            <Text style={styles.heroClass}>11 RPL 2</Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(280).duration(600)}>
            <Text style={styles.heroDesc}>Rekayasa Perangkat Lunak - Membangun masa depan digital dengan kode dan kreativitas.</Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(400).duration(600)} style={styles.heroButtons}>
            <PressCard onPress={() => router.push('/students')}>
              <LinearGradient colors={['#7c3aed','#5b21b6']} style={styles.btnPrimary} start={{x:0,y:0}} end={{x:1,y:1}}>
                <UsersIcon size={16} color={Colors.foreground} />
                <Text style={styles.btnPrimaryText}>Lihat Murid</Text>
                <ArrowRightIcon size={15} color={Colors.foreground} />
              </LinearGradient>
            </PressCard>
            <PressCard onPress={() => router.push('/schedule')}>
              <View style={styles.btnOutline}>
                <CalendarIcon size={16} color={Colors.secondaryLight} />
                <Text style={styles.btnOutlineText}>Lihat Jadwal</Text>
              </View>
            </PressCard>
          </Animated.View>

          <ArrowDownBounce onPress={scrollToAbout} />
        </Animated.View>
      </View>

      {/* ── ABOUT ── */}
      <View style={styles.section}>
        <Animated.View entering={FadeInDown.duration(500)}>
          <Text style={styles.sectionTitle}>Tentang <Text style={{color:Colors.primary}}>XI RPL 2</Text></Text>
          <SectionDivider />
          <Text style={styles.sectionDesc}>XI RPL 2 di SMK Infokom fokus pada pengembangan keterampilan teknis dan kreatif untuk mempersiapkan siswa menjadi profesional di bidang teknologi informasi.</Text>
        </Animated.View>
        <View style={styles.cardGrid}>
          {[
            { title:'Kurikulum', desc:'Kurikulum dirancang untuk mengajarkan pemrograman, pengembangan web, manajemen database, dan robotik dengan pendekatan praktis dan proyek berbasis industri.', icon:<BookIcon size={28} color={Colors.primary}/>, accent:Colors.primary },
            { title:'Kegiatan',  desc:'Siswa terlibat dalam pelatihan intensif untuk mengasah kemampuan coding dan kolaborasi dalam lingkungan profesional.', icon:<RocketIcon size={28} color={Colors.secondary}/>, accent:Colors.secondary },
          ].map((item,i) => (
            <Animated.View key={item.title} entering={FadeInDown.delay(i*120).duration(500)}>
              <LinearGradient colors={['rgba(124,58,237,0.10)','rgba(16,185,129,0.05)']} style={styles.techCard}>
                <View style={[styles.techCardAccentBar,{backgroundColor:item.accent}]} />
                <View style={styles.techCardIconWrap}>{item.icon}</View>
                <Text style={styles.techCardTitle}>{item.title}</Text>
                <Text style={styles.techCardDesc}>{item.desc}</Text>
              </LinearGradient>
            </Animated.View>
          ))}
        </View>
      </View>

      {/* ── LESSONS ── */}
      <View style={styles.section}>
        <Animated.View entering={FadeInDown.duration(500)} style={{alignItems:'center',marginBottom:Spacing.lg}}>
          <Text style={styles.sectionTitleLarge}><Text style={{color:Colors.primary}}>Pelajaran</Text>{' '}<Text style={{color:Colors.foreground}}>yang Kami Pelajari</Text></Text>
          <SectionDivider />
          <Text style={[styles.sectionDesc,{textAlign:'center'}]}>Menguasai berbagai teknologi modern untuk membangun aplikasi dan sistem yang inovatif.</Text>
        </Animated.View>
        <View style={styles.lessonsGrid}>
          {[
            { icon:<CodeIcon size={36} color="#f97316"/>,      title:'Web Development', desc:'Membangun website modern dengan Laravel.', tags:[{label:'Laravel',color:'#ef4444',bg:'rgba(239,68,68,0.15)'}],                                                                          glowColor:'rgba(249,115,22,0.15)' },
            { icon:<DatabaseIcon size={36} color={Colors.secondary}/>, title:'Database',        desc:'Mengelola data dengan sistem database relasional dan non-relasional.', tags:[{label:'MySQL',color:'#60a5fa',bg:'rgba(96,165,250,0.15)'},{label:'PhpMyAdmin',color:'#facc15',bg:'rgba(250,204,21,0.15)'}], glowColor:'rgba(16,185,129,0.15)' },
            { icon:<CpuIcon size={36} color="#60a5fa"/>,       title:'Robotic',         desc:'Perancangan, pembuatan, dan penggunaan robot.', tags:[{label:'C++',color:'#60a5fa',bg:'rgba(96,165,250,0.15)'}],                                                                          glowColor:'rgba(96,165,250,0.15)' },
          ].map((item,i) => (
            <Animated.View key={item.title} entering={FadeInDown.delay(i*100).duration(450)}>
              <LinearGradient colors={['rgba(124,58,237,0.10)','rgba(16,185,129,0.05)']} style={[styles.lessonCard,{shadowColor:item.glowColor}]}>
                <View style={[styles.lessonIconCircle,{backgroundColor:item.glowColor}]}>{item.icon}</View>
                <Text style={styles.lessonTitle}>{item.title}</Text>
                <Text style={styles.lessonDesc}>{item.desc}</Text>
                <View style={styles.tagRow}>
                  {item.tags.map(tag => (
                    <View key={tag.label} style={[styles.tag,{backgroundColor:tag.bg,borderColor:tag.color+'60'}]}>
                      <Text style={[styles.tagText,{color:tag.color}]}>{tag.label}</Text>
                    </View>
                  ))}
                </View>
              </LinearGradient>
            </Animated.View>
          ))}
        </View>
      </View>

      {/* ── QUICK ACCESS ── */}
      <View style={styles.section}>
        <Animated.View entering={FadeInDown.duration(500)} style={{alignItems:'center',marginBottom:Spacing.lg}}>
          <Text style={styles.sectionTitleLarge}><Text style={{color:Colors.primary}}>Lihat Lainnya</Text></Text>
          <SectionDivider />
        </Animated.View>
        <View style={styles.quickGrid}>
          {[
            { icon:<UsersIcon size={72} color={Colors.primary}/>, iconBg:'rgba(124,58,237,0.10)', title:'Data Siswa & Guru', desc:'Lihat daftar murid dan guru XI RPL 2.', btnColors:['#6d28d9','#5b21b6'] as const, label:'See the Students', route:'/students' as const, gradient:['rgba(124,58,237,0.12)','rgba(16,185,129,0.06)'] as const, border:'rgba(124,58,237,0.25)' },
            { icon:<CalendarIcon size={72} color={Colors.secondary}/>, iconBg:'rgba(16,185,129,0.12)', title:'Jadwal Pelajaran', desc:'Lihat jadwal pelajaran dan jadwal piket XI RPL 2.', btnColors:['#059669','#047857'] as const, label:'See Schedule', route:'/schedule' as const, gradient:['rgba(16,185,129,0.12)','rgba(124,58,237,0.06)'] as const, border:'rgba(16,185,129,0.25)' },
          ].map((item,i) => (
            <Animated.View key={item.title} entering={FadeInDown.delay(i*100+100).duration(450)} style={[styles.quickCardWrap,{borderColor:item.border}]}>
              <LinearGradient colors={item.gradient} style={styles.quickCard}>
                <View style={[styles.quickIconCircle,{backgroundColor:item.iconBg}]}>{item.icon}</View>
                <Text style={styles.quickTitle}>{item.title}</Text>
                <Text style={styles.quickDesc}>{item.desc}</Text>
                <PressCard onPress={() => router.push(item.route)} style={{width:'100%'}}>
                  <LinearGradient colors={item.btnColors} style={styles.btnSmall} start={{x:0,y:0}} end={{x:1,y:1}}>
                    <Text style={styles.btnSmallText}>{item.label}</Text>
                    <ArrowRightIcon size={14} color={Colors.foreground} />
                  </LinearGradient>
                </PressCard>
              </LinearGradient>
            </Animated.View>
          ))}
        </View>
      </View>

      {/* ── FOOTER ── */}
      <View style={styles.footer}>
        <LinearGradient colors={['transparent','rgba(124,58,237,0.08)']} style={styles.footerGrad}>
          <View style={styles.footerDivider} />
          <View style={styles.footerContent}>
            <LinearGradient colors={['#7c3aed','#10b981']} start={{x:0,y:0}} end={{x:1,y:0}} style={styles.footerBadge}>
              <CodeIcon size={18} color="#fff" />
            </LinearGradient>
            <Text style={styles.footerTitle}>XI RPL 2 SMK INFOKOM</Text>
            <Text style={styles.footerSub}>Rekayasa Perangkat Lunak - Membangun Masa Depan Digital</Text>
            <View style={styles.footerDividerSmall} />
            <View style={styles.footerAwardRow}>
              <Text style={styles.footerCopy}>XI RPL 2 All rights reserved</Text>
            </View>
            <Text style={styles.footerMade}>Made by BadutZY, Claude & Lovable</Text>
          </View>
        </LinearGradient>
      </View>
    </AnimatedScrollView>
  );
}

const styles = StyleSheet.create({
  container:{flex:1,backgroundColor:Colors.background},
  hero:{height:600,alignItems:'center',justifyContent:'center',position:'relative',overflow:'hidden'},
  heroContent:{alignItems:'center',paddingHorizontal:Spacing.lg,zIndex:2},
  heroBadgeWrap:{marginBottom:Spacing.lg+4,alignItems:'center',justifyContent:'center'},
  heroBadgeGrad:{padding:Spacing.md+2,borderRadius:BorderRadius.lg,borderWidth:1,borderColor:'rgba(124,58,237,0.45)',overflow:'hidden'},
  heroLabelWrap:{alignItems:'center',marginBottom:6},
  heroLabel:{flexDirection:'row',alignItems:'center',paddingHorizontal:14,paddingVertical:5,borderRadius:BorderRadius.full,borderWidth:1,borderColor:'rgba(124,58,237,0.3)',gap:4},
  heroLabelText:{fontFamily:Typography.bodyMedium,fontSize:12,color:Colors.secondaryLight,letterSpacing:1},
  heroClass:{fontFamily:Typography.heading,fontSize:50,color:Colors.primary,textAlign:'center',marginBottom:Spacing.md,textShadowColor:'rgba(124,58,237,0.5)',textShadowOffset:{width:0,height:4},textShadowRadius:20},
  heroDesc:{fontFamily:Typography.body,fontSize:15,color:`${Colors.foreground}CC`,textAlign:'center',maxWidth:320,lineHeight:23,marginBottom:Spacing.lg},
  heroButtons:{flexDirection:'row',gap:Spacing.sm,flexWrap:'wrap',justifyContent:'center',marginBottom:Spacing.lg},
  scrollDownInner:{width:44,height:44,borderRadius:22,backgroundColor:'rgba(255,255,255,0.08)',borderWidth:1,borderColor:'rgba(255,255,255,0.15)',alignItems:'center',justifyContent:'center',transform:[{rotate:'90deg'}]},
  btnPrimary:{flexDirection:'row',alignItems:'center',gap:Spacing.xs,paddingHorizontal:Spacing.lg,paddingVertical:13,borderRadius:BorderRadius.md},
  btnPrimaryText:{fontFamily:Typography.bodyMedium,fontSize:14,color:Colors.foreground},
  btnOutline:{flexDirection:'row',alignItems:'center',gap:Spacing.xs,paddingHorizontal:Spacing.lg,paddingVertical:13,borderRadius:BorderRadius.md,borderWidth:1,borderColor:'rgba(16,185,129,0.4)',backgroundColor:'rgba(16,185,129,0.08)'},
  btnOutlineText:{fontFamily:Typography.bodyMedium,fontSize:14,color:Colors.secondaryLight},
  btnSmall:{flexDirection:'row',alignItems:'center',justifyContent:'center',gap:Spacing.xs,paddingHorizontal:Spacing.md,paddingVertical:11,borderRadius:BorderRadius.md,width:'100%'},
  btnSmallText:{fontFamily:Typography.bodyMedium,fontSize:13,color:Colors.foreground},
  statsRow:{flexDirection:'row',paddingHorizontal:Spacing.md,gap:Spacing.sm,marginTop:-Spacing.lg,marginBottom:Spacing.lg},
  statCard:{flex:1,borderRadius:BorderRadius.lg,overflow:'hidden',borderWidth:1,borderColor:Colors.cardBorder},
  statCardInner:{padding:Spacing.md,alignItems:'center'},
  statValue:{fontFamily:Typography.heading,fontSize:28},
  statLabel:{fontFamily:Typography.body,fontSize:10,color:Colors.mutedForeground,textAlign:'center',marginTop:2},
  section:{paddingHorizontal:Spacing.md,paddingVertical:Spacing.xl},
  sectionTitle:{fontFamily:Typography.heading,fontSize:26,color:Colors.foreground,textAlign:'center',marginBottom:Spacing.sm},
  sectionTitleLarge:{fontFamily:Typography.heading,fontSize:28,textAlign:'center',marginBottom:Spacing.sm},
  sectionDesc:{fontFamily:Typography.body,fontSize:14,color:Colors.mutedForeground,textAlign:'center',lineHeight:21,marginBottom:Spacing.lg},
  divider:{alignItems:'center',marginVertical:Spacing.sm},
  dividerLine:{width:70,height:3,borderRadius:2},
  cardGrid:{gap:Spacing.md},
  techCard:{borderRadius:BorderRadius.lg,padding:Spacing.lg,position:'relative',overflow:'hidden',borderWidth:1,borderColor:Colors.cardBorder,alignItems:'center'},
  techCardAccentBar:{position:'absolute',top:0,left:0,width:4,height:'100%',borderTopLeftRadius:BorderRadius.lg,borderBottomLeftRadius:BorderRadius.lg},
  techCardIconWrap:{marginBottom:Spacing.sm},
  techCardTitle:{fontFamily:Typography.heading,fontSize:17,color:Colors.foreground,textAlign:'center',marginBottom:Spacing.sm},
  techCardDesc:{fontFamily:Typography.body,fontSize:13,color:Colors.mutedForeground,textAlign:'center',lineHeight:20},
  lessonsGrid:{gap:Spacing.md},
  lessonCard:{borderRadius:BorderRadius.lg,padding:Spacing.lg,alignItems:'center',borderWidth:1,borderColor:Colors.cardBorder,shadowOffset:{width:0,height:8},shadowOpacity:1,shadowRadius:20,elevation:8},
  lessonIconCircle:{width:80,height:80,borderRadius:40,alignItems:'center',justifyContent:'center',marginBottom:Spacing.md},
  lessonTitle:{fontFamily:Typography.heading,fontSize:18,color:Colors.foreground,marginBottom:Spacing.sm,textAlign:'center'},
  lessonDesc:{fontFamily:Typography.body,fontSize:13,color:Colors.mutedForeground,textAlign:'center',marginBottom:Spacing.md,lineHeight:20},
  tagRow:{flexDirection:'row',gap:Spacing.xs,flexWrap:'wrap',justifyContent:'center'},
  tag:{borderRadius:BorderRadius.full,borderWidth:1,paddingHorizontal:10,paddingVertical:4},
  tagText:{fontFamily:Typography.body,fontSize:11,fontWeight:'600'},
  galleryGrid:{flexDirection:'row',flexWrap:'wrap',gap:7,justifyContent:'space-between'},
  galleryItem:{width:(SCREEN_W-32-14)/3,aspectRatio:0.85,borderRadius:BorderRadius.md,overflow:'hidden',borderWidth:1,borderColor:Colors.cardBorder},
  galleryImg:{width:'100%',height:'100%'},
  quickGrid:{gap:Spacing.md},
  quickCardWrap:{borderRadius:BorderRadius.xl,overflow:'hidden',borderWidth:1},
  quickCard:{padding:Spacing.lg,alignItems:'center',gap:Spacing.sm},
  quickIconCircle:{width:100,height:100,borderRadius:50,alignItems:'center',justifyContent:'center',marginBottom:Spacing.sm},
  quickTitle:{fontFamily:Typography.heading,fontSize:18,color:Colors.foreground,textAlign:'center'},
  quickDesc:{fontFamily:Typography.body,fontSize:13,color:Colors.mutedForeground,textAlign:'center',lineHeight:20,marginBottom:Spacing.sm},
  footer:{overflow:'hidden'},
  footerGrad:{paddingHorizontal:Spacing.lg,paddingBottom:Spacing.xxl,paddingTop:0},
  footerDivider:{height:1,backgroundColor:Colors.border,marginBottom:Spacing.lg},
  footerDividerSmall:{height:1,width:40,backgroundColor:Colors.border,marginVertical:Spacing.sm},
  footerContent:{alignItems:'center',gap:4},
  footerBadge:{width:40,height:40,borderRadius:20,alignItems:'center',justifyContent:'center',marginBottom:Spacing.sm},
  footerTitle:{fontFamily:Typography.heading,fontSize:18,color:Colors.primary,textAlign:'center'},
  footerSub:{fontFamily:Typography.body,fontSize:13,color:Colors.mutedForeground,textAlign:'center',marginBottom:Spacing.sm,lineHeight:20},
  footerAwardRow:{flexDirection:'row',alignItems:'center',gap:6},
  footerCopy:{fontFamily:Typography.body,fontSize:12,color:Colors.mutedForeground,textAlign:'center'},
  footerMade:{fontFamily:Typography.body,fontSize:11,color:`${Colors.mutedForeground}70`,textAlign:'center'},
});