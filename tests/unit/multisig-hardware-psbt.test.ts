import { Psbt, address } from 'bitcoinjs-lib';
import { BlueURDecoder, decodeUR } from '../../blue_modules/ur';
import { MultisigHDWallet } from '../../class/wallets/multisig-hd-wallet';
import { combinePSBTs } from '../../util/combinePSBTs';
import ecc from '../../blue_modules/noble_ecc';
import fixture from './fixtures/multisig-hardware-psbt.json';

const decode = (parts: string[]) => {
  const decoder = new BlueURDecoder();
  parts.forEach(part => decoder.receivePart(part));
  expect(decoder.isComplete()).toBe(true);
  return decoder.toString();
};

it('combines the historical hardware signatures without relying on live Bitcoin funds', () => {
  const wallet = new MultisigHDWallet();
  wallet.setSecret(Buffer.from(decodeUR(fixture.wallet) as string, 'hex').toString());
  const passport = Psbt.fromBase64(decode(fixture.passport));
  const both = Psbt.fromBase64(decode(fixture.passportAndKeystone));
  const unsigned = passport.clone();
  unsigned.data.inputs.forEach(input => delete input.partialSig);
  expect(wallet.calculateHowManySignaturesWeHaveFromPsbt(unsigned)).toBe(0);
  expect(wallet.calculateHowManySignaturesWeHaveFromPsbt(passport)).toBe(1);
  const combined = combinePSBTs({
    psbtBase64: unsigned.toBase64(),
    newPSBTBase64: passport.toBase64(),
  });
  combined.combine(both);
  expect(wallet.calculateHowManySignaturesWeHaveFromPsbt(combined)).toBe(2);
  expect(combined.validateSignaturesOfAllInputs((pubkey, hash, signature) => ecc.verify(hash, pubkey, signature))).toBe(true);
  const tx = combined.finalizeAllInputs().extractTransaction();
  expect(tx.ins).toHaveLength(1);
  expect(tx.outs).toHaveLength(2);
  expect(address.fromOutputScript(tx.outs[0].script)).toBe('bc1q063ctu6jhe5k4v8ka99qac8rcm2tzjjnuktyrl');
  expect(tx.outs[0].value).toBe(50000n);
});
