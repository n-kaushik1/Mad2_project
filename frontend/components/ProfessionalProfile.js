export default {
    name: 'ProfessionalProfile',
    template: `
    <div>
        <!-- Profile Button -->
        <button class="btn btn-info mb-4" @click="openProfileModal">View/Edit Profile</button>

        <!-- Profile Modal -->
        <div v-if="showProfileModal" class="modal fade show" tabindex="-1" style="display: block;">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Professional Profile</h5>
                        <button type="button" class="btn-close" @click="closeProfileModal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <form @submit.prevent="updateProfile">
                            <div class="mb-3">
                                <label for="name" class="form-label">Name</label>
                                <input v-model="profile.name" type="text" class="form-control" id="name">
                            </div>
                            <div class="mb-3">
                                <label for="email" class="form-label">Email</label>
                                <input v-model="profile.email" type="text" class="form-control" id="email">
                            </div>
                            <div class="mb-3">
                                <label for="password" class="form-label">Password</label>
                                <input v-model="profile.password" type="password" class="form-control" id="password">
                            </div>
                            <div class="mb-3">
                                <label for="experience" class="form-label">Experience (years)</label>
                                <input v-model="profile.experience" type="number" class="form-control" id="experience">
                            </div>
                            <div class="mb-3">
                                <label for="address" class="form-label">Address</label>
                                <input v-model="profile.address" type="text" class="form-control" id="address">
                            </div>
                            <div class="mb-3">
                                <label for="pin_code" class="form-label">Pin Code</label>
                                <input v-model="profile.pin_code" type="text" class="form-control" id="pin_code">
                            </div>
                            <div class="mb-3">
                                <label for="description" class="form-label">Description</label>
                                <textarea v-model="profile.description" class="form-control" id="description"></textarea>
                            </div>
                            <button type="submit" class="btn btn-primary">Save Changes</button>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" @click="closeProfileModal">Close</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Modal backdrop -->
        <div v-if="showProfileModal" class="modal-backdrop fade show"></div>
    </div>
    `,
    
    data() {
        return {
            showProfileModal: false,
            profile: {
                name: '',
                experience: null,
                address: '',
                pin_code: '',
                description: ''
            }
        };
    },
    methods: {
        async openProfileModal() {
            try {
                const response = await fetch('/api/users/profile', {
                    headers: { 'Authentication-Token': this.$store.state.auth_token }
                });
                if (!response.ok) throw new Error('Failed to fetch profile');
                this.profile = await response.json();
                this.showProfileModal = true;
            } catch (error) {
                console.error(error);
            }
        },
        closeProfileModal() {
            this.showProfileModal = false;
        },
        async updateProfile() {
            try {
                const response = await fetch('/api/users/profile', {
                    method: 'PUT',
                    headers: {
                        'Authentication-Token': this.$store.state.auth_token,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(this.profile)
                });
                if (!response.ok) throw new Error('Failed to update profile');
                alert("Profile updated successfully");
                this.showProfileModal = false;
            } catch (error) {
                console.error(error);
                alert("Error updating profile");
            }
        }
    }
};
