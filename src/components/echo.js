import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

// Enable Pusher logging for debugging
Pusher.logToConsole = true;

const echo = new Echo({
    broadcaster: 'pusher',
    key: '5a8b8d7f11a2234778f6',
    cluster: 'ap2',
    forceTLS: true,
    authEndpoint: 'https://api.kingofthegrill.co.ke/broadcasting/auth',
    auth: {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            Accept: 'application/json',
        },
    },
});

// Log connection status
echo.connector.pusher.connection.bind('connected', () => {
    console.log('✅ Pusher connected successfully');
});

echo.connector.pusher.connection.bind('error', (err) => {
    console.error('❌ Pusher connection error:', err);
});

export default echo;
