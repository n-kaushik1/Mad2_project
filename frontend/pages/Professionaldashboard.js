import ProfessionalActiveReq from "../components/professionalActiveReq.js";
import ProfessionalClosedServiceRequests from "../components/ProfessionalClosedServiceRequests.js";
import ProfessionalProfile from "../components/ProfessionalProfile.js";

export default {
    components: {
        ProfessionalActiveReq,
        ProfessionalClosedServiceRequests,
        ProfessionalProfile
    },
    template:  `
        <div class="professional">
            <div class="dashboard">
                <div class="section">
                    <h2>Profile</h2>
                    <ProfessionalProfile/>
                </div>
                <div class="section">
                    <ProfessionalActiveReq/>
                </div>
                <div class="section">
                    <h2>Closed Service Requests</h2>
                    <ProfessionalClosedServiceRequests/>
                </div>
            </div>
        </div>
    `,
};
