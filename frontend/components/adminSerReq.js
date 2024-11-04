import { injectStyles } from './injectStyles.js';

export default {
    name: 'adminServiceRequests',
    template: `
    <div class="container my-5">      
        <!-- Scrollable table wrapper -->
        <div class="table-wrapper">
            <table class="table table-striped table-hover">
                <thead>
                    <tr>
                        <th scope="col">ID</th>
                        <th scope="col">Assigned Professional (if any)</th>
                        <th scope="col">Requested Date</th>
                        <th scope="col">Status</th>
                        <th scope="col">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="request in serviceRequests" :key="request.id">
                        <td>{{ request.id }}</td>
                        <td>{{ request.professionalName || 'N/A' }}</td>
                        <td>{{ formatDate(request.date_of_request) }}</td>
                        <td>{{ getStatusText(request.service_status) }}</td>
                        <td>
                            <button class="btn btn-primary" @click="openRequestDetails(request)">View</button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Modal for displaying request details -->
        <div v-if="selectedRequest" class="modal fade show" tabindex="-1" style="display: block;">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Service Request Details</h5>
                        <button type="button" class="btn-close" @click="closeModal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <table class="details-table">
                            <tr>
                                <th>ID</th>
                                <td>{{ selectedRequest.id }}</td>
                            </tr>
                            <tr>
                                <th>Service Name</th>
                                <td>{{ selectedRequest.serviceName || 'Unknown' }}</td> <!-- Ensured service name has a fallback -->
                            </tr>
                            <tr>
                                <th>Customer ID</th>
                                <td>{{ selectedRequest.customer_id }}</td>
                            </tr>
                            <tr>
                                <th>Assigned Professional</th>
                                <td>{{ selectedRequest.professionalName || 'N/A' }}</td>
                            </tr>
                            <tr>
                                <th>Date of Request</th>
                                <td>{{ formatDate(selectedRequest.date_of_request) }}</td>
                            </tr>
                            <tr>
                                <th>Status</th>
                                <td>{{ getStatusText(selectedRequest.service_status) }}</td>
                            </tr>
                            <tr>
                                <th>Remarks</th>
                                <td>{{ selectedRequest.remarks }}</td>
                            </tr>
                            <tr>
                                <th>Customer Phone</th>
                                <td>{{ selectedRequest.customer_phone }}</td>
                            </tr>
                        </table>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" @click="closeModal">Close</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Modal backdrop -->
        <div v-if="selectedRequest" class="modal-backdrop fade show"></div>
    </div>
    `,
    data() {
        return {
            serviceRequests: [],
            selectedRequest: null // Holds the request data for the modal
        };
    },
    created() {
        injectStyles(); // Inject CSS styles when component is created
        this.fetchServiceRequests();
    },
    methods: {
        async fetchServiceRequests() {
            try {
                const token = JSON.parse(localStorage.getItem('user'))?.token;
                const response = await fetch('/api/admin/requests', {
                    headers: {
                        'Authentication-Token': `${token}`
                    }
                });
                if (!response.ok) {
                    throw new Error("Failed to fetch service requests");
                }
                const data = await response.json();
                this.serviceRequests = await Promise.all(
                    data.map(async request => ({
                        ...request,
                        professionalName: request.professional_id ? await this.fetchProfessionalName(request.professional_id) : 'N/A',
                        serviceName: request.service_id ? await this.fetchServiceName(request.service_id) : 'Unknown' // Fetch service name with fallback
                    }))
                );
            } catch (error) {
                console.error("Error fetching service requests:", error);
            }
        },
        async fetchProfessionalName(professional_id) {
            try {
                const token = JSON.parse(localStorage.getItem('user'))?.token;
                const response = await fetch(`/api/admin/professionals/${professional_id}`, {
                    headers: {
                        'Authentication-Token': `${token}`
                    }
                });
                if (!response.ok) {
                    throw new Error("Failed to fetch professional details");
                }
                const data = await response.json();
                return data.name;
            } catch (error) {
                console.error("Error fetching professional details:", error);
                return 'Unknown';
            }
        },
        async fetchServiceName(service_id) {
            try {
                const token = JSON.parse(localStorage.getItem('user'))?.token;
                const response = await fetch(`/api/services/${service_id}`, {
                    headers: {
                        'Authentication-Token': `${token}`
                    }
                });
                if (!response.ok) {
                    throw new Error("Failed to fetch service name");
                }
                const data = await response.json();
                return data.name;
            } catch (error) {
                console.error("Error fetching service name:", error);
                return 'Unknown';
            }
        },
        formatDate(date) {
            return new Date(date).toLocaleDateString();
        },
        getStatusText(status) {
            switch (status) {
                case 'requested': return 'Requested';
                case 'accepted': return 'Accepted';
                case 'closed': return 'Closed';
                default: return 'N/A';
            }
        },
        openRequestDetails(request) {
            this.selectedRequest = request;
        },
        closeModal() {
            this.selectedRequest = null;
        }
    }
};
