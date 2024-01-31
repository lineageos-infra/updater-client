<template>
  <div class="change">
    <a class="subject" target="_blank" v-bind:href="url">
      {{ subject }}
    </a>
    <div class="repository-type">
      <span class="badge bg-dark bg-opacity-15 dark:bg-white dark:bg-opacity-15">
        {{ type }}
      </span>

      <span
        class="badge bg-dark bg-opacity-15 dark:bg-white dark:bg-opacity-15"
        v-if="!build?.version"
      >
        {{ branch }}
      </span>

      <a class="repository" target="_blank" v-bind:href="`https://github.com/${project}`">
        {{ repository }}
      </a>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ChangeTab',
  props: {
    url: String,
    subject: String,
    project: String,
    repository: String,
    type: String,
    branch: String,
    build: Object
  }
}
</script>

<style scoped>
.change {
  padding: 8px 0;
}

.change .subject,
.change .repository {
  display: block;

  vertical-align: text-bottom;
}

.change .subject {
  line-height: 28px;
}

.change .subject,
.change .repository {
  color: inherit;
  text-decoration: none;
}

.change .repository-type {
  font-size: 12px;
  line-height: 24px;

  display: flex;
  align-items: center;
}

.change .badge {
  border-radius: 12px;
  padding: 0 8px;
  margin-right: 8px;
}
</style>
