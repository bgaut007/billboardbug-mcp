import re

PATTERNS = [
    re.compile(rb'-----BEGIN (?:RSA |EC |OPENSSH |DSA |ENCRYPTED )?PRIVATE KEY-----(?:[ \t\r\n]|\\r|\\n)*(?:[A-Za-z0-9+/=](?:[ \t\r\n]|\\r|\\n)*){32,}'),
    re.compile(rb'AKIA[0-9A-Z]{16}'),
    re.compile(rb'gh[pousr]_[A-Za-z0-9]{30,}'),
    re.compile(rb'github_pat_[A-Za-z0-9_]{30,}'),
    re.compile(rb'sk_live_[A-Za-z0-9]{16,}')
]

def has_credential_signature(data):
    return any(pattern.search(data) for pattern in PATTERNS)

def run_regression_tests():
    payload = b'A' * 64
    cases = [
        ('importer-header-literal', b'pkcs8.indexOf("-----BEGIN PRIVATE KEY-----") !== 0', False),
        ('header-only', b'-----BEGIN PRIVATE KEY-----', False),
        ('pem-shaped-synthetic', b'-----BEGIN PRIVATE KEY-----\n' + payload, True),
        ('escaped-newline-synthetic', b'-----BEGIN PRIVATE KEY-----\\n' + payload, True),
        ('short-line-synthetic', b'-----BEGIN EC PRIVATE KEY-----\n' + b'\n'.join([b'A' * 16] * 4), True),
        ('encrypted-pem-shaped-synthetic', b'-----BEGIN ENCRYPTED PRIVATE KEY-----\n' + payload, True),
        ('public-key-shaped-synthetic', b'-----BEGIN PUBLIC KEY-----\n' + payload, False),
        ('aws-shaped-synthetic', b'AKIA' + b'A' * 16, True),
        ('github-shaped-synthetic', b'ghp_' + b'A' * 36, True),
        ('fine-grained-shaped-synthetic', b'github_pat_' + b'A' * 40, True),
        ('stripe-shaped-synthetic', b'sk_live_' + b'A' * 24, True)
    ]
    for name, data, expected in cases:
        if has_credential_signature(data) != expected:
            raise AssertionError(f'Signature regression failed: {name}')
    return len(cases)
