<template>
    <div class="mt-2 pa-4" color="grey darken-6">
        <v-row justify="center" class="mt-12">
            <v-col align="center" justify="center" xs="12" sm="8" md="4">
                <v-card v-show="showError" class="rounded-0" elevation="3">
                        <v-banner single-line>
                            <v-icon slot="icon" color="red" size="36">mdi-close-circle</v-icon>
                           <span class="bold--text red--text darken-3 ml-n12">{{msg}}</span>
                        </v-banner>
                </v-card>
                <v-card v-show="done" class="rounded-0" elevation="3">
                        <v-banner single-line>
                            <v-icon slot="icon" color="success" size="36">mdi-check-circle</v-icon>
                            <span class="green--text darken-3" large>REGISTRATION SUCCESSFUL.</span>
                            <p>
                                <span medium>Check Your Email to Confirm your Account</span>
                            </p>
                        </v-banner>
                </v-card>
                <v-card class="rounded-0" elevation="2" v-show="!done">
                    <v-card-title>
                        <v-spacer></v-spacer>
                        <span class="font-weight-bold teal--text darken">SIGNUP</span>
                        <v-spacer></v-spacer>
                    </v-card-title>
                    <v-card-text class="px-3 pb-0">
                        <v-form>
                            <v-text-field
                                flat
                                class="rounded-1"
                                v-model="user.name"
                                solo-inverted
                                label="Username"
                                append-icon="mdi-account"
                                dense
                                :rules="[rules.required,rules.usernameLen]"
                            ></v-text-field>
                            <v-text-field
                                flat
                                class="rounded-1"
                                v-model="user.email"
                                solo-inverted
                                label="Email"
                                append-icon="mdi-email"
                                dense
                                :rules="[rules.required, rules.email]"
                            ></v-text-field>
                            <v-text-field
                                dense
                                solo-inverted
                                label="Password"
                                append-icon="mdi-eye"
                                type="password"
                                class="rounded-1"
                                flat
                                v-model="user.password"
                                :rules="[rules.required,rules.pwdLen]"
                            ></v-text-field>
                            <v-text-field
                                v-model="user.password0"
                                dense
                                solo-inverted
                                label="Confirm Password"
                                append-icon="mdi-eye"
                                type="password"
                                class="rounded-1"
                                flat
                                :rules="[rules.required,rules.pwdLen,passwordMatch]"
                            ></v-text-field>
                            <v-btn
                                @click="register"
                                :disabled="disableSignup"
                                depressed
                                dense
                                dark
                                medium
                                block
                                color="teal darken-3 accent-5"
                            >SIGN UP</v-btn>
                        </v-form>
                    </v-card-text>
                    <v-card-actions>
                        <v-btn dense text color="teal darken-3" x-small>Got Account? Login</v-btn>
                        <v-spacer></v-spacer>
                    </v-card-actions>
                </v-card>
            </v-col>
        </v-row>
    </div>
</template>

<script>
import { Store } from "vuex";
export default {
    computed: {
        done() {
            return this.$store.state.user.done;
        },

        loggedin() {
            return this.$store.state.user.loggedin;
        },
         msg() {
            return this.$store.state.user.msg;
        },
        errorState() {
            return this.$store.state.user.errorState;
        }
    },
    watch: {
      errorState(newVal,oldVal){
         if(newVal==true){
           this.showError = true;
         }
        },
        loggedin(newVal, oldVal) {
            if (newVal === true) {
                this.$router.push({ path: "/chat" });
            }
        },
        user: {
            deep: true,
            handler() {
                if (
                    this.isValidEmail(this.user.email) == true &&
                    this.minLength(this.user.email) == true &&
                    this.isEmpty(this.user.email) == true &&
                    this.isEmpty(this.user.name) == true &&
                    this.isEmpty(this.user.password) == true &&
                    this.isEmpty(this.user.password0) == true &&
                    this.minLength(this.user.password) == true &&
                    this.passwordMatch(this.user.password0) == true
                ) {
                    this.disableSignup = false;
                } else {
                    this.disableSignup = true;
                }
            },
        },
    },

    data: () => ({
        accept: false,
        user: { name: "", email: "", password: "", password0: "" },
        showError: false,
        disableSignup: true, rules: {
          required: value => !!value || 'Required.',
          usernameLen: value => value.length >= 3 || 'Min 4 characters',
          pwdMatch: value => value ===this.user.password || "Passwords don't Match",
          pwdLen: value => value.length >= 7 || 'Min 8 characters',
          email: value => {
            const pattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
            return pattern.test(value) || 'Invalid e-mail.'
          },
        },

    }),

    methods: {

        register() {
            console.log("HELLO ");
            this.$store.dispatch("registerUser", this.user);
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

        passwordMatch(val) {
            return val == this.user.password || "Passwords don't Match";
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
</style>
