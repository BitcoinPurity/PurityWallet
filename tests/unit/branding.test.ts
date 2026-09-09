import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

const projectRoot = path.resolve(__dirname, '../..');
const read = (relativePath: string) => fs.readFileSync(path.join(projectRoot, relativePath), 'utf8');
const pngDimensions = (relativePath: string) => {
  const png = fs.readFileSync(path.join(projectRoot, relativePath));
  return { width: png.readUInt32BE(16), height: png.readUInt32BE(20) };
};
const sha256 = (relativePath: string) =>
  crypto
    .createHash('sha256')
    .update(fs.readFileSync(path.join(projectRoot, relativePath)))
    .digest('hex');

describe('PurityWallet visible branding', () => {
  it('uses the PurityWallet display name on iOS and Android', () => {
    expect(read('ios/BlueWallet/Info.plist')).toContain('<string>PurityWallet</string>');
    expect(read('android/app/src/main/res/values/strings.xml')).toContain('<string name="app_name">PurityWallet</string>');
    expect(read('android/app/src/main/AndroidManifest.xml')).toContain('android:label="PurityWallet Settings"');
    expect(read('blue_modules/notifications.ts')).toContain("name: 'PurityWallet notifications'");
    expect(read('screen/settings/About.tsx')).toContain('https://github.com/BitcoinPurity/PurityWallet');
  });

  it('does not expose the old brand in localized app copy', () => {
    const localeFiles = fs.readdirSync(path.join(projectRoot, 'loc')).filter(file => file.endsWith('.json'));

    for (const localeFile of localeFiles) {
      const locale = read(path.join('loc', localeFile));
      expect(locale).not.toMatch(/BlueWallet|Blue Wallet/);
    }
  });

  it('uses the PurityWallet brand in the donation prompt', () => {
    expect(read('loc/en.json')).toContain('"donate_description": "Help us keep PurityWallet free!"');
  });

  it('routes donations through the on-chain send flow with a replaceable recipient', () => {
    const settings = read('screen/settings/Settings.tsx');

    expect(settings).toContain("PURITY_WALLET_DONATION_ADDRESS = 'REPLACE_WITH_PURITYWALLET_DONATION_ADDRESS'");
    expect(settings).toContain("navigate('SelectWallet'");
    expect(settings).toContain('onChainRequireSend: true');
    expect(settings).toContain("navigate('SendDetailsRoot'");
    expect(settings).toContain('address: PURITY_WALLET_DONATION_ADDRESS');
    expect(settings).not.toContain('https://donate.bluewallet.io/');
  });

  it('provides correctly sized canonical app artwork', () => {
    expect(pngDimensions('img/puritywallet-logo.png')).toEqual({ width: 1024, height: 1024 });
    expect(pngDimensions('ios/BlueWallet/Images.xcassets/AppIcon.appiconset/BlueWallet-1024.png')).toEqual({
      width: 1024,
      height: 1024,
    });
    expect(pngDimensions('android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png')).toEqual({ width: 192, height: 192 });
  });

  it('pins the blue PurityWallet master icon', () => {
    expect(sha256('img/puritywallet-logo.png')).toBe('4c77b0cf5d54172a5194ba6f97c616f6848e0f52e3ac3e916630c24a906f0111');
  });

  it('uses an independent Android application identity while preserving iOS compatibility', () => {
    expect(read('android/app/build.gradle')).toContain('namespace "org.bitcoinpurity.puritywallet"');
    expect(read('android/app/build.gradle')).toContain('applicationId "org.bitcoinpurity.puritywallet"');
    expect(read('android/app/google-services.json')).toContain('"package_name": "org.bitcoinpurity.puritywallet"');
    expect(read('package.json')).toContain('"javaPackageName": "org.bitcoinpurity.puritywallet"');
    expect(read('react-native.config.js')).toContain("javaPackageName: 'org.bitcoinpurity.puritywallet'");
    expect(read('package.json')).toContain('am force-stop org.bitcoinpurity.puritywallet');
    expect(read('package.json')).toContain('adb uninstall org.bitcoinpurity.puritywallet');
    expect(read('screen/settings/About.tsx')).toContain('details?id=org.bitcoinpurity.puritywallet');
    expect(read('ios/BlueWallet/Info.plist')).toContain('<string>bluewallet</string>');
    expect(read('ios/BlueWallet/AppDelegate.swift')).toContain('self.moduleName = "BlueWallet"');
    expect(read('index.js')).toContain("AppRegistry.registerComponent('BlueWallet'");
  });
});
