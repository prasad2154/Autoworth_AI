"""
AutoWorth AI — pytest shared fixtures
"""
import os
import sys
import pytest

# Make backend importable from tests/ directory
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))
