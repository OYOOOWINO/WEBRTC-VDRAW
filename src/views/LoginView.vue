<template>
    <div class="mt-2 pa-4" color="grey darken-6">
        <v-row justify="center" class="mt-12">
            <v-col align="center" justify="center" xs="12" sm="8" md="4">
                <v-card v-show="showError" class="rounded-0" elevation="3">
                    <v-banner single-line>
                        <v-icon slot="icon" color="red" size="36">mdi-close-circle</v-icon>
                        <span class="font-weight-bold custom-transform-class red--text darken-3 ml-n12">{{ msg }}</span>
                    </v-banner>
                </v-card>
                <v-card class="rounded-0" colo elevation="2">
                    <v-card-title>
                        <v-spacer></v-spacer>
                        <span class="font-weight-bold teal--text darken">LOGIN</span>
                        <v-spacer></v-spacer>
                    </v-card-title>
                    <v-card-text class="px-3 pb-0">
                        <v-form>
                            <v-text-field flat class="rounded-1" solo-inverted label="Email" append-icon="mdi-email"
                                dense :rules="[rules.required, rules.email]" v-model="user.email"></v-text-field>
                            <v-text-field dense :rules="[rules.required]" solo-inverted label="Password"
                                append-icon="mdi-eye" :type="password" class="rounded-1" v-model="user.password" flat
                                @click:prepend="togglePwd"></v-text-field>
                            <v-btn :disabled="disableLogin" depressed dense dark medium block
                                color="teal darken-3 accent-5" @click="login">Login</v-btn>
                        </v-form>
                    </v-card-text>
                    <v-card-actions>
                        <v-btn dense text color="teal darken-3" x-small>Forgot Password?</v-btn>
                        <v-spacer></v-spacer>
                    </v-card-actions>
                </v-card>
            </v-col>
        </v-row>
    </div>
</template>

<script>
import { mapActions } from "vuex";
export default {
    computed: {
        loggedin() {
            return this.$store.state.user.loggedin;
        },
        msg() {
            return this.$store.state.user.msg;
        },
        errorState() {
            return this.$store.state.user.errorState;
        },
    },
    watch: {
        errorState(newVal, oldVal) {
            if (newVal == true) {
                this.showError = true;
            }
        },
        user: {
            deep: true,
            handler() {
                if (
                    this.isValidEmail(this.user.email) == true &&
                    this.minLength(this.user.email) == true &&
                    this.isEmpty(this.user.email) == true &&
                    this.isEmpty(this.user.password) == true
                ) {
                    this.disableLogin = false;
                } else {
                    this.disableLogin = true;
                }
            },
        }
    },

    data: () => ({
        password: "password",
        user: { email: "", password: "" },
        showError: false,
        disableLogin: true,
        rules: {
            required: value => !!value || 'Required.',
            counter: value => value.length >= 4 || 'Min 5 characters',
            email: value => {
                const pattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
                return pattern.test(value) || 'Invalid e-mail.'
            },
        },
    }),

    methods: {
        togglePwd() {
            if (this.password === "text") {
                this.password === "password"
            } else {
                this.password === "text"
            }
        },
        isEmpty(val) {
            return val.length > 0 || "Input Requared";
        },
        isValidEmail(val) {
            const emailPattern =
                /^(?=[a-zA-Z0-9@._%+-]{6,254}$)[a-zA-Z0-9._%+-]{1,64}@(?:[a-zA-Z0-9-]{1,63}\.){1,8}[a-zA-Z]{2,63}$/;
            return emailPattern.test(val) || "Invalid email";
        },
        minLength(val) {
            return (val && val.length > 5) || "Minimum Length is 5";
        },
        login() {
            console.log("HELLO LOGGIN ");
            this.$store.dispatch("login", this.user);
        },
    },
};
</script>
<style scoped>
/* Helper classes */
.basil {
    background-color: #fffbe6 !important;
}

.basil--text {
    color: #356859 !important;
}

.custom-transform-class {
    text-transform: uppercase
}
</style>
