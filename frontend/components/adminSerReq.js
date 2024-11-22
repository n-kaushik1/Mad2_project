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
        <br>
           <!-- Button to download closed service requests report -->
           <button 
            v-if="hasClosedRequests" 
            class="btn btn-success mb-3" 
            @click="downloadClosedServiceRequestsReport">
            Download Closed Requests Report
        </button>          

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
                                <td>{{ selectedRequest.remarks || 'NA' }}</td>
                            </tr>
                            <tr><th>Ratings</th><td>{{ selectedRequest.rating || 'N/A' }} ★</td></tr>
                            <tr>
                                <th>Customer Message</th>
                                <td>{{ selectedRequest.customer_msg || 'NA' }}</td>
                            </tr>
                            <tr>
                                <th>Customer Phone</th>
                                <td>{{ selectedRequest.customer_phone }}</td>
                            </tr>
                            <tr v-if="selectedRequest.service_status === 'closed'">
                                <th>Date of completion</th>
                                <td>{{ formatDate(selectedRequest.date_of_completion) || 'N/A' }}</td>
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
    computed: {
        hasClosedRequests() {
            return this.serviceRequests.some(request => request.service_status === 'closed');
        }
    },
    created() {
        injectStyles(); // Inject CSS styles when component is created
        this.fetchServiceRequests();
    },
    methods: {
        async fetchServiceRequests() {
            try {
                const token = this.$store.state.auth_token;
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
        async downloadClosedServiceRequestsReport() {
            try {
                // Start the CSV generation task
                const response = await fetch('/create-csv', {
                    headers: {
                        'Authentication-Token': this.$store.state.auth_token
                    }
                });
                if (!response.ok) throw new Error("Failed to initiate report creation");

                const { task_id } = await response.json();
                
                // Polling to check if the task is ready
                const checkTaskStatus = async () => {
                    const resultResponse = await fetch(`/get-csv/${task_id}`, {
                        headers: {
                            'Authentication-Token': this.$store.state.auth_token
                        }
                    });
                    if (resultResponse.ok) {
                        // If ready, download the file
                        const blob = await resultResponse.blob();
                        const url = URL.createObjectURL(blob);
                        const link = document.createElement('a');
                        link.href = url;
                        link.download = 'ClosedServiceRequests.csv';
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                    } else {
                        // Retry after a delay if the task isn't ready
                        setTimeout(checkTaskStatus, 2000);
                    }
                };

                checkTaskStatus();
            } catch (error) {
                console.error("Error downloading closed service requests report:", error);
            }
        },
        async fetchProfessionalName(professional_id) {
            try {
                const token = this.$store.state.auth_token;
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
                const token = this.$store.state.auth_token;
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
                case 'rejected': return 'Rejected';
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
