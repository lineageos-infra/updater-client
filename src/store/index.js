import { createStore } from 'vuex'

export default createStore({
    state() {
        return {
            error: undefined,
            ongoingRequests: 0,
            oems: [],
            devices: {},
            builds: {},
            changes: {
                page: -1,
                items: [],
            },
        };
    },
    mutations: {
        setError(state, error) {
            state.error = error;
        },
        startRequest(state) {
            state.ongoingRequests++;
        },
        endRequest(state) {
            state.ongoingRequests--;
        },
        setOems(state, oems) {
            state.oems = oems;
        },
        setDevice(state, payload) {
            state.devices[payload.model] = payload.data;
        },
        setDeviceBuilds(state, payload) {
            state.builds[payload.model] = payload.data;
        },
        addNextChangesPage(state, changes) {
            state.changes.items = [...new Set([...state.changes.items, ...changes])];
            state.changes.page++;
        },
    },
    getters: {
        error(state) {
            return state.error;
        },
        ongoingRequests(state) {
            return state.ongoingRequests;
        },
        oems(state) {
            return state.oems;
        },
        getDevice: (state) => (model) => {
            return state.devices[model];
        },
        getDeviceBuilds: (state) => (model) => {
            return state.builds[model];
        },
        changes(state) {
            return state.changes.items;
        },
        changesPage(state) {
            return state.changes.page;
        },
    },
});
