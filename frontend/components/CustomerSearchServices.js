export default {
    name: 'CustomerSearchSer',
    props: ['searchQuery'],
    template: `
    <div class="container my-5">
        <!-- Services Table -->
        <table class="table table-striped">
            <thead>
                <tr>
                    <th>Service Name</th>
                    <th>Description</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="service in filteredServices" :key="service.id">
                    <td>{{ service.name }}</td>
                    <td>{{ service.description }}</td>
                    <td>
                        <button class="btn btn-info me-2" @click="viewServiceInfo(service)">View Info</button>
                        <button class="btn btn-primary" @click="openProfessionalsModal(service)">Book Now</button>
                    </td>
                </tr>
            </tbody>
        </table>

        <!-- Service Info Modal -->
        <div v-if="selectedServiceInfo" class="modal fade show" tabindex="-1" style="display: block;">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Service Info: {{ selectedServiceInfo.name }}</h5>
                        <button type="button" class="btn-close" @click="closeServiceInfoModal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <table class="details-table">
                            <tr><th>Description</th><td>{{ selectedServiceInfo.description }}</td></tr>
                            <tr><th>Base Price</th><td>Rs {{ selectedServiceInfo.price }}</td></tr>
                            <tr><th>Time Required</th><td>{{ selectedServiceInfo.time_required }} mins</td></tr>
                        </table>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" @click="closeServiceInfoModal">Close</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Professionals Modal -->
        <div v-if="selectedService && professionals.length" class="modal fade show" tabindex="-1" style="display: block;">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Available Professionals for: {{ selectedService.name }}</h5>
                        <button type="button" class="btn-close" @click="closeProfessionalsModal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <div v-for="(professional, index) in professionals" :key="professional.id" class="professional-card p-3 mb-3 border rounded" :style="{ backgroundColor: getProfessionalCardColor(index) }">
                            <h5>{{ professional.name }}</h5>
                            <p>Experience: {{ professional.experience }} years</p>
                            <button class="btn btn-secondary me-2" @click="viewProfile(professional)">View Profile</button>
                            <button class="btn btn-primary" @click="selectProfessional(professional)">Book Service</button>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" @click="closeProfessionalsModal">Close</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Profile Modal -->
        <div v-if="selectedProfessionalProfile" class="modal fade show" tabindex="-1" style="display: block;">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Professional Profile: {{ selectedProfessionalProfile.name }}</h5>
                        <button type="button" class="btn-close" @click="closeProfileModal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <table class="details-table">
                            <tr><th>Name</th><td>{{ selectedProfessionalProfile.name }}</td></tr>
                            <tr><th>Email</th><td>{{ selectedProfessionalProfile.email }}</td></tr>
                            <tr><th>Experience</th><td>{{ selectedProfessionalProfile.experience }} years</td></tr>
                            <tr><th>Description</th><td>{{ selectedProfessionalProfile.description }}</td></tr>
                        </table>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" @click="closeProfileModal">Close</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Booking Modal -->
        <div v-if="selectedProfessional" class="modal fade show" tabindex="-1" style="display: block;">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Book Service with {{ selectedProfessional.name }}</h5>
                        <button type="button" class="btn-close" @click="closeBookingModal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <form @submit.prevent="submitBooking">
                            <div class="mb-3">
                                <label for="customer_msg" class="form-label">Message</label>
                                <input type="text" class="form-control" id="customer_msg" v-model="bookingDetails.customer_msg" placeholder="Additional information">
                            </div>
                            <div class="mb-3">
                                <label for="customerPhone" class="form-label">Customer Phone</label>
                                <input type="text" class="form-control" id="customerPhone" v-model="bookingDetails.customer_phone" required>
                            </div>
                            <button type="submit" class="btn btn-success">Submit Booking</button>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" @click="closeBookingModal">Close</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Modal backdrop -->
        <div v-if="selectedService || selectedProfessional || selectedProfessionalProfile || selectedServiceInfo" class="modal-backdrop fade show"></div>
    </div>
    `,
    data() {
        return {
            services: [],
            selectedService: null,
            selectedServiceInfo: null,
            professionals: [],
            selectedProfessional: null,
            professionalColors: ['#AED581', '#FF8A65', '#4FC3F7', '#FFF176', '#BA68C8', '#E57373'],
            selectedProfessionalProfile: null,
            bookingDetails: {
                customer_msg: '',
                customer_phone: '',
                professional_id: ''
            }
        };
    },
    created() {
        this.fetchServices();
    },
    computed: {
        filteredServices() {
            // Filter services based on searchQuery
            return this.services.filter(service =>
                service.name.toLowerCase().includes(this.searchQuery.toLowerCase())
            );
        }
    },
    methods: {
        async fetchServices() {
            try {
                const response = await fetch('/api/customers/services', {
                    headers: { 'Authentication-Token': this.$store.state.auth_token }
                });
                if (!response.ok) throw new Error("Failed to fetch services.");
                
                this.services = await response.json();
            } catch (error) {
                console.error("Failed to fetch services:", error);
            }
        },
        viewServiceInfo(service) {
            this.selectedServiceInfo = service;
        },
        closeServiceInfoModal() {
            this.selectedServiceInfo = null;
        },
        async openProfessionalsModal(service) {
            this.selectedService = service;
            try {
                const response = await fetch(`/api/services/${service.id}/professionals`, {
                    headers: { 'Authentication-Token': this.$store.state.auth_token }
                });
                if (!response.ok) throw new Error("Failed to fetch professionals.");
                
                this.professionals = await response.json();
            } catch (error) {
                console.error("Failed to fetch professionals:", error);
                this.professionals = [];
            }
        },
        closeProfessionalsModal() {
            this.selectedService = null;
            this.professionals = [];
        },
        viewProfile(professional) {
            this.selectedProfessionalProfile = professional;
        },
        closeProfileModal() {
            this.selectedProfessionalProfile = null;
        },
        selectProfessional(professional) {
            this.selectedProfessional = professional;
            this.bookingDetails.professional_id = professional.id;
        },
        closeBookingModal() {
            this.selectedProfessional = null;
            this.bookingDetails.customer_msg = '';
            this.bookingDetails.customer_phone = '';
            this.bookingDetails.professional_id = '';
        },
        async submitBooking() {
            try {
                const response = await fetch('/api/customers/requests', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authentication-Token': this.$store.state.auth_token
                    },
                    body: JSON.stringify({
                        service_id: this.selectedService.id,
                        customer_msg: this.bookingDetails.customer_msg,
                        customer_phone: this.bookingDetails.customer_phone,
                        professional_id: this.bookingDetails.professional_id
                    })
                });
        
                if (!response.ok) throw new Error("Failed to submit booking.");
        
                alert('Booking successful!');
                this.closeBookingModal();
                this.closeProfessionalsModal();
            } catch (error) {
                console.error("Failed to submit booking:", error);
                alert('Booking failed. Please try again.');
            }
        },
        getProfessionalCardColor(index) {
            return this.professionalColors[index % this.professionalColors.length];
        }
    }
};
