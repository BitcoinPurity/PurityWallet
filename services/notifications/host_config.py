import argparse
import datetime
import hashlib
import hmac
import json
import os
from pathlib import Path
import re
import secrets
import shutil
import subprocess
import tempfile
from urllib.parse import urlsplit


BEGIN = '# BEGIN PurityWallet notification RPC'
END = '# END PurityWallet notification RPC'
RPC_METHODS = 'getblockchaininfo,getblockcount,getblockhash,getblock,getrawmempool,getrawtransaction'


def rpc_config(previous, auth):
    if not re.fullmatch(r'puritywallet_notifications:[0-9a-f]{32}\$[0-9a-f]{64}', auth):
        raise ValueError('Invalid notification RPC authentication entry')
    if previous.count(BEGIN) != previous.count(END) or previous.count(BEGIN) > 1:
        raise ValueError('Invalid managed RPC configuration markers')
    owned = re.search(re.escape(BEGIN) + r'\n.*?' + re.escape(END) + r'\n?', previous, re.S)
    preserve_zero = bool(owned and 'rpcwhitelistdefault=0' in owned.group())
    remaining = previous[:owned.start()] + previous[owned.end():] if owned else previous
    if re.search(r'(?m)^\s*(?:rpcauth|rpcwhitelist)=puritywallet_notifications:', remaining):
        raise ValueError('Notification RPC identity already exists outside the managed block')
    lines = [BEGIN, 'rpcauth=' + auth, 'rpcwhitelist=puritywallet_notifications:' + RPC_METHODS]
    if not re.search(r'(?m)^\s*rpcwhitelistdefault=', remaining):
        if preserve_zero or not re.search(r'(?m)^\s*rpcwhitelist=', remaining):
            lines.append('rpcwhitelistdefault=0')
    lines.append(END)
    section = re.search(r'(?m)^\s*\[[^\]]+\]', remaining)
    position = section.start() if section else len(remaining)
    return remaining[:position].rstrip('\n') + '\n\n' + '\n'.join(lines) + '\n' + remaining[position:]


def write_credential(path, value):
    with open(path, 'w', opener=lambda name, flags: os.open(name, flags, 0o600)) as stream:
        stream.write(value + '\n')
    path.chmod(0o600)


def configure_database(directory):
    path = directory / 'db-url'
    password = secrets.token_hex(32)
    if path.exists():
        parsed = urlsplit(path.read_text().strip())
        if parsed.scheme != 'mysql' or parsed.username != 'puritywallet_notify' or parsed.hostname != '127.0.0.1' or parsed.path != '/puritywallet_notifications' or not re.fullmatch('[0-9a-f]{64}', parsed.password or ''):
            raise ValueError('Existing database credential does not match this deployment')
        password = parsed.password
    sql = (
        'CREATE DATABASE IF NOT EXISTS puritywallet_notifications CHARACTER SET utf8mb4 COLLATE utf8mb4_bin;\n'
        "CREATE USER IF NOT EXISTS 'puritywallet_notify'@'127.0.0.1' IDENTIFIED BY '" + password + "';\n"
        "GRANT ALL PRIVILEGES ON puritywallet_notifications.* TO 'puritywallet_notify'@'127.0.0.1';\n"
    )
    result = subprocess.run(['mariadb', '--protocol=socket', '--batch'], input=sql, text=True, capture_output=True)
    if result.returncode:
        raise RuntimeError('MariaDB account setup failed; inspect the server privately')
    if not path.exists():
        write_credential(path, f'mysql://puritywallet_notify:{password}@127.0.0.1:3306/puritywallet_notifications')
    return {'database_configured': True}


def configure_rpc(directory, path):
    secret = directory / 'rpc-url'
    password = secrets.token_hex(32)
    if secret.exists():
        parsed = urlsplit(secret.read_text().strip())
        if parsed.username != 'puritywallet_notifications' or parsed.hostname != '127.0.0.1' or parsed.port != 8332 or not re.fullmatch('[0-9a-f]{64}', parsed.password or ''):
            raise ValueError('Existing RPC credential does not match this deployment')
        password = parsed.password
    previous = path.read_text()
    owned = re.search(re.escape(BEGIN) + r'\n.*?' + re.escape(END), previous, re.S)
    auth = None
    if owned:
        match = re.search(r'(?m)^rpcauth=(puritywallet_notifications:([0-9a-f]{32})\$([0-9a-f]{64}))$', owned.group())
        if match and hmac.compare_digest(hmac.new(match[2].encode(), password.encode(), hashlib.sha256).hexdigest(), match[3]):
            auth = match[1]
    if not auth:
        salt = secrets.token_hex(16)
        digest = hmac.new(salt.encode(), password.encode(), hashlib.sha256).hexdigest()
        auth = f'puritywallet_notifications:{salt}${digest}'
    updated = rpc_config(previous, auth)
    if not secret.exists():
        write_credential(secret, f'http://puritywallet_notifications:{password}@127.0.0.1:8332')
    if updated == previous:
        return {'rpc_config_changed': False, 'restart_required': False}
    stamp = datetime.datetime.now(datetime.timezone.utc).strftime('%Y%m%dT%H%M%SZ')
    backup = directory / ('bitcoin.conf.backup-' + stamp)
    shutil.copyfile(path, backup)
    backup.chmod(0o600)
    original_stat = path.stat()
    with tempfile.NamedTemporaryFile('w', dir=path.parent, prefix='.puritywallet-', delete=False) as stream:
        stream.write(updated)
        temporary = Path(stream.name)
    temporary.chmod(original_stat.st_mode & 0o777)
    os.chown(temporary, original_stat.st_uid, original_stat.st_gid)
    os.replace(temporary, path)
    return {'rpc_config_changed': True, 'restart_required': True, 'backup': str(backup)}


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('operation', choices=['database', 'rpc'])
    parser.add_argument('--secrets-dir', type=Path, default=Path('/etc/puritywallet-notifications'))
    parser.add_argument('--node-config', type=Path, default=Path('/home/ubuntu/.bitcoin/bitcoin.conf'))
    args = parser.parse_args()
    if os.geteuid() != 0:
        parser.error('Run as root so credentials remain private')
    args.secrets_dir.mkdir(mode=0o700, parents=True, exist_ok=True)
    args.secrets_dir.chmod(0o700)
    try:
        result = configure_database(args.secrets_dir) if args.operation == 'database' else configure_rpc(args.secrets_dir, args.node_config)
        print(json.dumps(result))
    except Exception as error:
        raise SystemExit(str(error))
