import { router } from 'expo-router';
import { ImageBackground, Pressable, StyleSheet, Text, View } from 'react-native';

export default function SplashScreen() {
  return (
    <ImageBackground
      source={require('../assets/images/dungeondoor.png')}
      style={styles.bg}
      resizeMode="cover"
    >
      <View style={styles.container}>
        {/* Title */}
        <View style={styles.titleBlock}>
          <Text style={styles.title}>FAMILY GUILD</Text>
          <Text style={styles.subtitle}>PREMIUM MERCANTILE & SHOPPING</Text>
        </View>

        {/* Press Start button */}
        <View style={styles.btnWrapper}>
          <Pressable
            style={({ pressed }) => [styles.btn, pressed && styles.btnPressed]}
            onPress={() => router.replace('/login')}
          >
            {({ pressed }) => (
              <>
                <View style={[styles.btnShadow, pressed && styles.btnShadowPressed]} />
                <Text style={styles.btnText}>PRESS START</Text>
              </>
            )}
          </Pressable>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerItem}>⚔ DUNGEON READY</Text>
          <Text style={styles.footerItem}>🏪 MARKET OPEN</Text>
        </View>
      </View>

      {/* Corner dots top-left */}
      <View style={styles.cornerDots}>
        <View style={[styles.dot, { backgroundColor: '#9cff93' }]} />
        <View style={[styles.dot, { backgroundColor: '#ff51fa' }]} />
        <View style={[styles.dot, { backgroundColor: '#fffeac' }]} />
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    backgroundColor: '#0e0e0e',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  titleBlock: {
    alignItems: 'center',
    marginBottom: 64,
  },
  title: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 64,
    fontWeight: '900',
    color: '#9cff93',
    letterSpacing: -2,
    lineHeight: 68,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: 'SpaceGrotesk-Regular',
    fontSize: 11,
    fontWeight: '400',
    color: '#ff51fa',
    letterSpacing: 4,
    marginTop: 20,
    opacity: 0.8,
    textAlign: 'center',
  },
  btnWrapper: {
    width: '100%',
    maxWidth: 320,
  },
  btn: {
    backgroundColor: '#9cff93',
    paddingVertical: 18,
    alignItems: 'center',
    position: 'relative',
  },
  btnPressed: {
    transform: [{ translateY: 4 }],
  },
  btnShadow: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: '100%',
    height: '50%',
    backgroundColor: '#006513',
    zIndex: -1,
  },
  btnShadowPressed: {
    bottom: 0,
    right: 0,
  },
  btnText: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 22,
    fontWeight: '900',
    color: '#006413',
    letterSpacing: 4,
  },
  footer: {
    flexDirection: 'row',
    gap: 32,
    marginTop: 80,
    opacity: 0.4,
  },
  footerItem: {
    fontFamily: 'SpaceGrotesk-Regular',
    fontSize: 10,
    color: '#ffffff',
    letterSpacing: 3,
  },
  cornerDots: {
    position: 'absolute',
    top: 32,
    left: 32,
    flexDirection: 'row',
    gap: 4,
  },
  dot: {
    width: 12,
    height: 12,
  },
});