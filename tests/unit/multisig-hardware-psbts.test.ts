import assert from 'assert';
import * as bitcoin from 'bitcoinjs-lib';

import ecc from '../../blue_modules/noble_ecc';
import { decodeUR } from '../../blue_modules/ur';
import fixtures from './fixtures/multisig-hardware-psbts.json';

describe('multisig hardware signing vectors', () => {
  it('decodes, combines and verifies Passport and Keystone signatures without live funds', () => {
    const passportHex = decodeUR(fixtures.passport);
    const keystoneHex = decodeUR(fixtures.keystone);
    assert.ok(typeof passportHex === 'string');
    assert.ok(typeof keystoneHex === 'string');
    const passport = bitcoin.Psbt.fromHex(passportHex);
    const keystone = bitcoin.Psbt.fromHex(keystoneHex);

    expect(passport.data.inputs[0].partialSig).toHaveLength(1);
    expect(keystone.data.inputs[0].partialSig).toHaveLength(1);
    const combined = passport.combine(keystone);
    expect(combined.data.inputs[0].partialSig).toHaveLength(2);
    expect(combined.validateSignaturesOfAllInputs((publicKey, hash, signature) => ecc.verify(hash, publicKey, signature))).toBe(true);
    const transaction = combined.finalizeAllInputs().extractTransaction();

    expect(transaction.ins).toHaveLength(1);
    expect(transaction.outs).toHaveLength(2);
    expect(bitcoin.address.fromOutputScript(transaction.outs[0].script)).toBe('bc1q063ctu6jhe5k4v8ka99qac8rcm2tzjjnuktyrl');
    expect(transaction.outs[0].value).toBe(50000n);
  });
});
