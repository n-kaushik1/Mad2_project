import CustomerSearchServices from "../components/CustomerSearchServices.js";

export default {
    components: {
        CustomerSearchServices
    },
    data() {
        return {
            searchQuery: "",          // Holds the search input
            activeSearchQuery: ""     // Only updates when the search button is pressed
        };
    },
    methods: {
        handleSearch() {
            // Set activeSearchQuery to trigger search in child components
            this.activeSearchQuery = this.searchQuery;
        }
    },
    computed: {
        inputType() {
            // Set input type to "text" since the search is textual (service name)
            return "text";
        },
        formattedSearchQuery: {
            get() {
                return this.searchQuery;
            },
            set(value) {
                this.searchQuery = value;
            }
        }
    },
    template: `
    <div class="customer">
        <div class="dashboard">
            <!-- Search Section -->
            <div class="section">
                <div class="container my-4">
                    <div class="input-group">
                        <!-- Text Input for typing the search query by service name -->
                        <input 
                            type="text" 
                            class="form-control" 
                            placeholder="Search by Service Name"
                            v-model="formattedSearchQuery"
                        />

                        <!-- Search Button -->
                        <button class="btn btn-primary" @click="handleSearch">Search</button>
                    </div>
                </div>
                <!-- Display Search Results -->
                <CustomerSearchServices :searchQuery="activeSearchQuery" searchField="name" />
            </div>

        </div>
    </div>
    `
};
