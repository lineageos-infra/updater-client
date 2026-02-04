<template>
  <div class="navbar shadow-[0 1px 3px rgba(0, 0, 0, 0.24)] relative w-full text-lg">
    <div class="top flex justify-between leading-6">
      <div class="flex overflow-auto p-4 whitespace-nowrap">
        <slot name="left"></slot>
      </div>
      <div class="p-4">
        <slot name="right">
          <img class="h-6 lg:hidden" src="../../assets/navbar-logo.svg" alt="LineageOS Logo" />
        </slot>
      </div>
    </div>
    <div class="tabs flex overflow-auto leading-4 whitespace-nowrap">
      <slot name="tabs"></slot>
    </div>
  </div>
</template>

<style scoped>
.navbar .tabs::v-deep(.tab) {
  padding: 8px 16px 16px 16px;
  text-decoration: none;

  font-size: 14px;
  font-weight: 500;
  text-transform: uppercase;
}

.navbar .tabs::v-deep(.tab.router-link-exact-active) {
  border-bottom: 4px solid #167c80;
}
</style>
