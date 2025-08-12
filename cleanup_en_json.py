#!/usr/bin/env python3
"""
Script to clean up en.json by removing old duplicate keys and interpolation patterns.
"""

import json
import copy

def load_json_file(file_path: str) -> dict:
    """Load and parse the JSON file."""
    with open(file_path, 'r', encoding='utf-8') as f:
        return json.load(f)

def save_json_file(file_path: str, data: dict):
    """Save data to JSON file with proper formatting."""
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

def remove_old_keys(data: dict) -> dict:
    """Remove old duplicate keys that are now replaced by shared components."""
    
    # Keys to remove (old duplicates that are now handled by shared components)
    keys_to_remove = [
        # Navigation duplicates
        'navigation.comingSoon',
        'navigation.siteName',
        
        # Auth duplicates
        'auth.signUp.email',
        'auth.signIn.email',
        'admin.login.emailLabel',
        'admin.dashboard.login.emailLabel',
        'auth.signUp.password',
        'auth.signIn.password',
        'admin.login.passwordLabel',
        'admin.dashboard.login.passwordLabel',
        'auth.signIn.submit',
        'admin.login.signInButton',
        'admin.dashboard.login.signInButton',
        'auth.signIn.signingIn',
        'admin.login.signingIn',
        'admin.dashboard.login.signingIn',
        
        # Admin duplicates
        'admin.login.subtitle',
        'admin.dashboard.subtitle',
        'admin.dashboard.login.subtitle',
        'admin.dashboard.dashboard.subtitle',
        'admin.dashboard.signedInAs',
        'admin.dashboard.superadmin.accessDenied.signedInAs',
        'admin.dashboard.dashboard.signedInAs',
        
        # Landing duplicates
        'landing.hero.title',
        'landing.practising.roles.speaker.title',
        'landing.practising.roles.listener.title',
        'landing.practising.roles.scribe.title',
        'landing.scripture.verses.james.text',
        'landing.scripture.verses.james.reference',
        'landing.format.values.attentiveListening.verse',
        'landing.format.values.attentiveListening.reference',
        
        # Practice duplicates
        'practice.roles.assignment.speaker',
        'practice.roles.assignment.listener',
        'practice.roles.assignment.scribe',
        'practice.roles.observer.title',
        'practice.roles.assignment.title',
        
        # Dialectic duplicates
        'dialectic.session.inPerson.roleSelection.speaker.title',
        'dialectic.session.inPerson.roleSelection.listener.title',
        'dialectic.session.inPerson.roleSelection.scribe.title',
        'dialectic.session.inPerson.roleSelection.title',
        'dialectic.roles.speaker.title',
        'dialectic.roles.listener.title',
        'dialectic.roles.scribe.title',
        'dialectic.roles.observer.title',
        'dialectic.roles.chooseRole',
        'dialectic.assistance.speaker.title',
        'dialectic.assistance.listener.title',
        'dialectic.assistance.scribe.title',
        'dialectic.assistance.observer.title',
        'dialectic.session.startSession',
        'dialectic.session.inPerson.controls.startSession',
        'dialectic.lobby.startSession',
        'dialectic.lobby.actions.startSession',
        'dialectic.lobby.confirmStart.title',
        'dialectic.lobby.confirmStart.confirm',
        'dialectic.session.leaveSession',
        'dialectic.lobby.leaveSession',
        'dialectic.lobby.actions.leaveSession',
        'dialectic.lobby.confirmLeave.title',
        'dialectic.lobby.confirmLeave.confirm',
        'dialectic.session.completion.endSession.title',
        'dialectic.session.completion.endSession.button',
        'dialectic.session.inPerson.roundOptions.endSession',
        'dialectic.session.inPerson.controlButtons.endSession',
        'dialectic.session.endSession',
        'dialectic.session.videoCall',
        'dialectic.session.helloCheckIn.videoCall',
        'dialectic.session.scribeFeedback.videoCall',
        'dialectic.creation.sessionType.video.title',
        'dialectic.join.chooseRole',
        
        # Common duplicates
        'common.email',
        'common.password',
    ]
    
    def remove_nested_key(data: dict, key_path: str):
        """Remove a nested key from the data structure."""
        keys = key_path.split('.')
        current = data
        
        # Navigate to the parent of the key to remove
        for key in keys[:-1]:
            if key in current and isinstance(current[key], dict):
                current = current[key]
            else:
                return  # Key path doesn't exist
        
        # Remove the final key
        if keys[-1] in current:
            del current[keys[-1]]
    
    # Create a copy to avoid modifying the original during iteration
    cleaned_data = copy.deepcopy(data)
    
    # Remove the old keys
    for key_path in keys_to_remove:
        remove_nested_key(cleaned_data, key_path)
    
    return cleaned_data

def remove_interpolation_patterns(data: dict) -> dict:
    """Remove interpolation patterns from values since we're using shared components directly."""
    
    def clean_value(value):
        """Clean a single value by removing interpolation patterns."""
        if isinstance(value, str):
            # Remove patterns like {{shared.roles.speaker}}
            import re
            return re.sub(r'\{\{shared\.[^}]+\}\}', '', value).strip()
        return value
    
    def clean_dict(d: dict):
        """Recursively clean all values in a dictionary."""
        for key, value in d.items():
            if isinstance(value, dict):
                clean_dict(value)
            elif isinstance(value, str):
                d[key] = clean_value(value)
    
    cleaned_data = copy.deepcopy(data)
    clean_dict(cleaned_data)
    
    # Remove empty strings that might result from cleaning
    def remove_empty_strings(d: dict):
        """Remove keys with empty string values."""
        keys_to_remove = []
        for key, value in d.items():
            if isinstance(value, dict):
                remove_empty_strings(value)
            elif value == "":
                keys_to_remove.append(key)
        
        for key in keys_to_remove:
            del d[key]
    
    remove_empty_strings(cleaned_data)
    
    return cleaned_data

def main():
    """Main function to clean up the en.json file."""
    print("🧹 Cleaning up en.json file...")
    
    # Load the current file
    file_path = "src/i18n/locales/en.json"
    data = load_json_file(file_path)
    
    print(f"📊 Original file size: {len(str(data))} characters")
    
    # Remove old duplicate keys
    print("\n🔴 Removing old duplicate keys...")
    data = remove_old_keys(data)
    
    # Remove interpolation patterns
    print("🔄 Removing interpolation patterns...")
    data = remove_interpolation_patterns(data)
    
    # Save the cleaned file
    save_json_file(file_path, data)
    
    print(f"📊 Cleaned file size: {len(str(data))} characters")
    
    # Run redundancy analysis to see the improvement
    print("\n🔍 Running redundancy analysis...")
    import subprocess
    result = subprocess.run(['python', 'analyze_redundancies.py'], 
                          capture_output=True, text=True)
    print(result.stdout)
    
    print("\n✅ Cleanup complete!")
    print("💡 The en.json file has been cleaned up and now uses shared components directly.")

if __name__ == "__main__":
    main()


