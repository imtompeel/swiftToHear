#!/usr/bin/env python3
"""
Script to update translation references in the codebase to use shared components directly.
"""

import os
import re
from typing import Dict, List, Tuple
import json

# Mapping of old translation keys to new shared component keys
TRANSLATION_MAPPINGS = {
    # Role mappings
    'landing.practising.roles.speaker.title': 'shared.roles.speaker',
    'landing.practising.roles.listener.title': 'shared.roles.listener',
    'landing.practising.roles.scribe.title': 'shared.roles.scribe',
    'admin.dashboard.guide.roles.speaker.title': 'shared.roles.speaker',
    'admin.dashboard.guide.roles.listener.title': 'shared.roles.listener',
    'admin.dashboard.guide.roles.scribe.title': 'shared.roles.scribe',
    'practice.roles.assignment.speaker': 'shared.roles.speaker',
    'practice.roles.assignment.listener': 'shared.roles.listener',
    'practice.roles.assignment.scribe': 'shared.roles.scribe',
    'practice.roles.observer.title': 'shared.roles.observer',
    'dialectic.session.inPerson.roleSelection.speaker.title': 'shared.roles.speaker',
    'dialectic.session.inPerson.roleSelection.listener.title': 'shared.roles.listener',
    'dialectic.session.inPerson.roleSelection.scribe.title': 'shared.roles.scribe',
    'dialectic.roles.speaker.title': 'shared.roles.speaker',
    'dialectic.roles.listener.title': 'shared.roles.listener',
    'dialectic.roles.scribe.title': 'shared.roles.scribe',
    'dialectic.roles.observer.title': 'shared.roles.observer',
    'dialectic.assistance.speaker.title': 'shared.roles.speaker',
    'dialectic.assistance.listener.title': 'shared.roles.listener',
    'dialectic.assistance.scribe.title': 'shared.roles.scribe',
    'dialectic.assistance.observer.title': 'shared.roles.observer',
    
    # Action mappings
    'dialectic.session.startSession': 'shared.actions.startSession',
    'dialectic.session.inPerson.controls.startSession': 'shared.actions.startSession',
    'dialectic.lobby.startSession': 'shared.actions.startSession',
    'dialectic.lobby.actions.startSession': 'shared.actions.startSession',
    'dialectic.lobby.confirmStart.title': 'shared.actions.startSession',
    'dialectic.lobby.confirmStart.confirm': 'shared.actions.startSession',
    
    'dialectic.session.leaveSession': 'shared.actions.leaveSession',
    'dialectic.lobby.leaveSession': 'shared.actions.leaveSession',
    'dialectic.lobby.actions.leaveSession': 'shared.actions.leaveSession',
    'dialectic.lobby.confirmLeave.title': 'shared.actions.leaveSession',
    'dialectic.lobby.confirmLeave.confirm': 'shared.actions.leaveSession',
    
    'dialectic.session.completion.endSession.title': 'shared.actions.endSession',
    'dialectic.session.completion.endSession.button': 'shared.actions.endSession',
    'dialectic.session.inPerson.roundOptions.endSession': 'shared.actions.endSession',
    'dialectic.session.inPerson.controlButtons.endSession': 'shared.actions.endSession',
    'dialectic.session.endSession': 'shared.actions.endSession',
    
    # Common mappings
    'navigation.comingSoon': 'shared.common.comingSoon',
    'navigation.siteName': 'shared.common.siteName',
    'landing.hero.title': 'shared.common.siteName',
    'auth.signUp.email': 'shared.common.email',
    'auth.signIn.email': 'shared.common.email',
    'admin.login.emailLabel': 'shared.common.email',
    'admin.dashboard.login.emailLabel': 'shared.common.email',
    'auth.signUp.password': 'shared.common.password',
    'auth.signIn.password': 'shared.common.password',
    'admin.login.passwordLabel': 'shared.common.password',
    'admin.dashboard.login.passwordLabel': 'shared.common.password',
    'common.email': 'shared.common.email',
    'common.password': 'shared.common.password',
    
    # Auth mappings
    'auth.signIn.submit': 'shared.actions.signIn',
    'admin.login.signInButton': 'shared.actions.signIn',
    'admin.dashboard.login.signInButton': 'shared.actions.signIn',
    'auth.signIn.signingIn': 'shared.actions.signingIn',
    'admin.login.signingIn': 'shared.actions.signingIn',
    'admin.dashboard.login.signingIn': 'shared.actions.signingIn',
    
    # Admin mappings
    'admin.login.subtitle': 'shared.common.siteName + " - Admin Panel"',
    'admin.dashboard.subtitle': 'shared.common.siteName + " - Admin Panel"',
    'admin.dashboard.login.subtitle': 'shared.common.siteName + " - Admin Panel"',
    'admin.dashboard.dashboard.subtitle': 'shared.common.siteName + " - Admin Panel"',
    'admin.dashboard.signedInAs': 'shared.common.signedInAs',
    'admin.dashboard.superadmin.accessDenied.signedInAs': 'shared.common.signedInAs',
    'admin.dashboard.dashboard.signedInAs': 'shared.common.signedInAs',
    
    # Role selection mappings
    'practice.roles.assignment.title': 'shared.common.chooseRole',
    'dialectic.session.inPerson.roleSelection.title': 'shared.common.chooseRole',
    'dialectic.roles.chooseRole': 'shared.common.chooseRole',
    'dialectic.join.chooseRole': 'shared.common.chooseRole',
    
    # Video call mappings
    'dialectic.session.videoCall': 'shared.common.videoCall',
    'dialectic.session.helloCheckIn.videoCall': 'shared.common.videoCall',
    'dialectic.session.scribeFeedback.videoCall': 'shared.common.videoCall',
    'dialectic.creation.sessionType.video.title': 'shared.common.videoCall',
    
    # Placeholder mappings
    'auth.signUp.emailPlaceholder': 'shared.placeholders.enterEmail',
    'auth.signIn.emailPlaceholder': 'shared.placeholders.enterEmail',
    'auth.signUp.passwordPlaceholder': 'shared.placeholders.enterPassword',
    'auth.signIn.passwordPlaceholder': 'shared.placeholders.enterPassword',
    
    # Scripture mappings
    'landing.scripture.verses.james.text': 'shared.scripture.james119',
    'landing.format.values.attentiveListening.verse': 'shared.scripture.james119',
    'landing.scripture.verses.james.reference': 'shared.scripture.james119Ref',
    'landing.format.values.attentiveListening.reference': 'shared.scripture.james119Ref',
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

def update_file_translations(file_path: str) -> Tuple[int, List[str]]:
    """Update translation references in a single file."""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    changes_made = []
    
    # Find all t() function calls
    t_pattern = r"t\(['\"`]([^'\"`]+)['\"`]\)"
    matches = re.finditer(t_pattern, content)
    
    for match in matches:
        old_key = match.group(1)
        if old_key in TRANSLATION_MAPPINGS:
            new_key = TRANSLATION_MAPPINGS[old_key]
            
            # Handle concatenated strings
            if ' + ' in new_key:
                # Split the concatenation and handle it specially
                parts = new_key.split(' + ')
                if len(parts) == 2:
                    # Replace with template literal or concatenation
                    replacement = f"t('{parts[0]}') + ' - Admin Panel'"
                else:
                    replacement = f"t('{new_key}')"
            else:
                replacement = f"t('{new_key}')"
            
            content = content[:match.start()] + replacement + content[match.end():]
            changes_made.append(f"  {old_key} → {new_key}")
    
    # Write back if changes were made
    if content != original_content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        return len(changes_made), changes_made
    
    return 0, []

def main():
    """Main function to update all translation references."""
    print("🔍 Finding TypeScript files...")
    ts_files = find_typescript_files('src')
    print(f"📁 Found {len(ts_files)} TypeScript/TSX files")
    
    total_changes = 0
    files_updated = 0
    
    print("\n🔄 Updating translation references...")
    print("=" * 60)
    
    for file_path in ts_files:
        changes_count, changes = update_file_translations(file_path)
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
    print(f"📊 Translation mappings available: {len(TRANSLATION_MAPPINGS)}")
    
    if total_changes > 0:
        print("\n💡 Next steps:")
        print("   1. Test the application to ensure translations work correctly")
        print("   2. Remove the old translation keys from en.json")
        print("   3. Update other language files (es.json, fr.json) with shared components")
    else:
        print("\n✅ No changes needed - all references are already using shared components!")

if __name__ == "__main__":
    main()



