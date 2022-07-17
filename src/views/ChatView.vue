<template>
  <v-container fill-height>
    <v-row justify="center">
    <v-dialog
      fullscreen
      hide-overlay
      v-model="incoming"
      persistent
      transition="dialog-bottom-transition"
    >
    <v-card>
            <v-card-title class="ml-0 border-0 text-h4">
              <v-spacer></v-spacer
              ><span class="green--text darken-6 text-h6">INCOMING CALL</span
              ><v-spacer></v-spacer>
            </v-card-title>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn medium fab color="green darken-2" @click="acceptCall">
                <v-icon class="white--text">mdi-phone</v-icon>
              </v-btn>
              <v-spacer></v-spacer>
              <v-btn color="red darken-2" fab @click="dropCall" medium>
                <v-icon class="white--text">mdi-phone-cancel</v-icon>
              </v-btn>
              <v-spacer></v-spacer>
            </v-card-actions>
          </v-card>
    </v-dialog>
  </v-row>
    <v-row align="center" justify="center">
      <v-col class="text-center" cols="12" sm="12" md="6">
        <v-spacer></v-spacer>
        <canvas ref="canvas2D" id="canvas" height="400" width="500"></canvas>
          <video
          style="display: none"
          autoplay
          playsinline
          ref="remoteVideo"
          class="remoteVideo"
        ></video>
        <v-spacer></v-spacer>
      </v-col>
    </v-row>
    <v-footer app clipped-left class="teal darken-3 py-4 elevation-2">
      <v-row align="center" justify="center">
        <v-col class="text-center" cols="12">
          <div class="control-btns ml-md-3">
            <v-btn
              v-show="true"
              @click="dropCall"
              depressed
              small
              class="fab ml-1"
            >
              <v-icon color="red darken-2">mdi-phone-cancel</v-icon>
            </v-btn>
            <v-btn
              v-show="true"
              @click="handleClearButtonClick"
              depressed
              small
              class="fab ml-1"
            >
              <v-icon color="green darken-2">mdi-delete-outline</v-icon>
            </v-btn>
          </div>
        </v-col>
      </v-row>
    </v-footer>
    <v-row>
      <v-col>

      </v-col>
    </v-row>
  </v-container>
</template>
<script>
export default {
  data: () => {
    return {
      localStream:{},
      remoteStream: {},
      canvas:null,
      canvasContext:null,
      drawer: null,
      lineWidth: 2,
      halfLineWidth: 2,
      fillStyle : '#f00',
      strokeStyle : '#f00',
      shadowColor: '#f00',
      shadowBlur: 0,
      width:0,
      height:0,
      state: {mousedown:false},
      mousePoints:[],
    };
  },
  computed: {
    streamSource() {
      return this.$store.getters.remoteStream;
    },
    incoming() {
      let callState = this.$store.getters.incoming;
      this.oncall = callState;
      return callState;
    },
    callEnded() {
      return this.$store.state.callEnded;
    },
  },
  methods: {
      setLocalStreamSource(streamSource){
        this.$store.state.canvasStream = streamSource;
      },
      renderCanvas(){
        this.canvas.addEventListener('mousedown', this.handleWritingStart);
        this.canvas.addEventListener('mousemove', this.handleWritingInProgress);
        this.canvas.addEventListener('mouseup', this.handleDrawingEnd);
        this.canvas.addEventListener('mouseout', this.handleDrawingEnd);
        this.canvas.addEventListener('touchstart', this.handleWritingStart);
        this.canvas.addEventListener('touchmove', this.handleWritingInProgress);
        this.canvas.addEventListener('touchend', this.handleDrawingEnd);
        this.remoteStream.addEventListener('play', () => {
          this.canvas.width = this.remoteStream.videoWidth;
          this.canvas.height = this.remoteStream.videoHeight;
          this.timerCallback();
          }, false);
      },
      handleWritingStart(event) {
        //console.log("HELLO")
        event.preventDefault();
        const mousePos = this.getMosuePositionOnCanvas(event);
        //console.log({ x: mousePos.x, y: mousePos.y })
        this.mousePoints.push({ x: mousePos.x, y: mousePos.y })
        this.state.mousedown = true;
      },

      handleWritingInProgress(event) {
        event.preventDefault();
        if (this.state.mousedown) {
          const mousePos = this.getMosuePositionOnCanvas(event);
         this.mousePoints.push({ x: mousePos.x, y: mousePos.y })
        }
      },

      handleDrawingEnd(event) {
        event.preventDefault();
        if (this.state.mousedown) {
          this.canvasContext.shadowColor = this.shadowColor;
          this.canvasContext.shadowBlur = this.shadowBlur;
          this.canvasContext.stroke();
        }
        this.state.mousedown = false;
      },

      handleClearButtonClick(event) {
        event.preventDefault();
        this.clearCanvas();
      },

      getMosuePositionOnCanvas(event) {
        let rect = event.target.getBoundingClientRect();
        const x = (event.clientX - rect.left)|| event.targetTouches[0].pageX - rect.left;
        const y = (event.clientY - rect.top)|| event.targetTouches[0].pageY - rect.top;
        return { x, y};
      },

      clearCanvas() {
        this.canvasContext.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.mousePoints = []
      },

      timerCallback() {
        if (this.localStream.paused || this.localStream.ended) {
          return;
        }
        this.computeFrame();
        setTimeout(() => {this.timerCallback()}, 0);
      },

      computeFrame() {
        this.canvasContext.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.canvasContext.drawImage(this.remoteStream, 0, 0,this.canvas.width, this.canvas.height);
        this.drawPoints(this.mousePoints)
        const frame = this.canvasContext.getImageData(0, 0, this.canvas.width, this.canvas.height);
        this.canvasContext.putImageData(frame, 0, 0);
      },

      drawPoints(points) {
        this.canvasContext.beginPath();
        this.canvasContext.lineWidth = this.lineWidth;
        this.canvasContext.strokeStyle = this.strokeStyle;
        this.canvasContext.shadowColor = null;
        this.canvasContext.shadowBlur = null;
        this.canvasContext.fill();
        for (let index = 0; index < points.length; index++) {
          const element = points[index];
          this.canvasContext.lineTo(element.x, element.y);
          this.canvasContext.stroke();
        }
      }
    ,
    acceptCall() { this.$store.commit("answer");},
    dropCall() { this.$store.commit("decline");this.$store.commit("resetCallState");},
    mountStream() { this.$refs.remoteVideo.srcObject = this.streamSource;},
    createSocket() {this.$store.dispatch("createSignalChannel")}
  },
  created() {
    this.createSocket();
  },
  watch: {
    streamSource(newVal, oldVal) {
      this.mountStream();
    },
    callEnded(newval, oldval) {
      if (newval === true) {
        this.$store.commit("resetCallState");
      }
    },
  },
  mounted() {
      this.localVideo = this.$refs.localVideo;
      this.canvas = this.$refs.canvas2D;
      this.canvasContext = this.canvas.getContext('2d');
      this.remoteStream = this.$refs.remoteVideo;
      this.renderCanvas();
      this.setLocalStreamSource(this.canvas.captureStream(25));

  },
};
</script>

<style scoped>
#myStream {
  width: 100% !important;
  height: auto !important;
}
.video-container {
  width: 100vw;
  max-width: 1000px;
  display: flex;
  justify-content: center;
  masrgin-inline: auto;
}
.remoteVideo {
  /* override other styles to make responsive */
  width: 100% !important;
  height: auto !important;
}
</style>

