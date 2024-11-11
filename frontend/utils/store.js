const store = new Vuex.Store({
    state: {
        auth_token: null,
        role: null,
        loggedIn: false,
        user_id: null,
        serviceRequests: [],  // Store all service requests in Vuex state
    },
    mutations: {
        setUser(state) {
            try {
                const user = JSON.parse(localStorage.getItem('user'));
                if (user) {
                    state.auth_token = user.token;
                    state.role = user.role;
                    state.loggedIn = true;
                    state.user_id = user.id;
                }
            } catch {
                console.warn('Not logged in');
            }
        },
        logout(state) {
            state.auth_token = null;
            state.role = null;
            state.loggedIn = false;
            state.user_id = null;
            state.serviceRequests = [];
            localStorage.removeItem('user');
        },
        setServiceRequests(state, requests) {
            state.serviceRequests = requests;
        },
        updateRequestStatus(state, { requestId, status, date_of_completion }) {
            const request = state.serviceRequests.find(req => req.id === requestId);
            if (request) {
                request.service_status = status;
                if (date_of_completion) {
                    request.date_of_completion = date_of_completion;
                }
            }
        },
    },
    actions: {
        async fetchServiceRequests({ commit, state }) {
            try {
                const response = await fetch(`/api/professionals/requests`, {
                    headers: {
                        "Content-Type": "application/json",
                        'Authentication-Token': state.auth_token
                    }
                });
                if (!response.ok) throw new Error("Failed to load service requests.");
                const requests = await response.json();
                commit('setServiceRequests', requests);
            } catch (error) {
                console.error(error.message);
            }
        },
        
        // New action for admin to fetch service requests
        async fetchAdminServiceRequests({ commit, state }) {
            try {
                const response = await fetch(`/api/admin/requests`, {
                    headers: {
                        "Content-Type": "application/json",
                        'Authentication-Token': state.auth_token
                    }
                });
                if (!response.ok) throw new Error("Failed to load admin service requests.");
                const requests = await response.json();
                commit('setServiceRequests', requests);
            } catch (error) {
                console.error(error.message);
            }
        },
        async updateRequestStatus({ commit, state }, { requestId, action }) {
            try {
                const response = await fetch(`/api/professionals/request/${requestId}?action=${action}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        'Authentication-Token': state.auth_token
                    }
                });
                if (!response.ok) throw new Error(`Failed to update request status to ${action}.`);
                
                const status = action === 'accept' ? 'accepted' : (action === 'reject' ? 'rejected' : 'closed');
                const date_of_completion = action === 'close' ? new Date().toISOString() : null; // Set the date only if action is "close"

                commit('updateRequestStatus', { requestId, status, date_of_completion });
            } catch (error) {
                console.error(error.message);
            }
        },
        async closeRequest({ dispatch }, requestId) {
            await dispatch('updateRequestStatus', { requestId, action: 'close' });
        },
        async acceptRequest({ dispatch }, requestId) {
            await dispatch('updateRequestStatus', { requestId, action: 'accept' });
        },
        async rejectRequest({ dispatch }, requestId) {
            await dispatch('updateRequestStatus', { requestId, action: 'reject' });
        },
    }
});

store.commit('setUser');
export default store;
