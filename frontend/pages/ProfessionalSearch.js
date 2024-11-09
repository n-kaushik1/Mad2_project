import ProfessionalClosedServiceRequests from "../components/ProfessionalClosedServiceRequests.js";
import ProfessionalSerAssigned from "../components/ProfessionalSerAssigned.js";

export default {
    components: {
        ProfessionalClosedServiceRequests,
        ProfessionalSerAssigned
    },
    data() {
        return {
            searchQuery: "",          // Holds the search input
            searchField: "address",   // Default search field set to "address" for location
            activeSearchQuery: ""     // Only updates when the search button is pressed
        };
    },
    methods: {
        handleSearch() {
            // Set activeSearchQuery to trigger search in child components
            this.activeSearchQuery = this.searchQuery;
        },
        formatToMMDDYYYY(date) {
            if (!date) return "";
            const parsedDate = new Date(date);
            return `${(parsedDate.getMonth() + 1).toString().padStart(2, '0')}-${parsedDate.getDate().toString().padStart(2, '0')}-${parsedDate.getFullYear()}`;
        },
        formatToYYYYMMDD(date) {
            if (!date) return "";
            const parsedDate = new Date(date);
            return `${parsedDate.getFullYear()}-${(parsedDate.getMonth() + 1).toString().padStart(2, '0')}-${parsedDate.getDate().toString().padStart(2, '0')}`;
        }
    },
    computed: {
        inputType() {
            // Set input type to "date" if searching by date; otherwise, use "text"
            return this.searchField === "date_of_request" ? "date" : "text";
        },
        formattedSearchQuery: {
            get() {
                // Format date for input if the search field is "date_of_request"
                return this.searchField === "date_of_request" ? this.formatToYYYYMMDD(this.searchQuery) : this.searchQuery;
            },
            set(value) {
                // Format date to MM-DD-YYYY when displaying it back in the input
                this.searchQuery = this.searchField === "date_of_request" ? this.formatToMMDDYYYY(value) : value;
            }
        }
    },
    template: `
    <div class="professional">
    <div class="dashboard">
        <!-- Search Section -->
        <div class="section">
            <h2>Search</h2>
            <div class="container my-4">
                <div class="input-group">
                    <!-- Dropdown for selecting the search field -->
                    <select v-model="searchField" class="form-select">
                        <option value="address">Location</option>
                        <option value="pin_code">Pin Code</option>
                        <option value="date_of_request">Date of Request</option>
                    </select>

                    <!-- Text or Date Input for typing the search query -->
                    <input 
                        :type="inputType" 
                        class="form-control" 
                        :placeholder="'Search by ' + (searchField === 'address' ? 'Location' : searchField)"
                        v-model="formattedSearchQuery"
                    />

                    <!-- Search Button -->
                    <button class="btn btn-primary" @click="handleSearch">Search</button>
                </div>
            </div>
        </div>

        <!-- Assigned Service Requests Section -->
        <div class="section">
            <h2>Assigned Service Requests</h2>
            <ProfessionalSerAssigned :searchQuery="activeSearchQuery" :searchField="searchField" />
        </div>

        <!-- Closed Service Requests Section -->
        <div class="section">
            <h2>Closed Service Requests</h2>
            <ProfessionalClosedServiceRequests :searchQuery="activeSearchQuery" :searchField="searchField" />
        </div>
    </div>
</div>
    `,
};
