import Vue     from 'vue';
import App     from './App.vue';

import '@/plugins';
import vuetify from '@/plugins/vuetify';

import store    from '@/store';
import router   from '@/router';
import { sync } from 'vuex-router-sync';

sync( store, router );

Vue.config.productionTip = process.env.NODE_ENV !== 'production';

new Vue( {
    vuetify,
    router,
    store,
    render: ( h ) => h( App )
} ).$mount( '#app' );
