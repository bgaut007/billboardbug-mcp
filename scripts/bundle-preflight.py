import hashlib
import json
import os
import zipfile
from pathlib import Path
from bundle_signatures import has_credential_signature, run_regression_tests

print(f'Signature regression fixtures passed: {run_regression_tests()}')
root = Path.cwd()
output = Path(os.environ['RUNNER_TEMP']) / 'bbb-bundle-output'
extracted = Path(os.environ['RUNNER_TEMP']) / 'bbb-bundle-extracted'
output.mkdir(parents=True, exist_ok=False)
extracted.mkdir(parents=True, exist_ok=False)
manifest = json.loads((root / 'manifest.json').read_text())
package = json.loads((root / 'package.json').read_text())
assert manifest['version'] == package['version']
assert manifest['server']['type'] == 'node'
assert manifest['server']['entry_point'] == 'build/index.js'
assert manifest['server']['mcp_config']['command'] == 'node'
assert manifest['server']['mcp_config']['args'] == ['${__dirname}/build/index.js']
assert manifest['user_config']['billboardbug_api_key']['sensitive'] is True
assert manifest['server']['mcp_config']['env']['BILLBOARDBUG_API_KEY'] == '${user_config.billboardbug_api_key}'
files = []
for name in ['manifest.json', 'package.json', 'package-lock.json', 'README.md', 'LICENSE', 'build', 'node_modules']:
    source = root / name
    assert source.exists(), f'Missing bundle input: {name}'
    assert not source.is_symlink(), f'Symlink bundle input: {name}'
    candidates = sorted(source.rglob('*')) if source.is_dir() else [source]
    for path in candidates:
        relative = path.relative_to(root)
        if any(part.startswith('.') for part in relative.parts):
            continue
        assert not path.is_symlink(), f'Symlink rejected: {relative}'
        if path.is_dir():
            continue
        assert path.is_file(), f'Non-regular file rejected: {relative}'
        assert path.suffix.lower() not in ['.pem', '.key', '.p12', '.pfx'], f'Sensitive-looking file rejected: {relative}'
        assert path.stat().st_size <= 16 * 1024 * 1024, f'Oversized bundle file: {relative}'
        data = path.read_bytes()
        assert not has_credential_signature(data), f'Credential signature requires review: {relative}'
        files.append((relative.as_posix(), data))
assert sum(len(data) for _, data in files) <= 64 * 1024 * 1024
paths = [name for name, _ in files]
assert len(paths) == len(set(paths))
for required in ['manifest.json', 'package.json', 'build/index.js', 'build/media.js']:
    assert required in paths, f'Missing required packaged file: {required}'
archive = output / 'billboardbug-candidate.mcpb'
with zipfile.ZipFile(archive, 'w', compression=zipfile.ZIP_DEFLATED, compresslevel=9) as bundle:
    for name, data in sorted(files):
        info = zipfile.ZipInfo(name, date_time=(2026, 11, 24, 0, 0, 0))
        info.compress_type = zipfile.ZIP_DEFLATED
        info.external_attr = (0o100755 if name == 'build/index.js' else 0o100644) << 16
        bundle.writestr(info, data)
with zipfile.ZipFile(archive) as bundle:
    assert bundle.testzip() is None
    for name in bundle.namelist():
        assert not name.startswith('/') and '..' not in Path(name).parts
    bundle.extractall(extracted)
digest = hashlib.sha256(archive.read_bytes()).hexdigest()
(output / 'SHA256SUMS').write_text(f'{digest}  {archive.name}\n')
inventory = {
    'candidateOnly': True,
    'version': package['version'],
    'sourceCommit': os.environ.get('GITHUB_SHA'),
    'sha256': digest,
    'archiveBytes': archive.stat().st_size,
    'fileCount': len(files),
    'files': [{'path': name, 'bytes': len(data), 'sha256': hashlib.sha256(data).hexdigest()} for name, data in sorted(files)],
    'limits': 'Heuristic signature and path checks only, not a complete secret scan, formal schema validation, signature verification or desktop-host compatibility test. No release or registry metadata updated.'
}
(output / 'inventory.json').write_text(json.dumps(inventory, indent=2) + '\n')
print(json.dumps({key: value for key, value in inventory.items() if key != 'files'}, indent=2))
