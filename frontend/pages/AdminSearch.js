import adminAllProfessionals from "../components/adminAllProfessionals.js";
import adminCustomers from "../components/adminCustomers.js";
import adminSearchServices from "../components/adminSearchServices.js";

export default {
    components: {
        adminAllProfessionals,
        adminCustomers,
        adminSearchServices
    },
    data() {
        return {
            searchQuery: "",         // Holds the typed search query
            selectedComponent: "all", // Tracks which component to search in
            activeSearchQuery: {      // Stores search query for each component
                professionals: "",
                customers: "",
                services: ""
            }
        };
    },
    methods: {
        handleSearch() {
            // Update the search query based on selected component
            if (this.selectedComponent === "all") {
                this.activeSearchQuery.professionals = this.searchQuery;
                this.activeSearchQuery.customers = this.searchQuery;
                this.activeSearchQuery.services = this.searchQuery;
            }else if (this.selectedComponent === "professionals") {
                this.activeSearchQuery.professionals = this.searchQuery;
            } else if (this.selectedComponent === "customers") {
                this.activeSearchQuery.customers = this.searchQuery;
            } else if (this.selectedComponent === "services") {
                this.activeSearchQuery.services = this.searchQuery;
            }
        }
    },
    template: `
    <div class="admin">
        <div class="dashboard">
            <!-- Search Section -->
            <div class="section">
                <h2>Search</h2>
                <div class="container my-4">
                    <div class="input-group">
                        <!-- Dropdown for selecting component to search -->
                        <select v-model="selectedComponent" class="form-select">
                            <option value="all">All</option>
                            <option value="professionals">Professionals</option>
                            <option value="customers">Customers</option>
                            <option value="services">Services</option>
                        </select>

                        <!-- Text Input for typing the search query -->
                        <input 
                            type="text" 
                            class="form-control" 
                            placeholder="Type search query..."
                            v-model="searchQuery"
                        />

                        <!-- Search Button -->
                        <button class="btn btn-primary" @click="handleSearch">Search</button>
                    </div>
                </div>
            </div>

            <!-- Services Section -->
            <div class="section">
                <adminSearchServices 
                    :searchQuery="activeSearchQuery.services" 
                    v-if="selectedComponent === 'all' || selectedComponent === 'services'" 
                />
            </div>

            <!-- Professionals Section -->
            <div class="section">
                <adminAllProfessionals 
                    :searchQuery="activeSearchQuery.professionals" 
                    v-if="selectedComponent === 'all' || selectedComponent === 'professionals'" 
                />
            </div>

            <!-- Customers Section -->
            <div class="section">
                <adminCustomers 
                    :searchQuery="activeSearchQuery.customers" 
                    v-if="selectedComponent === 'all' || selectedComponent === 'customers'" 
                />
            </div>
        </div>
    </div>
`

};
