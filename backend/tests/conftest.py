import os
import sys

# Add backend root to sys.path so 'app' package is importable during tests
CURRENT_DIR = os.path.dirname(__file__)
BACKEND_ROOT = os.path.abspath(os.path.join(CURRENT_DIR, '..'))
if BACKEND_ROOT not in sys.path:
    sys.path.insert(0, BACKEND_ROOT)

# Load environment variables from .env
try:
    from dotenv import load_dotenv
    load_dotenv(os.path.join(BACKEND_ROOT, '.env'))
except Exception:
    pass
