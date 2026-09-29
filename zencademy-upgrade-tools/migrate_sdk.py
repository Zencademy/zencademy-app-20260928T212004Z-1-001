from pathlib import Path
import json

root = Path(__file__).resolve().parents[1]
mapping = {
    '@react-navigation/native': 'expo-router/react-navigation',
    '@react-navigation/elements': 'expo-router/react-navigation',
    '@react-navigation/bottom-tabs': 'expo-router/js-tabs',
}
for folder in ['app', 'components', 'hooks', 'utils']:
    for path in (root / folder).rglob('*.tsx'):
        original = path.read_text(encoding='utf-8')
        content = original
        for old, new in mapping.items():
            content = content.replace(old, new)
        content = content.replace("    BackHandler.addEventListener('hardwareBackPress', handleBack);", "    const backSubscription = BackHandler.addEventListener('hardwareBackPress', handleBack);")
        content = content.replace("BackHandler.removeEventListener('hardwareBackPress', handleBack);", 'backSubscription.remove();')
        if content != original:
            path.write_text(content, encoding='utf-8')

path = root / 'components/XPContext.tsx'
content = path.read_text(encoding='utf-8')
content = content.replace("    try {\n      console.log('Setting equipped badge:'", "    const previousData = userData;\n    try {\n      console.log('Setting equipped badge:'")
content = content.replace('      const previousData = userData;\n', '')
path.write_text(content, encoding='utf-8')
path = root / 'app/(tabs)/DeveloperScreen.tsx'
path.write_text(path.read_text(encoding='utf-8').replace('setXp', 'setXP'), encoding='utf-8')

path = root / 'tsconfig.json'
config = json.loads(path.read_text(encoding='utf-8-sig'))
config['exclude'] = ['node_modules', '.tools', '.upgrade-backup', 'audit-dist', 'dist']
path.write_text(json.dumps(config, indent=2) + '\n', encoding='utf-8')
