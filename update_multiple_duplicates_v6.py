#!/usr/bin/env python3
"""
Script to update another batch of translation duplicates using shared components.
"""

import os
import re
from typing import List, Tuple

# Mapping of old translation keys to new shared component keys
MULTIPLE_DUPLICATES_MAPPINGS_V6 = {
    # Host (2 times)
    'dialectic.creation.join.host': 'shared.common.host',
    'dialectic.join.host': 'shared.common.host',
    
    # Topic (2 times)
    'dialectic.creation.join.topic': 'shared.common.topic',
    'dialectic.join.topic': 'shared.common.topic',
    
    # Created (2 times)
    'dialectic.creation.join.created': 'shared.common.created',
    'dialectic.join.created': 'shared.common.created',
    
    # Current Participants (2 times)
    'dialectic.creation.join.currentParticipants': 'shared.common.currentParticipants',
    'dialectic.join.currentParticipants': 'shared.common.currentParticipants',
    
    # {{current}} of {{total}} participants (2 times)
    'dialectic.creation.join.participantCount': 'shared.common.participantCount',
    'dialectic.join.participantCount': 'shared.common.participantCount',
    
    # Session is currently in progress (2 times)
    'dialectic.creation.join.sessionInProgress': 'shared.common.sessionInProgress',
    'dialectic.join.sessionInProgress': 'shared.common.sessionInProgress',
    
    # Estimated start time (2 times)
    'dialectic.creation.join.estimatedStartTime': 'shared.common.estimatedStartTime',
    'dialectic.join.estimatedStartTime': 'shared.common.estimatedStartTime',
    
    # Session ID (2 times)
    'dialectic.creation.join.sessionId': 'shared.common.sessionId',
    'dialectic.join.sessionId': 'shared.common.sessionId',
    
    # Quick Add Topics (2 times)
    'dialectic.creation.hostTopics.sampleTopics': 'shared.actions.quickAddTopics',
    'dialectic.lobby.topicSuggestions.sampleTopics': 'shared.actions.quickAddTopics',
}

def find_typescript_files(directory: str) -> List[str]:
    """Find all TypeScript/TSX files in the directory."""
    ts_files = []
    for root, dirs, files in os.walk(directory):
        # Skip node_modules and other build directories
        dirs[:] = [d for d in dirs if d not in ['node_modules', 'dist', 'build', '.git']]
        
        for file in files:
            if file.endswith(('.ts', '.tsx')):
                ts_files.append(os.path.join(root, file))
    return ts_files

def update_file_multiple_duplicates_v6(file_path: str) -> Tuple[int, List[str]]:
    """Update multiple translation duplicates in a single file."""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    changes_made = []
    
    # More specific pattern to match t() function calls with proper boundaries
    t_pattern = r"t\(['\"`]([^'\"`]+)['\"`]\)"
    
    # Process matches in reverse order to avoid index shifting issues
    matches = list(re.finditer(t_pattern, content))
    matches.reverse()  # Process from end to beginning
    
    for match in matches:
        old_key = match.group(1)
        if old_key in MULTIPLE_DUPLICATES_MAPPINGS_V6:
            new_key = MULTIPLE_DUPLICATES_MAPPINGS_V6[old_key]
            
            # Get the full match (including t() and quotes)
            full_match = match.group(0)
            
            # Create the replacement with the same quote style as the original
            quote_char = full_match[2]  # Get the quote character used
            replacement = f"t({quote_char}{new_key}{quote_char})"
            
            # Replace the entire match
            content = content[:match.start()] + replacement + content[match.end():]
            changes_made.append(f"  {old_key} → {new_key}")
    
    # Write back if changes were made
    if content != original_content:
        # Validate the content before writing
        try:
            # Basic syntax check - ensure we have balanced braces and quotes
            brace_count = content.count('{') - content.count('}')
            if brace_count != 0:
                print(f"⚠️  Warning: Unbalanced braces in {file_path} (difference: {brace_count})")
                return 0, []
            
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            return len(changes_made), changes_made
        except Exception as e:
            print(f"❌ Error writing {file_path}: {e}")
            return 0, []
    
    return 0, []

def main():
    """Main function to update all multiple translation duplicates."""
    print("🔍 Finding TypeScript files...")
    ts_files = find_typescript_files('src')
    print(f"📁 Found {len(ts_files)} TypeScript/TSX files")
    
    total_changes = 0
    files_updated = 0
    
    print("\n🔄 Updating multiple translation duplicates (batch 6)...")
    print("=" * 60)
    
    for file_path in ts_files:
        changes_count, changes = update_file_multiple_duplicates_v6(file_path)
        if changes_count > 0:
            files_updated += 1
            total_changes += changes_count
            print(f"\n📝 {file_path}")
            for change in changes:
                print(change)
    
    print("\n" + "=" * 60)
    print("✅ UPDATE SUMMARY")
    print("=" * 60)
    print(f"📁 Files updated: {files_updated}")
    print(f"🔄 Total changes: {total_changes}")
    print(f"📊 Multiple duplicates mappings available: {len(MULTIPLE_DUPLICATES_MAPPINGS_V6)}")
    
    if total_changes > 0:
        print("\n💡 Next steps:")
        print("   1. Test the application to ensure translations work correctly")
        print("   2. Add the new shared components to en.json")
        print("   3. Remove the old duplicate keys from en.json")
        print("   4. Run redundancy analysis to see the improvement")
    else:
        print("\n✅ No multiple duplicate references found to update!")

if __name__ == "__main__":
    main()


