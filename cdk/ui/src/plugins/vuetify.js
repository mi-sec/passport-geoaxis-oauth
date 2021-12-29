import Vue     from 'vue';
import Vuetify from 'vuetify/lib/framework';

import 'vuetify/dist/vuetify.min.css';
import '@mdi/font/css/materialdesignicons.min.css';

Vue.use( Vuetify );

// style themes https://theme-generator.vuetifyjs.com/
export default new Vuetify( {
    iconfont: 'mdi',
    theme: {
        primary: '#0073bb',
        secondary: '#34495e',
        success: '#1d8102',
        danger: '#e74c3c',
        'warning-dark': '#ffa21a',
        info: '#00d3ee',
        light: '#ecf0f1',
        dark: '#2c3e50',
        tertiary: '#495057',
        accent: '#95a5a6',
        error: '#c0392b'

        // primary: #ffc107,
        // secondary: #607d8b,
        // accent: #3f51b5,
        // error: #f44336,
        // warning: #ff9800,
        // info: #00bcd4,
        // success: #4caf50
    }
} );
