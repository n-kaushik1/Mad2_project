import { injectStyles } from './injectStyles.js';

export default {
    name: 'ProfessionalSerAssigned',
    props: {
        searchQuery: String,
        searchField: String
    },
    template: `
    <div class="container my-5">
        
        <!-- Assigned Service Requests Table -->
        <div class="table-wrapper">
            <table v-if="assignedServiceRequests.length" class="table table-striped table-hover">
                <thead>
                    <tr>
                        <th scope="col">ID</th>
                        <th scope="col">Customer Name</th>
                        <th scope="col">Address</th>
                        <th class="text-end pe-4" scope="col">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="request in filteredRequests" :key="request.id">
                        <td>{{ request.id }}</td>
                        <td>{{ request.customer_name || 'Unavailable' }}</td>
                        <td>{{ request.address || 'Unavailable' }}</td>
                        <td class="text-end pe-4">
                            <button class="btn btn-primary" @click="openRequestDetails(request)">View</button>
                            <button class="btn btn-warning ms-2" @click="confirmCloseRequest(request.id)">Close Request</button>
                        </td>
                    </tr>
                </tbody>
            </table>
            <p v-else class="text-muted">No assigned service requests available.</p>
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
                            <tr><th>ID</th><td>{{ selectedRequest.id }}</td></tr>
                            <tr><th>Service ID</th><td>{{ selectedRequest.service_id }}</td></tr>
                            <tr><th>Service Name</th><td>{{ selectedRequest.service_name || 'Unknown' }}</td></tr>
                            <tr><th>Customer Name</th><td>{{ selectedRequest.customer_name || 'Unknown' }}</td></tr>
                            <tr><th>Date of Request</th><td>{{ formatDate(selectedRequest.date_of_request) }}</td></tr>
                            <tr><th>Remarks</th><td>{{ selectedRequest.remarks || 'None' }}</td></tr>
                            <tr><th>Customer Phone</th><td>{{ selectedRequest.customer_phone || 'N/A' }}</td></tr>
                            <tr><th>Address</th><td>{{ selectedRequest.address || 'Unavailable' }}</td></tr>
                            <tr><th>Pin Code</th><td>{{ selectedRequest.pin_code || 'N/A' }}</td></tr>
                        </table>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" @click="closeModal">Close</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Close Confirmation Modal -->
        <div v-if="showCloseConfirmation" class="modal fade show" tabindex="-1" style="display: block;">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Confirm Close Request</h5>
                        <button type="button" class="btn-close" @click="cancelCloseRequest" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <p>Are you sure you want to close this request?</p>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" @click="cancelCloseRequest">Cancel</button>
                        <button type="button" class="btn btn-danger" @click="confirmCloseRequestAction">Confirm</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Modal backdrop -->
        <div v-if="selectedRequest || showCloseConfirmation" class="modal-backdrop fade show"></div>
    </div>
    `,
    data() {
        return {
            selectedRequest: null,         // Selected request details for the modal
            errorMessage: null,            // Error message in case of any failure
            showCloseConfirmation: false,  // Flag for showing close confirmation modal
            requestToClose: null           // Holds the ID of the request to close
        };
    },
    computed: {
        serviceRequests() {
            return this.$store.state.serviceRequests;
        },
        assignedServiceRequests() {
            return this.serviceRequests.filter(request => request.service_status === 'accepted');
        },
        filteredRequests() {
            if (!this.searchQuery) return this.assignedServiceRequests;

            const query = this.searchQuery.toLowerCase().trim();
            return this.assignedServiceRequests.filter(request => {
                const fieldValue = (request[this.searchField] || "").toString().toLowerCase();

                // Handle date field formatting specifically for date_of_request
                if (this.searchField === "date_of_request" && fieldValue) {
                    const requestDate = new Date(fieldValue);
                    const formattedRequestDate = `${(requestDate.getMonth() + 1).toString().padStart(2, '0')}-${requestDate.getDate().toString().padStart(2, '0')}-${requestDate.getFullYear()}`;
                    return formattedRequestDate === query;
                }

                // For other fields (like address and pin_code), check if the field contains the query
                return fieldValue.includes(query);
            });
        }
    },
    created() {
        injectStyles();
        this.$store.dispatch('fetchServiceRequests');
    },
    methods: {
        formatDate(date) {
            return date ? new Date(date).toLocaleDateString() : 'N/A';
        },
        openRequestDetails(request) {
            this.selectedRequest = request;
        },
        closeModal() {
            this.selectedRequest = null;
        },
        confirmCloseRequest(requestId) {
            this.requestToClose = requestId;
            this.showCloseConfirmation = true;
        },
        cancelCloseRequest() {
            this.showCloseConfirmation = false;
            this.requestToClose = null;
        },
        async confirmCloseRequestAction() {
            if (this.requestToClose) {
                await this.$store.dispatch('closeRequest', this.requestToClose);
                this.showCloseConfirmation = false;
                this.requestToClose = null;
            }
        },
        async acceptRequest(requestId) {
            await this.$store.dispatch('acceptRequest', requestId);
        },
        async rejectRequest(requestId) {
            await this.$store.dispatch('rejectRequest', requestId);
        }
    }
};
