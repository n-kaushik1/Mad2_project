export default {
    name: 'CustomerService',
    template: `
    <div class="container my-5">
        <!-- Service Categories -->
        <div class="row justify-content-center text-center">
            <div class="col-md-3 mb-4" v-for="(service, index) in services" :key="service.id">
                <div class="card service-card p-4 rounded shadow-sm" :style="{ backgroundColor: getServiceCardColor(index) }">
                    <div class="card-body">
                        <h5 class="card-title">{{ service.name }}</h5>
                        <button class="btn btn-primary mt-3" @click.stop="openProfessionalsModal(service)">Book Now</button>
                        <button class="btn btn-info mt-3" @click.stop="viewServiceInfo(service)">View Info</button>
                    </div>
                </div>
            </div>
        </div>

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
                        <button type="button" class="btn-close" @click="closeModal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <div 
                            v-for="(professional, index) in professionals" 
                            :key="professional.id" 
                            class="professional-card p-3 mb-3 border rounded"
                            :style="{ backgroundColor: getProfessionalCardColor(index) }"
                        >
                            <h5>{{ professional.name }}</h5>
                            <p>Experience: {{ professional.experience }} years</p>
                            <button class="btn btn-secondary me-2" @click="viewProfile(professional)">View Profile</button>
                            <button class="btn btn-primary" @click="selectProfessional(professional)">Book Service</button>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" @click="closeModal">Close</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- No Professionals Available Modal -->
<div v-if="showUnavailableModal" class="modal fade show d-block" style="z-index: 1055;">
<div class="modal-dialog modal-lg">
    <div class="modal-content">
        <div class="modal-header">
            <h5 class="modal-title">Service Unavailable</h5>
            <button type="button" class="btn-close" @click="closeUnavailableModal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
            <p>Currently, we cannot book this service as no professionals are available. Please check back later.</p>
        </div>
        <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeUnavailableModal">Close</button>
        </div>
    </div>
</div>
</div>



        <!-- Profile Modal -->
        <div v-if="selectedProfessionalProfile" class="modal fade show" tabindex="-1" style="display: block;">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Professional Profile</h5>
                        <button type="button" class="btn-close" @click="closeProfileModal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <table class="details-table">
                            <tr><th>Name</th><td>{{ selectedProfessionalProfile.name }}</td></tr>
                            <tr><th>Email</th><td>{{ selectedProfessionalProfile.email }}</td></tr>
                            <tr><th>Experience</th><td>{{ selectedProfessionalProfile.experience }} years</td></tr>
                            <tr><th>Description</th><td>{{ selectedProfessionalProfile.description }}</td></tr>
                            <tr><th>Address</th><td>{{ selectedProfessionalProfile.address }}</td></tr>
                            <tr><th>Pin Code</th><td>{{ selectedProfessionalProfile.pin_code }}</td></tr>
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
                        <button type="button" class="btn-close" @click="closeModal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <form @submit.prevent="submitBooking">
                            <div class="mb-3">
                                <label for="customer_msg" class="form-label">Message</label>
                                <input type="text" class="form-control" id="customer_msg" v-model="bookingDetails.customer_msg" placeholder="Any additional information">
                            </div>
                            <div class="mb-3">
                                <label for="customerPhone" class="form-label">Customer Phone</label>
                                <input type="text" class="form-control" id="customerPhone" v-model="bookingDetails.customer_phone" required>
                            </div>
                            <button type="submit" class="btn btn-success">Submit Booking</button>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" @click="closeModal">Close</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Modal backdrop -->
        <div v-if="selectedService || selectedProfessional || selectedProfessionalProfile || selectedServiceInfo || showUnavailableModal" class="modal-backdrop fade show"></div>
    </div>
    `,
    data() {
        return {
            services: [],
            selectedService: null,
            selectedProfessional: null,
            professionals: [],
            serviceColors: ['#FFCDD2', '#C8E6C9', '#BBDEFB', '#FFF9C4', '#D1C4E9', '#FFCCBC'],
            professionalColors: ['#AED581', '#FF8A65', '#4FC3F7', '#FFF176', '#BA68C8', '#E57373'],
            bookingDetails: {
                remarks: '',
                customer_phone: '',
                professional_id: ''
            },
            selectedProfessionalProfile: null,
            selectedServiceInfo: null,
            showUnavailableModal: false // Added for handling no professionals available modal
        };
    },
    created() {
        this.fetchServices();
    },
    methods: {
        async fetchServices() {
            try {
                const response = await fetch('/api/customers/services', {
                    headers: {
                        'Authentication-Token': this.$store.state.auth_token
                    }
                });
                if (!response.ok) throw new Error("Failed to fetch services.");
                
                const services = await response.json();
                this.services = services;
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
                    headers: {
                        'Authentication-Token': this.$store.state.auth_token
                    }
                });
        
                if (!response.ok) {
                    throw new Error(`Failed to fetch professionals: ${response.statusText}`);
                }
        
                const professionals = await response.json();
                if (professionals.length === 0) {
                    // No professionals available
                    this.professionals = [];
                    this.showUnavailableModal = true; // Trigger "No Professionals Available" modal
                } else {
                    this.professionals = professionals; // Populate professionals
                }
            } catch (error) {
                console.error("Failed to fetch professionals:", error);
                this.professionals = [];
                this.showUnavailableModal = true; // Show the modal if fetch fails
            }
        },
        closeModal() {
            this.selectedService = null;
            this.selectedProfessional = null;
            this.professionals = [];
        },
        closeUnavailableModal() {
            this.showUnavailableModal = false;
            const backdrops = document.querySelectorAll('.modal-backdrop');
            backdrops.forEach((backdrop) => backdrop.remove());
        },
        closeProfileModal() {
            this.selectedProfessionalProfile = null;
        },
        viewProfile(professional) {
            this.selectedProfessionalProfile = professional;
        },
        selectProfessional(professional) {
            this.selectedProfessional = professional;
            this.bookingDetails.professional_id = professional.id;
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
                this.closeModal();
            } catch (error) {
                console.error("Failed to submit booking:", error);
                alert('Booking failed. Please try again.');
            }
        },
        getServiceCardColor(index) {
            return this.serviceColors[index % this.serviceColors.length];
        },
        getProfessionalCardColor(index) {
            return this.professionalColors[index % this.professionalColors.length];
        }
    }
};
