<template>
    
    <v-card v-if="pow_loading">
        <v-progress-circular
                indeterminate
                color="light-blue"
        ></v-progress-circular>
    </v-card>
    <v-card v-else>                  
        <iframe :src="full_ui_url" id="powModal" ></iframe>                  
    </v-card>
    
</template>

<script>
import { mapState } from 'vuex';

export default {
    computed: {
        ...mapState({
            full_ui_url: state => state.pow.full_ui_url,
            pow_loading: state => state.pow.pow_loading
        })
    },
    mounted () {
        this.$emit('powMounted')
    },
    methods: {
        checkIFrame() {
            //we cannot access or control the elements of a cross origin iframe - we need to rely on imap code to submit the data back to our iframe
        },
    }
    
}
</script>

<style scoped>
    #powModal {
        height: 500px;
        width: 100%;
        display: block;
    }
</style>