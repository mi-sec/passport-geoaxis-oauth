<template>
    <v-container
        class="ma-5"
        fluid
    >
        <v-row>
            <v-col
                cols="4"
                offset="4"
            >
                <v-row
                    class="mt-5 mb-5 pt-5"
                    align="center"
                    justify="space-around"
                >
                    <v-btn
                        v-for="( btn, i ) in routes"
                        :key="i"
                        :color="btn.color"
                        :disabled="(
                            ( !btn.requiresAuth && $store.state.geoaxis.isAuthenticated ) ||
                            ( btn.requiresAuth && !$store.state.geoaxis.isAuthenticated )
                        )"
                        @click="redirect( btn.route )"
                    >
                        {{ btn.text }}
                    </v-btn>
                </v-row>

                <v-row
                    v-for="( val, key ) in this.$store.state.geoaxis"
                    :key="key"
                >
                    <span>{{ key }}: {{ val }}</span>
                </v-row>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
export default {
    name: 'Home',
    data() {
        return {
            routes: [
                {
                    requiresAuth: false,
                    color: 'success',
                    text: 'CAC Access',
                    route: process.env.VUE_APP_GEOAXIS_AUTH_ROUTE
                },
                {
                    requiresAuth: true,
                    color: 'error',
                    text: 'Logout',
                    route: process.env.VUE_APP_GEOAXIS_LOGOUT_ROUTE
                }
            ]
        };
    },
    mounted() {
        const uid = sessionStorage.getItem( 'uid' );

        if ( Object.prototype.hasOwnProperty.call( this.$route.query, 'logout' ) ) {
            this.$store.state.geoaxis.isAuthenticated = false;
            sessionStorage.clear();
            this.clearQueryParams();
        }
        else if ( uid ) {
            const email              = sessionStorage.getItem( 'email' );
            const PersonaDisplayName = sessionStorage.getItem( 'PersonaDisplayName' );
            const profile            = { uid, email, PersonaDisplayName };
            this.setAuthenticated( profile );
        }
        else {
            const profile = { ...this.$route.query };
            if ( Object.prototype.hasOwnProperty.call( profile, 'uid' ) ) {
                if ( profile.uid && /\d{8,12}/.test( profile.uid ) ) {
                    this.setAuthenticated( profile );

                    sessionStorage.setItem( 'uid', profile.uid );
                    sessionStorage.setItem( 'email', profile.email );
                    sessionStorage.setItem( 'PersonaDisplayName', profile.PersonaDisplayName );

                    this.clearQueryParams();
                }
                else {
                    this.$store.state.geoaxis.isAuthenticated = false;
                }
            }
            else {
                this.$store.state.geoaxis.isAuthenticated = false;
            }
        }
    },
    methods: {
        setAuthenticated( profile ) {
            this.$logger.log( profile );
            this.$store.state.geoaxis.isAuthenticated    = true;
            this.$store.state.geoaxis.uid                = profile.uid;
            this.$store.state.geoaxis.email              = profile.email;
            this.$store.state.geoaxis.PersonaDisplayName = profile.PersonaDisplayName;
        },
        clearQueryParams() {
            const url = new URL( window.location.href );
            url.searchParams.delete( 'uid' );
            url.searchParams.delete( 'email' );
            url.searchParams.delete( 'PersonaDisplayName' );
            url.searchParams.delete( 'logout' );
            this.$router.push( url );
        },
        redirect( route ) {
            const url = new URL( route || 'http://localhost:8080' );
            url.searchParams.set( 'redirect_url', window.location.href );
            window.location.href = url;
        }
    }
};
</script>
