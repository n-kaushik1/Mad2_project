import CustomerServices from "../components/CustomerServices.js";
import CustomerSerHistory from "../components/CustomerSerHistory.js";
import CustomerProfile from "../components/CustomerProfile.js";
export default {
    components: {
        CustomerServices,
        CustomerSerHistory,
        CustomerProfile
    },
    template: `
            <div class="customer">
            <div class="dashboard">
                <div class="section">
                <h2>Profile</h2>
                  <CustomerProfile/>
                </div>
                <div class="section">
                    <h2>Looking for?</h2>
                    <CustomerServices/>
                </div>
                <div class="section">
                <h2>Service History</h2>
                <CustomerSerHistory/>
                </div>
            </div>
            </div>
    `,
};
