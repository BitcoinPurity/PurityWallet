import { Platform } from 'react-native';
import Bugsnag from '@bugsnag/react-native';
import DefaultPreference from 'react-native-default-preference';

const GROUP_IO_BLUEWALLET = Platform.OS === 'android' ? 'group.io.bluewallet.bluewallet' : 'group.au.com.bitcoininstitute.puritywallet';
const DO_NOT_TRACK_KEY = 'donottrack';

(async () => {
  try {
    await DefaultPreference.setName(GROUP_IO_BLUEWALLET);
    const doNotTrack = await DefaultPreference.get(DO_NOT_TRACK_KEY);
    if (doNotTrack === '1') return;

    Bugsnag.start();
  } catch (error) {
    // Never let analytics setup crash the app.
    console.error('Failed to initialize Bugsnag:', error);
  }
})();
