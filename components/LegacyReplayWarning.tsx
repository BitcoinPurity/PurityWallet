import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LegacyUtxoStatus } from '../blue_modules/legacy-chain';
import loc from '../loc';
import { useTheme } from './themes';

export default function LegacyReplayWarning({ status, detailed = false }: { status: LegacyUtxoStatus | 'checking'; detailed?: boolean }) {
  const { colors } = useTheme();
  if (status === 'absent') return null;

  const message =
    status === 'shared'
      ? detailed
        ? loc.send.legacy_replay_warning
        : loc.cc.legacy_shared
      : status === 'checking'
        ? loc.cc.legacy_checking
        : detailed
          ? loc.send.legacy_check_failed
          : loc.cc.legacy_unknown;

  return (
    <View style={[styles.container, detailed && styles.detailed, detailed && { backgroundColor: colors.redBG }]}>
      <Text
        testID={`LegacyReplay-${status}`}
        accessibilityRole={status === 'shared' ? 'alert' : undefined}
        style={[
          styles.text,
          {
            color: status === 'checking' ? colors.alternativeTextColor : colors.redText,
          },
        ]}
      >
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 4 },
  detailed: { padding: 12, borderRadius: 8, marginVertical: 12 },
  text: { fontSize: 13, fontWeight: '600' },
});
