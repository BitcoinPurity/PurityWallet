import unittest

from host_config import rpc_config


AUTH = 'puritywallet_notifications:' + '1' * 32 + '$' + '2' * 64


class RpcConfigurationTests(unittest.TestCase):
    def test_preserves_existing_users_when_adding_the_first_whitelist(self):
        previous = 'server=1\nrpcpassword=test-only\n[main]\nrpcbind=127.0.0.1\n'
        updated = rpc_config(previous, AUTH)
        self.assertIn('rpcpassword=test-only\n', updated)
        self.assertIn('rpcwhitelistdefault=0\n', updated)
        self.assertLess(updated.index('rpcauth=puritywallet_notifications:'), updated.index('[main]'))
        self.assertNotIn('stop,', updated)
        self.assertIn('rpcwhitelist=puritywallet_notifications:getblockchaininfo,getblockcount,getblockhash,getblock,getrawmempool,getrawtransaction\n', updated)

    def test_preserves_existing_restrictive_whitelist_default(self):
        previous = 'rpcwhitelistdefault=1\nrpcwhitelist=monitor:getblockchaininfo\n'
        updated = rpc_config(previous, AUTH)
        self.assertIn('rpcwhitelistdefault=1\n', updated)
        self.assertNotIn('rpcwhitelistdefault=0', updated)

    def test_is_idempotent_and_preserves_its_existing_default(self):
        updated = rpc_config('server=1\n', AUTH)
        self.assertEqual(rpc_config(updated, AUTH), updated)
        with_other_user = updated + 'rpcwhitelist=monitor:getblockchaininfo\n'
        self.assertIn('rpcwhitelistdefault=0\n', rpc_config(with_other_user, AUTH))

    def test_refuses_to_take_over_an_unmanaged_rpc_identity(self):
        with self.assertRaisesRegex(ValueError, 'already exists'):
            rpc_config('rpcauth=' + AUTH + '\n', AUTH)
        with self.assertRaisesRegex(ValueError, 'markers'):
            rpc_config('# BEGIN PurityWallet notification RPC\n', AUTH)


if __name__ == '__main__':
    unittest.main()
