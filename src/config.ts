import { Platform } from 'react-native';

const DEV_API_URL_IOS = 'http://localhost:8080';
const DEV_API_URL_ANDROID = 'http://10.0.2.2:8080';

export const API_URL = __DEV__
    ? Platform.OS === 'ios'
        ? DEV_API_URL_IOS
        : DEV_API_URL_ANDROID
    : 'https://api.voicesphere.com'; // Placeholder for prod

export const WS_URL = API_URL.replace('http', 'ws') + '/ws';
