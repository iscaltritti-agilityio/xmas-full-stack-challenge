#!/usr/bin/env python3
"""
Entry point for running the Python backend from any directory.
This allows running 'python backend-python/run.py' from the project root.
"""

import sys
import os

backend_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, backend_dir)

from src.main import main

if __name__ == "__main__":
    main()

