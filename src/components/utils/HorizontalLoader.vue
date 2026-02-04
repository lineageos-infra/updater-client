<template>
  <div class="loader-track">
    <div class="loader-first"></div>
    <div class="loader-second"></div>
  </div>
</template>

<style scoped>
.loader-track {
  height: 4px;
  width: 100%;

  position: relative;

  overflow: hidden;

  background: rgba(22, 124, 128, 0.5);
}

.loader-first,
.loader-second {
  height: 100%;
  width: auto;

  top: 0;
  left: 0;

  background: #167c80;

  position: absolute;
}

.loader-first {
  animation: horizontal-loader-animation-first 2.1s cubic-bezier(0.65, 0.815, 0.735, 0.395) infinite;
}

.loader-second {
  animation: horizontal-loader-animation-second 2.1s cubic-bezier(0.165, 0.84, 0.44, 1) 1.15s
    infinite;
}

@keyframes horizontal-loader-animation-first {
  0% {
    left: -35%;
    right: 100%;
  }

  60% {
    left: 100%;
    right: -90%;
  }

  100% {
    left: 100%;
    right: -90%;
  }
}

@keyframes horizontal-loader-animation-second {
  0% {
    left: -200%;
    right: 100%;
  }

  60% {
    left: 107%;
    right: -8%;
  }

  100% {
    left: 107%;
    right: -8%;
  }
}
</style>
