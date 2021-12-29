<template>
    <v-snackbar
        v-model="snackbarMessage.isOpen"
        top
        timeout="3000"
    >
        {{ snackbarMessage.text }}

        <template v-slot:action="{ attrs }">
            <v-btn
                :color="snackbarMessage.color || 'error'"
                text
                v-bind="attrs"
                @click="snackbarMessage.isOpen = false"
            >
                <v-icon>
                    mdi-close
                </v-icon>
            </v-btn>
        </template>
    </v-snackbar>
</template>

<script>
import { mapState } from 'vuex';

export default {
    name: 'SnackbarMessage',
    data: () => ( {
        fab: false,

        links: [
            { name: 'Home', path: 'home' },
            { name: 'Classes', path: 'classes' },
            // only show this if the profile says they are a teacher
            { name: 'Roster', path: 'roster' }
        ]
    } ),
    computed: {
        ...mapState( [ 'snackbarMessage' ] )
    }
};
</script>
