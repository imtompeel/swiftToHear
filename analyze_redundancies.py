#!/usr/bin/env python3
"""
Script to analyse en.json for redundant content and potential consolidation opportunities.
"""

import json
import re
from collections import defaultdict, Counter
from typing import Dict, List, Tuple, Set
import difflib

def load_json_file(file_path: str) -> Dict:
    """Load and parse the JSON file."""
    with open(file_path, 'r', encoding='utf-8') as f:
        return json.load(f)

def flatten_dict(d: Dict, parent_key: str = '', sep: str = '.') -> Dict[str, str]:
    """Flatten nested dictionary to key-value pairs."""
    items = []
    for k, v in d.items():
        new_key = f"{parent_key}{sep}{k}" if parent_key else k
        if isinstance(v, dict):
            items.extend(flatten_dict(v, new_key, sep=sep).items())
        else:
            items.append((new_key, str(v)))
    return dict(items)

def find_exact_duplicates(flattened_dict: Dict[str, str]) -> List[Tuple[str, str, List[str]]]:
    """Find exact duplicate values."""
    value_to_keys = defaultdict(list)
    for key, value in flattened_dict.items():
        # Skip shared components and interpolation patterns
        if key.startswith('shared.') or '{{shared.' in value:
            continue
        value_to_keys[value].append(key)
    
    duplicates = []
    for value, keys in value_to_keys.items():
        if len(keys) > 1:
            duplicates.append((value, len(keys), keys))
    
    return sorted(duplicates, key=lambda x: x[1], reverse=True)

def analyze_redundancies(file_path: str):
    """Main analysis function."""
    print("🔍 Analysing en.json for redundancies...\n")
    
    # Load and flatten the JSON
    data = load_json_file(file_path)
    flattened = flatten_dict(data)
    
    print(f"📊 Total entries: {len(flattened)}")
    
    # Count shared component usage
    shared_usage = 0
    for key, value in flattened.items():
        if '{{shared.' in value:
            shared_usage += 1
    
    print(f"🔄 Shared component references: {shared_usage}")
    
    # 1. Find exact duplicates
    print("\n" + "="*60)
    print("🔴 EXACT DUPLICATES")
    print("="*60)
    
    duplicates = find_exact_duplicates(flattened)
    if duplicates:
        for value, count, keys in duplicates[:10]:  # Show top 10
            print(f"\n📝 Value (appears {count} times):")
            print(f"   '{value}'")
            print(f"   Keys: {', '.join(keys)}")
    else:
        print("✅ No exact duplicates found!")
    
    # Summary
    print("\n" + "="*60)
    print("💡 REFACTORING SUMMARY")
    print("="*60)
    
    if duplicates:
        print(f"\n🔴 Remaining duplicates: {len(duplicates)}")
        total_duplicates = sum(count for _, count, _ in duplicates)
        print(f"   Total duplicate instances: {total_duplicates}")
    else:
        print("\n✅ All duplicates have been eliminated!")
    
    print(f"\n🔄 Shared component system implemented")
    print(f"   - {shared_usage} references to shared components")
    print(f"   - Reduced redundancy through interpolation")

if __name__ == "__main__":
    analyze_redundancies("src/i18n/locales/en.json")


