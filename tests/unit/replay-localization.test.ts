import fs from 'fs';
import path from 'path';
import loc, { parsedLanguages, saveLanguage } from '../../loc';
import en from '../../loc/en.json';
import { AvailableLanguages } from '../../loc/languages';

const messages = {
  send: ['legacy_replay_title', 'legacy_replay_warning', 'legacy_replay_accept', 'legacy_check_failed'],
  cc: ['legacy_shared', 'legacy_checking', 'legacy_unknown'],
} as const;
const localeFiles: Record<string, string> = {
  be: 'be@tarask',
  et: 'et_EE',
  ko_kr: 'ko_KR',
  si_lk: 'si_LK',
  sl_si: 'sl_SI',
  sr_rs: 'sr_RS',
};

afterEach(async () => saveLanguage('en'));

it.each(AvailableLanguages)('provides translated replay messages through the actual $value loader', async ({ value }) => {
  await saveLanguage(value);
  expect(parsedLanguages[value]).toBeDefined();
  const filename = localeFiles[value] ?? value;
  const dictionary = JSON.parse(fs.readFileSync(path.join(__dirname, '../../loc', `${filename}.json`), 'utf8')) as typeof en;
  for (const [section, keys] of Object.entries(messages)) {
    for (const key of keys) {
      const translated = dictionary[section as keyof typeof messages] as Record<string, string>;
      expect(Object.prototype.hasOwnProperty.call(translated, key)).toBe(true);
      expect(translated[key].trim()).not.toBe('');
      expect(translated[key]).not.toMatch(/TODO|\uFFFD/);
      expect((loc[section as keyof typeof messages] as Record<string, string>)[key]).toBe(translated[key]);
      if (value !== 'en') {
        expect(translated[key]).not.toBe((en[section as keyof typeof messages] as Record<string, string>)[key]);
      }
    }
  }
  expect(dictionary.send.legacy_replay_title).toContain('Bitcoin Core');
  expect(dictionary.send.legacy_replay_warning).toContain('Bitcoin Core');
  expect(dictionary.send.legacy_replay_warning).toContain('BTC');
  expect(dictionary.send.legacy_check_failed).toContain('mempool.space');
  expect(dictionary.send.legacy_check_failed).toContain('Bitcoin Core');
  expect(dictionary.send.legacy_check_failed).toContain('BTC');
  const vocabulary = fs.readFileSync(path.join(__dirname, '../../loc/vocabulary', `${filename}.md`), 'utf8');
  expect(vocabulary).toContain('| Replay risk |');
});
