import loc, { saveLanguage } from '../../loc';
import { AvailableLanguages } from '../../loc/languages';
import en from '../../loc/en.json';
import zhCn from '../../loc/zh_cn.json';
import zhTw from '../../loc/zh_tw.json';

const notices: Record<string, string> = {
  en: en.settings.push_notifications_explanation,
  zh_cn: zhCn.settings.push_notifications_explanation,
  zh_tw: zhTw.settings.push_notifications_explanation,
};

afterEach(async () => saveLanguage('en'));

it.each(AvailableLanguages)('loads the corrected notification disclosure or English fallback for $value', async ({ value }) => {
  await saveLanguage(value);
  const notice = loc.settings.push_notifications_explanation;
  expect(notice).toBe(notices[value] ?? notices.en);
  expect(notice).toContain('notifications.bitcoinpurity.org');
  expect(notice).toContain('https://github.com/PurityWallet/PurityWallet/blob/master/docs/privacy-policy.md');
  expect(notice).toContain('90');
});
