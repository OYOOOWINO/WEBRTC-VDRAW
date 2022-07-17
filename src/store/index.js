/*no-unused-vars*/
import Vue from "vue";
import Vuex from "vuex";
import router from "../router/index";
import { api } from "../boot/axios";

Vue.use(Vuex);

function createRTCPeer(state){
  state.peerConnection = new RTCPeerConnection(state.iceConfiguration);
  state.peerConnection.addEventListener('track', async (event) => {state.remoteStream = event.streams;});
  state.peerConnection.addEventListener('icecandidate', async (event) => {
    if (event.candidate) {
      const ice = event.candidate.toJSON();
      const icecandidate = {
        msgType: "iceMessage",
        iceCandidate: ice,
        targetID: state.callee,
        from: state.user.userData._id
      };
      await state.wsSocket.send(JSON.stringify(icecandidate));
    }
  });
}

async function initSocket(state){
  try {
    state.wsSocket = await new WebSocket("wss:sip.oyoobuilds.co");
    state.wsSocket.onopen = async (event) => clearInterval(state.reconnectInterval);
    state.wsSocket.onclose = async (event) =>{
      try {
        clearInterval(state.heartBeatInterval);
        state.socketServerState = false;
        state.wsSocket = null;

      } catch (error) {console.log("CREATE_SOCK _ERR ", error);}
    }
    state.wsSocket.onerror = (error) => {
      console.log("CREATE_SOCK _ERR ", error);
      clearInterval(state.heartBeatInterval);
    }
    state.wsSocket.onmessage = async (event) => {
      let data = JSON.parse(event.data);
      if (data.msgType === "callOffer") {
        createRTCPeer(state)
        state.incoming = true;
        state.targetID = data.from;
        state.peerConnection.addStream(state.canvasStream)
        await state.peerConnection.setRemoteDescription(data.offer)
        const answer = await state.peerConnection.createAnswer();
        await state.peerConnection.setLocalDescription(answer);
      }

      if (data.msgType === "callAnswer") {
        const remoteDesc = await new RTCSessionDescription(data.answer);
        await state.peerConnection.setRemoteDescription(remoteDesc);
        state.oncall = true;
      }

      if (data.msgType === "callDecline") {
        console.log("CALL ENDED");
        state.oncall = false;
        state.callEnded = true;
        state.peerConnection.close()
        state.peerConnection = {};
      }

      if (data.msgType === "iceMessage") {
        if (data.iceCandidate) {
          try {
            await state.peerConnection.addIceCandidate(data.iceCandidate);
          } catch (e) {
            console.error("Error adding received ice candidate", e);
          }
        }
      }

      if (data.msgType === "selfAuth") {
        let authToken = state.user.userData.authToken;
        let userId = state.user.userData._id;
        const authData = {
          msgType: "userAuth",
          ID: userId,
          TOKEN: authToken,
        };
        await state.wsSocket.send(JSON.stringify(authData));
      }

      if (data.msgType === "authState") {
        if (data.state) {
          state.heartBeatInterval = setInterval(() => {
            state.wsSocket.send(
              JSON.stringify({
                msgType: "ping",
                id: state.user.userData._id,
                token: state.user.userData.authToken,
              })
            );
          }, 10000);
        }
      }

      if (data.msgType === "pong") {
        state.activeSockets = data.activeContacts;
        state.socketServerState = true;
      }
    }
  } catch (error) {
    console.log("CREATE_SOCK _ERR ", state.wsSocket);
  }
}

