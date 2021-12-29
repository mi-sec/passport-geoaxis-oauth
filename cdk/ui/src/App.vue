<template>
    <v-app>

        <AppBar/>

        <v-main>
            <v-container fluid ma-0 pa-0>
                <SnackbarMessage/>
                <router-view></router-view>
            </v-container>
        </v-main>

        <Footer/>

    </v-app>
</template>

<script>
import AppBar          from '@/components/AppBar';
import SnackbarMessage from '@/components/SnackbarMessage';
import Footer          from '@/components/Footer';

export default {
    name: 'App',
    components: { Footer, SnackbarMessage, AppBar },
    beforeCreate() {
        this.$installAxios();
        this.$installLogger();
    }
};
</script>

<style>
html, body {
    overflow: hidden;
}
</style>
