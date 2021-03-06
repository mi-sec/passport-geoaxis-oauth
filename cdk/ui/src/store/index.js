// Lib imports
import Vue  from 'vue';
import Vuex from 'vuex';

// Store functionality
import actions   from './actions';
import mutations from './mutations';
import state     from './state';
import getters   from './getters';

Vue.use( Vuex );

// Create a new store
export default new Vuex.Store( {
    actions,
    getters,
    mutations,
    state
} );
