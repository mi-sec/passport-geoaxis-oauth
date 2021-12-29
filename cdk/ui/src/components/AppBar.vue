<template>
    <v-app-bar
        app
        flat
    >
        <v-container class="py-0 fill-height">
            <v-spacer></v-spacer>

            <span class="overline">
                {{ username }}
            </span>

        </v-container>

    </v-app-bar>
</template>

<script>
export default {
    name: 'AppBar',
    computed: {
        username() {
            return this.$store.state.geoaxis.PersonaDisplayName || 'user';
        }
    }
};
</script>
