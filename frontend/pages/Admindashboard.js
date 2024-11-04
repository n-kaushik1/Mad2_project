import adminServices from "../components/adminServices.js";
import adminProfessionalsReq from "../components/adminProfessionalsReq.js";
import adminSerReq from "../components/adminSerReq.js";


export default {
    components: {
        adminServices,
        adminProfessionalsReq,
        adminSerReq,
    },
    template: `
    <div class="admin">
    <div class="dashboard">
        <div class="section">
            <h2>Services</h2>
            <adminServices />
        </div>
        <div class="section">
            <h2>New Professionals Requests</h2>
            <adminProfessionalsReq />
        </div>
        <div class="section">
            <h2>Service Requests</h2>
            <adminSerReq />
        </div>
    </div>
</div>
    `,
};
