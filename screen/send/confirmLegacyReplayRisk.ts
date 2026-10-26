import { checkLegacyUtxos, getLegacyReplayStatus, LegacyUtxo } from '../../blue_modules/legacy-chain';
import presentAlert from '../../components/Alert';
import loc from '../../loc';

export async function confirmLegacyReplayRisk(inputs: readonly LegacyUtxo[], isCurrent: () => boolean = () => true): Promise<boolean> {
  const status = getLegacyReplayStatus(inputs, await checkLegacyUtxos(inputs));
  if (!isCurrent()) return false;
  if (status === 'unknown') throw new Error(loc.send.legacy_check_failed);
  if (status !== 'shared') return true;

  return new Promise(resolve => {
    presentAlert({
      title: loc.send.legacy_replay_title,
      message: loc.send.legacy_replay_warning,
      buttons: [
        { text: loc._.cancel, style: 'cancel', onPress: () => resolve(false) },
        {
          text: loc.send.legacy_replay_accept,
          style: 'destructive',
          onPress: () => resolve(true),
        },
      ],
      options: { cancelable: false },
    });
  });
}
