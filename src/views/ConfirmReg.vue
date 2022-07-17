<template>
    <v-container class="mt-12">
        <v-row v-show="!accountConfirmed" class="mt-12" align="center" justify="center">
            <v-col cols="12" sm="10" md="6">
                <v-card class="rounded-1" background-color="grey darken-1" flat>
                    <v-card-text class="border-0">
                        <v-banner flat>
                            <v-row class="fill-height" align-content="center" justify="center">
                                <v-col
                                    class="text-subtitle-1 text-center"
                                    cols="12"
                                >Verifying Account...</v-col>
                                <v-col cols="6">
                                    <v-progress-linear
                                        color="cyan accent-4"
                                        indeterminate
                                        height="10"
                                    ></v-progress-linear>
                                </v-col>
                            </v-row>
                        </v-banner>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
        <v-row v-show="accountConfirmed" class="mt-12" align="center" justify="center">
            <v-col cols="12" sm="10" md="6">
                <v-card class="rounded-1" elevation="0">
                    <v-card-title class="text-center">
                        <v-spacer></v-spacer>
                        <div>
                            <v-icon slot="icon" color="cyan darken-3" size="36">mdi-check-circle</v-icon>
                            <span class="teal--text darken-3 ml-3">ACCOUNT CONFIRMED</span>
                        </div>

                        <v-spacer></v-spacer>
                    </v-card-title>
                    <v-card-text>
                        <v-banner flat>
                            <v-row class="fill-height" align-content="center" justify="center">
                                <v-col
                                    class="text-subtitle-1 text-center"
                                    cols="12"
                                >Redirecting to Login page...</v-col>
                                <v-col cols="6">
                                    <v-progress-linear
                                        color="teal accent-4"
                                        indeterminate
                                        height="10"
                                    ></v-progress-linear>
                                </v-col>
                            </v-row>
<!-- 
                            <br />
                            <span class="text--light"></span> -->
                        </v-banner>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
export default {
    name: "Confirm",
    computed: {
        accountConfirmed() {
            return this.$store.state.user.accountConfirmed;
        },
    },
    mounted() {
        this.confirm();
    },
    watch: {
        accountConfirmed(oldVal, newVal) {
            if (this.accountConfirmed == true) {
                setTimeout(this.$router.push("/login"), 3000);
            }
        },
    },
    methods: {
        confirm() {
            let code = this.$route.query.code;
            if (code.length > 20) {
                this.$store.dispatch("confirmRegistration", {
                    confirmationCode: code,
                });
            } else {
                alert("Invalid Confirmation Code");
            }
        },
    },
};
</script>
<style>
/* Helper classes */
.basil {
    background-color: #fffbe6 !important;
}
.basil--text {
    color: #356859 !important;
}
.v-banner__wrapper {
    border-bottom: none !important;
}
</style>