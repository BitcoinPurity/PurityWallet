const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
const yaml = require('js-yaml');

const root = path.resolve(__dirname, '../..');
const android = yaml.load(fs.readFileSync(path.join(root, '.github/workflows/build-release-apk.yml'), 'utf8'));
const ios = yaml.load(fs.readFileSync(path.join(root, '.github/workflows/build-ios-release-pullrequest.yml'), 'utf8'));
let directory;
let environment;

beforeEach(() => {
  directory = fs.mkdtempSync(path.join(os.tmpdir(), 'puritywallet-unsigned-ci-'));
  fs.mkdirSync(path.join(directory, 'bin'));
  environment = {
    PATH: `${path.join(directory, 'bin')}:${process.env.PATH}`,
    GITHUB_OUTPUT: path.join(directory, 'outputs'),
    GITHUB_ENV: path.join(directory, 'environment'),
    PROJECT_VERSION: '1.1.0',
    NEW_BUILD_NUMBER: '1793356831',
    BUILD_NUMBER: '1793356831',
  };
});

afterEach(() => fs.rmSync(directory, { recursive: true, force: true }));

it.each([android, ios])('keeps master/manual builds and removes release-signing credentials and publishing', workflow => {
  expect(workflow.on).toEqual({
    push: { branches: ['master'] },
    workflow_dispatch: null,
  });
  expect(JSON.stringify(workflow)).not.toMatch(/secrets\.(KEYSTORE|APPLE|MATCH|GIT_ACCESS_TOKEN|GIT_URL|ITC_TEAM|KEYCHAIN|APP_STORE)/);
  expect(JSON.stringify(workflow)).not.toMatch(
    /create_temp_keychain|setup_provisioning_profiles|delete_temp_keychain|upload_to_testflight/,
  );
});

it.each([false, true])('builds an unsigned APK without credentials and propagates Gradle failure: %s', fail => {
  const step = android.jobs.buildReleaseApk.steps.find(item => item.id === 'build_apk');
  expect(step).toBeDefined();
  fs.mkdirSync(path.join(directory, 'android/app'), { recursive: true });
  fs.writeFileSync(path.join(directory, 'android/app/build.gradle'), 'versionCode 2\nversionName "1.1.0"\n');
  fs.writeFileSync(
    path.join(directory, 'android/gradlew'),
    `#!/bin/bash\nset -eu\nprintf '%s\\n' "$@" > gradle-arguments.txt\n${
      fail ? 'exit 23' : 'mkdir -p app/build/outputs/apk/release\nprintf apk > app/build/outputs/apk/release/app-release-unsigned.apk'
    }\n`,
    { mode: 0o755 },
  );
  const result = spawnSync('bash', ['-e', '-o', 'pipefail', '-c', step.run], {
    cwd: directory,
    env: environment,
    encoding: 'utf8',
  });
  if (fail) {
    expect(result.status).not.toBe(0);
    expect(fs.existsSync(environment.GITHUB_OUTPUT)).toBe(false);
    return;
  }
  expect(result.status).toBe(0);
  expect(fs.readFileSync(path.join(directory, 'android/app/build.gradle'), 'utf8')).toContain('versionCode 1793356831');
  expect(fs.readFileSync(path.join(directory, 'android/gradle-arguments.txt'), 'utf8')).toContain(
    '-PpuritywalletInternalTestSigning=false',
  );
  const output = fs.readFileSync(environment.GITHUB_OUTPUT, 'utf8').trim().split('=')[1];
  expect(output).toMatch(/PurityWallet-1\.1\.0-1793356831-unsigned\.apk$/);
  expect(fs.readFileSync(path.join(directory, output), 'utf8')).toBe('apk');
  const upload = android.jobs.buildReleaseApk.steps.find(item => item.name === 'Upload APK as artifact');
  expect(upload.with.name).toBe('unsigned-apk');
  expect(upload.with.path).toMatch(/^\$\{\{ steps\.build_apk\.outputs\.apk_path \}\}$/);
});

it.each([false, true])('archives iOS without signing or IPA export and propagates Xcode failure: %s', fail => {
  expect(ios.jobs.build.env.SKIP_APP_STORE_CONNECT_AUTH).toBe('1');
  expect(ios.jobs['testflight-upload']).toBeUndefined();
  const step = ios.jobs.build.steps.find(item => item.name === 'Build Unsigned iOS Archive');
  expect(step).toBeDefined();
  fs.writeFileSync(
    path.join(directory, 'bin/xcodebuild'),
    `#!/bin/bash\nset -eu\nprintf '%s\\n' "$@" > xcode-arguments.txt\n${
      fail
        ? 'exit 24'
        : 'while [ "$#" -gt 0 ]; do\nif [ "$1" = "-archivePath" ]; then shift; archive="$1"; fi\nshift\ndone\nmkdir -p "$archive/Products/Applications/BlueWallet.app"\nprintf app > "$archive/Products/Applications/BlueWallet.app/BlueWallet"'
    }\n`,
    { mode: 0o755 },
  );
  const result = spawnSync('bash', ['-e', '-o', 'pipefail', '-c', step.run], {
    cwd: directory,
    env: environment,
    encoding: 'utf8',
  });
  if (fail) {
    expect(result.status).not.toBe(0);
    expect(fs.existsSync(environment.GITHUB_OUTPUT)).toBe(false);
    return;
  }
  expect(result.status).toBe(0);
  const args = fs.readFileSync(path.join(directory, 'xcode-arguments.txt'), 'utf8');
  expect(args).toContain('generic/platform=iOS');
  expect(args).toContain('CODE_SIGNING_ALLOWED=NO');
  expect(args).toContain('CODE_SIGNING_REQUIRED=NO');
  expect(args).toContain('CODE_SIGN_IDENTITY=\n');
  expect(args).not.toContain('-exportArchive');
  const output = fs.readFileSync(environment.GITHUB_OUTPUT, 'utf8').trim().split('=')[1];
  expect(output).toMatch(/PurityWallet-1\.1\.0-1793356831-unsigned\.xcarchive\.tar\.gz$/);
  const archive = spawnSync('tar', ['-tzf', path.join(directory, output)], {
    encoding: 'utf8',
  });
  expect(archive.status).toBe(0);
  expect(archive.stdout).toContain('Products/Applications/BlueWallet.app/BlueWallet');
  const upload = ios.jobs.build.steps.find(item => item.name === 'Upload Unsigned iOS Archive');
  expect(upload.with.name).toBe('unsigned-ios-archive');
  expect(upload.with.path).toMatch(/^\$\{\{ steps\.build_app\.outputs\.archive_path \}\}$/);
});