export default new Vuex.Store({
  state: {
    callEnded: false,
    rejected: false,
    oncall: false,
    targetID: "",
    incoming: false,
    redirectPath: "",
    reconnectInterval: null,
    socketServerState: null,
    heartBeatInterval: null,
    contacts: [],
    activeSockets: [],
    drawer: null,
    peerConnection: null,
    iceConfiguration: {
      iceServers: [
        {
          urls: [
            'stun:stun1.l.google.com:19302',
            'stun:stun2.l.google.com:19302',
          ],
        },
      ],
      iceCandidatePoolSize: 10,
    },
    enableVideo: false,
    enableAudio: false,
    defaultConstraints: {
      video: true,
      aspectRatio: 1.6,
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    },
    localStream: {},
    canvasStream:{},
    remoteStream: {},
    wsSocket: null,
    remoteUserID: null,
    user: {
      done: false,
      accountConfirmed: false,
      errorState: false,
      msg: "",
      loggedin: false,
      userData: {},
    },
    callee: ""
  },
  getters: {
    incoming(state) {
      return state.incoming
    },
    localStream(state) {
      return state.localStream;
    },
    remoteStream(state) {
      return state.remoteStream[0];
    },
    contacts(state) {
      let contacts = state.contacts;
      let activeSockets = []
      state.activeSockets.forEach(socket => {
        let sock_id = Object.values(socket)
        //          if(!sock_id[0] == state.user.userData._id){
        activeSockets.push(sock_id[0])
        //          }
      })

      contacts.forEach(contact => {
        let id = contact.id;
        let index = activeSockets.includes(id)
        if (index) {
          contact.state = "green";
        } else {
          contact.state = "red";
        }
      })
      return contacts
    },
    enableAudio: (state) => {
      return state.enableAudio;
    },
    enableVideo: (state) => {
      return state.enableVideo;
    },
  },
  mutations: {
    resetCallState(state) {
      state.incoming = false
      state.rejected = false
      state.oncall = false
      state.callEnded = false
      state.targetID = ""
      state.callee = ""
      //state.peerConnection.close()
      state.peerConnection = null;
    },
    async answer(state) {
      state.incoming = false

      const callAnswer = {
        msgType: "callAnswer",
        targetID: state.targetID,
        answer: state.peerConnection.localDescription,
        from: state.user.userData._id
      };
      await state.wsSocket.send(JSON.stringify(callAnswer));
      state.oncall = true
    },
    async decline(state) {
      state.incoming = false
      const callDecline = {
        msgType: "callDecline",
        targetID: state.targetID,
        from: state.user.userData._id
      };
      await state.wsSocket.send(JSON.stringify(callDecline));
      state.oncall = false
      //state.peerConnection.close()
      state.peerConnection = null;
    },
    setRedirect(state, payload) {
      state.redirectPath = payload;
    },
    setContacts(state, payload) {
      state.contacts = payload;
    },
    setDone(state, payload) {
      state.user.done = payload;
    },
    setAccountConfirmed(state, payload) {
      console.log(payload);
      state.user.accountConfirmed = payload;
    },
    setErrorState(state, payload) {
      state.user.errorState = payload;
    },
    setMsg(state, payload) {
      state.user.msg = payload;
    },
    setAuth(state, payload) {
      sessionStorage.setItem("login", true);
      sessionStorage.setItem("user", JSON.stringify(payload));
      state.user.loggedin = true;
      state.user.userData = payload;
      let nextRoute = state.redirectPath;
      state.redirectPath = "";
      if (nextRoute.length > 0) {
        router.push(nextRoute);
      } else {
        router.push("/chat");
      }
    },
    fetchToken(state) {
      let login = sessionStorage.getItem("login");
      let user = sessionStorage.getItem("user");
      if (login === null || user === null) {
        state.user.loggedin = false;
        return;
      }

      login = JSON.parse(login);
      user = JSON.parse(user);
      state.user.loggedin = login;
      state.user.userData.authToken = user.authToken;
      state.user.userData.email = user.email;
      state.user.userData._id = user._id;
      state.user.userData.username = user.username;
      state.contacts = user.contacts
    },
    logout(state) {
      sessionStorage.removeItem("login");
      sessionStorage.removeItem("user");
      state.user.loggedin = false;
    },
    createSocket: async (state) => {
      initSocket(state);
    },
    //addSocketListeners: (state) => {},
    //createRTCPeer: async (state) => {},
    getLocalStream: async (state) => {

    },
    toggleDrawer: (state) => {
      if (state.drawer === null) {
        state.drawer = false;
      } else {
        state.drawer = !state.drawer;
      }
    },
    call: async (state, userID) => {
      // get userMedia stream
      try {
        const localStream = await navigator.mediaDevices.getUserMedia(state.defaultConstraints);
        state.localStream = localStream;
        //creat RTC Peer
        createRTCPeer(state)
        state.targetID = userID
        state.peerConnection.addStream(localStream)
        const offer = await state.peerConnection.createOffer();
        await state.peerConnection.setLocalDescription(offer);

      // create call offer
        const callOffer = {
          msgType: "callOffer",
          offer: {
            type: offer.type,
            sdp: offer.sdp
          },
          targetID: userID,
          from: state.user.userData._id
        };

        //send call offer
        await state.wsSocket.send(JSON.stringify(callOffer));
      } catch (error) {
        console.log("MEDIA_ERR: ", error);
      }
    },
    async addContact(state, payload) {
      const data = {
        _id: state.user.userData._id,
        contact_id: payload.user_id,
        contact_name: payload.contact_name
      }
      console.log(data);

      try {
        const response = await api.post("/auth/user/newcontact", data);
        if (response.status == 200) {
          context.commit("setAuth", response.data.data.contacts);
        }
      } catch (error) {
        if (error.response) {
          console.log(error.response);
        }
      }
    }
  },
  actions: {
    async update(context, payload) {
      console.log(payload);
      let user = JSON.parse(localStorage.getItem("user"));
      let data = {
        _id: user._id,
        ...payload,
      };
      try {
        const response = await api.post("/auth/user/update", data);
        if (response.status == 200) {
          context.commit("setAuth", response.data.update);
        }
      } catch (error) {
        if (error.response) {
          console.log(error.response);
        }
      }
    },
    async login(context, credentials) {
      try {
        console.log("ONE");
        const response = await api.post("auth/user/login", credentials);
        console.log("TWO");
        if (response.status == 200) {
          context.commit("setAuth", response.data.userData);
          context.commit("setContacts", response.data.userData.contacts)
          context.commit("setErrorState", false);
          context.commit("setMsg", response.data.message);
        }
      } catch (error) {
        if (error.response) {
          context.commit("setErrorState", true);
          context.commit("setMsg", error.response.data.message);
        }
      }
    },

    resetPassword(context) { },

    async registerUser(context, details) {
      try {
        const data = {
          email: details.email,
          username: details.name,
          password: details.password,
        };
        const response = await api.post("auth/user/register", data, {
          "Content-Type": "application/json",
          Accept: "application/json",
        });
        if (response.status == 200) {
          // router.push("/confirm")
          // context.commit('setDone', true)
          // context.commit('setAccountConfirmed', true)
          console.log(response.data);
        }
      } catch (error) {
        if (error.response) {
          context.commit("setErrorState", true);
          context.commit("setMsg", error.response.data.message);
        }
      }
    },

    authorize(context) { },

    async confirmRegistration(context, payload) {
      try {
        const response = await api.post(
          "auth/user/confirmRegistration",
          payload
        );
        console.log(payload);
        if (response.status == 200) {
          context.commit("setDone", false);
          context.commit("setAccountConfirmed", true);
        }
      } catch (error) {
        if (error.response) {
          console.log(error.response.data);
          console.log(error.response.status);
        }
      }
    },
    createSignalChannel({ commit }) {
      commit("createSocket");
    },
    addChannelListeners({ commit }) {
      commit("addSocketListeners");
    },
    makeCall({ commit }) {
      commit("call");
    },
    getMedia({ commit }) {
      commit("getLocalStream");
    },
    createRTCObject({ commit }) {
//       commit("createRTCPeer");
    },
    async answerCall({ commit }) {
      commit('answer')
    }
  },
  modules: {},
});

