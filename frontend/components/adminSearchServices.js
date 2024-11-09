import { injectStyles } from './injectStyles.js';

export default {
    name: 'adminSearchServices',
    props: {
        searchQuery: String // Accepts search query from the parent component
    },
    data() {
        return {
            services: [],
            selectedService: {},  // Used for Edit and View modals
            newService: { name: '', price: 0, time_required: 0, description: '' },
            serviceToDeleteId: null,
            showDeleteConfirm: false,
        };
    },
    computed: {
        // Filter services based on the search query
        filteredServices() {
            if (!this.searchQuery) {
                return this.services; // If no query, return all services
            }
            const lowerQuery = this.searchQuery.toLowerCase();
            return this.services.filter(service =>
                service.name.toLowerCase().includes(lowerQuery)
            );
        }
    },
    methods: {
        // All your methods like fetchServices, addService, etc.
        async fetchServices() {
            // Fetch services logic here
        },
        viewService(service) {
            this.selectedService = { ...service };  // Creates a reactive copy
        },
        editService(service) {
            this.selectedService = { ...service };  // Creates a reactive copy for editing
        },
        confirmDelete(serviceId) {
            this.serviceToDeleteId = serviceId; // Set the ID to delete
            const deleteConfirmModal = new bootstrap.Modal(document.getElementById('deleteConfirmModal'));
            deleteConfirmModal.show(); // Show the modal using Bootstrap's method
        }
    },
    async mounted() {
        await this.fetchServices();
        injectStyles();
    },
    template: `
    <div class="container my-5">
        <h2 class="mb-4"> Services</h2>
        <!-- Scrollable table wrapper -->
        <div class="table-wrapper">
            <table v-if="filteredServices.length > 0" class="table table-hover table-bordered">
                <thead class="table-dark">
                    <tr>
                        <th scope="col">ID</th>
                        <th scope="col">Name</th>
                        <th scope="col">Short Description</th>
                        <th scope="col" class="text-center">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="service in filteredServices" :key="service.id"> <!-- Updated to filteredServices -->
                        <td>{{ service.id }}</td>
                        <td>{{ service.name }}</td>
                        <td>{{ service.description.slice(0, 30) }}...</td>
                        <td class="text-center">
                            <button 
                                class="btn btn-info btn-sm me-1" 
                                data-bs-toggle="modal" 
                                data-bs-target="#viewServiceModal"
                                @click="viewService(service)"
                            >View</button>
                            <button 
                                class="btn btn-warning btn-sm me-1" 
                                data-bs-toggle="modal" 
                                data-bs-target="#editServiceModal"
                                @click="editService(service)"
                            >Edit</button>
                            <button 
                                class="btn btn-danger btn-sm" 
                                data-bs-toggle="modal" 
                                data-bs-target="#deleteConfirmModal" 
                                @click="confirmDelete(service.id)"
                            >Delete</button>
                        </td>
                    </tr>
                </tbody>
            </table>
            <p v-else class="text-muted text-center">No Services available.</p>
        </div>
        <div class="text-end mb-3">
            <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#addServiceModal">Add New Service</button>
        </div>
    
<!-- View Service Modal -->
<div class="modal fade" id="viewServiceModal" tabindex="-1" aria-labelledby="viewServiceModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-lg">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="viewServiceModalLabel">{{ selectedService.name }}</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <table class="details-table">
                    <tr>
                        <th>ID</th>
                        <td>{{ selectedService.id }}</td>
                    </tr>
                    <tr>
                        <th>Price</th>
                        <td>{{ selectedService.price }}</td>
                    </tr>
                    <tr>
                        <th>Description</th>
                        <td>{{ selectedService.description }}</td>
                    </tr>
                    <tr>
                        <th>Time Required</th>
                        <td>{{ selectedService.time_required }} minutes</td>
                    </tr>
                </table>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            </div>
        </div>
    </div>
</div>



        <!-- Edit Service Modal -->
        <div class="modal fade" id="editServiceModal" tabindex="-1" aria-labelledby="editServiceModalLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="editServiceModalLabel">Edit Service</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <form @submit.prevent="updateService">
                            <div class="mb-3">
                                <label for="serviceName" class="form-label">Name</label>
                                <input type="text" class="form-control" id="serviceName" v-model="selectedService.name" required>
                            </div>
                            <div class="mb-3">
                                <label for="servicePrice" class="form-label">Price</label>
                                <input type="number" class="form-control" id="servicePrice" v-model="selectedService.price" required>
                            </div>
                            <div class="mb-3">
                                <label for="serviceTime" class="form-label">Time Required (minutes)</label>
                                <input type="number" class="form-control" id="serviceTime" v-model="selectedService.time_required">
                            </div>
                            <div class="mb-3">
                                <label for="serviceDescription" class="form-label">Description</label>
                                <textarea class="form-control" id="serviceDescription" v-model="selectedService.description" rows="3"></textarea>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                                <button type="submit" class="btn btn-primary">Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>

        <!-- Add Service Modal -->
        <div class="modal fade" id="addServiceModal" tabindex="-1" aria-labelledby="addServiceModalLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="addServiceModalLabel">Add New Service</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <form @submit.prevent="addService">
                            <div class="mb-3">
                                <label for="newServiceName" class="form-label">Name</label>
                                <input type="text" class="form-control" id="newServiceName" v-model="newService.name" required>
                            </div>
                            <div class="mb-3">
                                <label for="newServicePrice" class="form-label">Price</label>
                                <input type="number" class="form-control" id="newServicePrice" v-model="newService.price" required>
                            </div>
                            <div class="mb-3">
                                <label for="newServiceTime" class="form-label">Time Required (minutes)</label>
                                <input type="number" class="form-control" id="newServiceTime" v-model="newService.time_required">
                            </div>
                            <div class="mb-3">
                                <label for="newServiceDescription" class="form-label">Description</label>
                                <textarea class="form-control" id="newServiceDescription" v-model="newService.description" rows="3"></textarea>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                                <button type="submit" class="btn btn-success">Add Service</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>

        <!-- Delete Confirmation Dialog -->
<div class="modal fade" id="deleteConfirmModal" tabindex="-1" aria-labelledby="deleteConfirmModalLabel" aria-hidden="true">
<div class="modal-dialog modal-dialog-centered">
    <div class="modal-content">
        <div class="modal-header">
            <h5 class="modal-title" id="deleteConfirmModalLabel">Confirm Delete</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
            Are you sure you want to delete this service?
        </div>
        <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-danger" @click="deleteService">Delete</button>
        </div>
    </div>
</div>
</div>
</div>

    `,
    data() {
        return {
            services: [],
            selectedService: {},  // Used for Edit and View modals
            newService: { name: '', price: 0, time_required: 0, description: '' },
            serviceToDeleteId: null,
            showDeleteConfirm: false,
        };
    },
    methods: {
        async fetchServices() {
            try {
                const token = this.$store.state.auth_token;
                if (!token) {
                    console.error("Token not found. Please log in.");
                    return;
                }
                const res = await fetch(`${location.origin}/api/services`, {
                    headers: { 'Authentication-Token': `${token}` }
                });
                if (res.ok) {
                    this.services = await res.json();
                } else {
                    console.error('Failed to fetch services:', await res.text());
                }
            } catch (error) {
                console.error('Error fetching services:', error);
            }
        },

        async addService() {
            try {
                const token = this.$store.state.auth_token;
                if (!token) {
                    console.error("Token not found. Please log in.");
                    this.$router.push('/login');
                    return;
                }

                const res = await fetch(`${location.origin}/api/admin/services`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authentication-Token': `${token}`
                    },
                    body: JSON.stringify(this.newService)
                });

                if (res.status === 401) {
                    console.error("Unauthorized: Token expired or invalid. Please log in again.");
                    localStorage.removeItem('user');
                    this.$router.push('/login');
                    return;
                }

                if (res.ok) {
                    this.newService = { name: '', price: 0, time_required: 0, description: '' };
                    await this.fetchServices();
                    const addModal = bootstrap.Modal.getInstance(document.getElementById('addServiceModal'));
                    addModal?.hide();
                } else {
                    console.error('Failed to add service:', await res.text());
                }
            } catch (error) {
                console.error('Error adding service:', error);
            }
        },

        async updateService() {
            try {
                const token = this.$store.state.auth_token;
                if (!token) {
                    console.error("Token not found for updating service. Please log in.");
                    this.$router.push('/login');
                    return;
                }

                const res = await fetch(`${location.origin}/api/admin/services/${this.selectedService.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authentication-Token': `${token}`
                    },
                    body: JSON.stringify(this.selectedService)
                });

                if (res.status === 401) {
                    console.error("Unauthorized: Please log in again.");
                    localStorage.removeItem('user');
                    this.$router.push('/login');
                    return;
                }

                if (res.ok) {
                    await this.fetchServices();
                    const editModal = bootstrap.Modal.getInstance(document.getElementById('editServiceModal'));
                    editModal?.hide();
                } else {
                    console.error('Failed to update service:', await res.text());
                    editModal?.hide();
                }
            } catch (error) {
                console.error('Error updating service:', error);
            }
        },

        async deleteService() {
            try {
                const token = this.$store.state.auth_token;
                if (!token) {
                    console.error("Token not found for deleting service. Please log in.");
                    this.$router.push('/login');
                    return;
                }
        
                const res = await fetch(`${location.origin}/api/admin/services/${this.serviceToDeleteId}`, {
                    method: 'DELETE',
                    headers: { 'Authentication-Token': `${token}` }
                });
        
                if (res.status === 401) {
                    console.error("Unauthorized: Please log in again.");
                    localStorage.removeItem('user');
                    this.$router.push('/login');
                    return;
                }
        
                if (res.ok) {
                    await this.fetchServices(); // Refresh services list
        
                    // Hide the modal
                    const deleteConfirmModal = bootstrap.Modal.getInstance(document.getElementById('deleteConfirmModal'));
                    deleteConfirmModal.hide(); // Hide the modal after deletion
                    location.reload();
                } else {
                    console.error("Error deleting service:", await res.text());
                }
            } catch (error) {
                console.error("Error during deletion:", error);
            }
        },
        

        viewService(service) {
            this.selectedService = { ...service };  // Creates a reactive copy
        },

        editService(service) {
            this.selectedService = { ...service };  // Creates a reactive copy for editing
        },

        confirmDelete(serviceId) {
            this.serviceToDeleteId = serviceId; // Set the ID to delete
            const deleteConfirmModal = new bootstrap.Modal(document.getElementById('deleteConfirmModal'));
            deleteConfirmModal.show(); // Show the modal using Bootstrap's method
        }
        
    },

    async mounted() {
        await this.fetchServices();
        injectStyles();
    }
};
