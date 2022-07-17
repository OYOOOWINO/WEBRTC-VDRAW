<template>
  <v-app>
    <v-navigation-drawer class="teal darken-3 white--text" v-model="drawer" app>
      <v-card dark height="100%" flat class="teal darken-3">
        <v-list-item class="white--text mt-n1">
          <v-list-item-content>
            <v-list-item-title class="subtitle">
              CONTACTS
            </v-list-item-title>
          </v-list-item-content>
           <v-list-item-icon>
             <v-dialog
        dense
        v-model="form"
        persistent
        transition="dialog-bottom-transition"
        max-width="300px"
      >
        <template v-slot:activator="{ on, attrs }">
          <v-fab-transition>

          <v-btn fab  color="pink"
                  fab
                  dark
                  x-small v-bind="attrs" v-on="on" dark>
            <v-icon>mdi-account-plus</v-icon>
          </v-btn>
              </v-fab-transition>
        </template>
        <v-card dense>
          <v-card-title>
            <v-spacer /> <span class="bold">Add Contact</span> <v-spacer />
          </v-card-title>
          <v-card-text class="mx-0">
            <v-text-field
              dense
              solo-inverted
              label="Name"
              append-icon="mdi-account"
              class="rounded-1"
              flat
              v-model="contact_name"
            ></v-text-field>
            <v-text-field
              dense
              solo-inverted
              label="ID"
              append-icon="mdi-key"
              class="rounded-1"
              flat
              v-model="user_id"
            ></v-text-field>
          </v-card-text>
          <v-card-actions class="mx-0">
            <v-spacer></v-spacer>
            <v-btn color="red darken-1" dark @click="form = false">
              Close
            </v-btn>
            <v-spacer />
            <v-btn
              dark
              color="green darken-1"
              @click="addContact"
              :disabled="user_id.length < 1"
            >
              Save
            </v-btn>
            <v-spacer />
          </v-card-actions>
        </v-card>
      </v-dialog>
        </v-list-item-icon>
      </v-list-item>
        <v-divider class="gray"></v-divider>
        <v-list dense nav>
          <v-list-item two-line v-for="item in contacts" :key="item.id" link>
            <v-list-item-icon>
              <v-badge bottom :color="item.state" dot>
                <v-avatar size="40" color="grey">
                  <span class="white--text text-h4">{{ item.name[0] }}</span>
                </v-avatar>
              </v-badge>
            </v-list-item-icon>

            <v-list-item-content>
              <v-list-item-title class="white--text">{{
                item.name
              }}</v-list-item-title>
              <v-list-item-subtitle
                >Status:
                {{
                  item.state == "red" ? "Offline" : "Online"
                }}</v-list-item-subtitle
              >
            </v-list-item-content>
            <v-list-item-icon>
              <v-btn color="white" small class="mt-1" dark>
                <v-icon @click="makeCall(item.id, item.state)" color="success"
                  >mdi-phone</v-icon
                >
              </v-btn>
            </v-list-item-icon>
          </v-list-item>
        </v-list>
      </v-card>
    </v-navigation-drawer>
    <v-app-bar
      dense
      dark
      fixed
      app
      class="teal darken-3 accent-5 font-weight-bold title"
    >
      <v-app-bar-nav-icon
        class="white--text"
        @click="drawer = !drawer"
      ></v-app-bar-nav-icon>
      <v-toolbar-title>
        <v-avatar size="36px">
          <img src="./assets/avatar.svg" />
        </v-avatar>
        <span class="font-weight-medium mt-4 ml-2">TEMPEST</span>
      </v-toolbar-title>
    </v-app-bar>
    <v-main class="grey lighten-1 app">
      <v-container fluid>
      <router-view></router-view>
    </v-container>
    </v-main>
    <v-snackbar
      v-model="snackbar"
      absolute
      centered
      top
      style="z-index: 1000"
      tile
      color="blue darken-2"
    >
      Call Dropped

      <template v-slot:action="{ attrs }">
        <v-btn color="white" text v-bind="attrs" @click="updateCallState">
          Close
        </v-btn>
      </template>
    </v-snackbar>
    <v-snackbar
      v-model="cannot_call"
      absolute
      centered
      top
      style="z-index: 1000"
      tile
      color="red darken-2"
    >
      Cannot Call Offline Contact
      <template v-slot:action="{ attrs }">
        <v-btn color="indigo" text v-bind="attrs" @click="cannot_call = false">
          Close
        </v-btn>
      </template>
    </v-snackbar>
  </v-app>
</template>
<script>
export default {
  data: () => ({
    drawer: null,
    form: false,
    user_id: "",
    contact_name: "",
    snackbar: false,
    cannot_call: false,
  }),
  computed: {
    contacts() {
      return this.$store.getters.contacts;
    },
    rejected() {
      return this.$store.state.rejected;
    },
  },
  watch: {
    rejected(newVal, oldVal) {
      this.snackbar = newVal;
    },
  },
  created() {
    // this.fetchAccesToken();
  },
  methods: {
    updateCallState() {
      this.snackbar = false;
      this.$store.commit("resetCallState");
      this.$store.dispatch("createSignalChannel").then(() => {
        this.$store.dispatch("addChannelListeners");
      });
      this.$store.dispatch("createRTCObject");
    },
    addContact() {
      this.form = false;
      this.$store.commit("addContact", {
        user_id: this.user_id,
        contact_name: this.contact_name,
      });
    },
    makeCall(userID, userState) {
      if (userState == "green") {
        this.$store.commit("call", userID);
      } else {
        this.cannot_call = true;
      }
    },
    toggleDrawer() {
      this.$store.commit("toggleDrawer");
    },
    fetchAccesToken() {
      this.$store.commit("fetchToken");
    },
  },
};
</script>

<style lang="css">
body {
  background-color: rgb(240, 240, 240);
  height:100vh !important
}
</style>
