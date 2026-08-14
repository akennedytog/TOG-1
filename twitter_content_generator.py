#!/usr/bin/env python3
"""
Deprecated compatibility wrapper.
Canonical content generation now lives in content_refresh_v2.py.
"""

import subprocess
import sys
from pathlib import Path

WORKSPACE = Path('/Users/aleckennedy/.openclaw/workspace')


def main():
    print('⚠️ twitter_content_generator.py is deprecated. Running content_refresh_v2.py instead...')
    result = subprocess.run(['python3', 'content_refresh_v2.py'], cwd=str(WORKSPACE))
    sys.exit(result.returncode)


if __name__ == '__main__':
    main()
