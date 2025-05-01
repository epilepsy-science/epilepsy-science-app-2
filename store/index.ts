import { defineStore } from 'pinia'
import {pathOr} from "ramda";

export const useMainStore = defineStore('main', {
    state: () => ({
        profile: {},
        workspaces: [],
        tags: [],
        isLoadingTags: true,
        selectedPackage: {},
    }),
    getters: {
        isSignedIn: (state) => {
            return Object.keys(state.profile).length > 0
        },
        userDisplayName: (state) => {
            if (Object.keys(state.profile).length > 0) {
                const firstName = pathOr('', ['firstName'], state.profile)
                const lastName = pathOr('', ['lastName'], state.profile)
                const firstInitial = firstName ? firstName[0] : ''
                return `${firstInitial}. ${lastName}`
            } else return ''
        },
    },
    actions: {
        clearState() {
            this.profile = {}
            this.workspaces = []
            this.tags = []
            this.isLoadingTags = true
            this.selectedPackage = {}
        },

        updateProfile(profile) {
            this.profile = profile
        },
        setSelectedPackage(pkg) {
            this.selectedPackage = pkg
        },
        updateWorkspaces(workspaces) {
            this.workspaces = workspaces.organizations
        }
    },
})