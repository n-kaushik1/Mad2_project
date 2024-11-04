
const Home = {
    template: `
      <div class="home-page">
        <div class="overlay">
          <div class="content">
            <h1>Welcome to the Homely Services</h1>
            <p>
              We are glad to have you here! Explore our services, connect with us, and enjoy everything our platform has to offer.
              Stay tuned for more updates and features.
            </p>
          </div>
        </div>
      </div>
    `,
    mounted() {
      // Applying inline styling via JavaScript since CSS-in-JS isn't supported directly here
      const style = document.createElement('style');
      style.innerHTML = `
         .home-page {
          height: 100vh;
          width: 100vw;
          background-image: url('/static/logo.jpg');
          background-size: contain;
          background-position: center;
          background-repeat: no-repeat;
          background-attachment: fixed;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          color: #ffffff;
        }
        .overlay {
          background-color: rgba(0, 0, 0, 0.5);
          height: 100%;
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
        .content {
          text-align: center;
          padding: 20px;
          max-width: 600px;
        }
        h1 {
          font-size: 2rem;
          margin-bottom: 1rem;
        }
        p {
          font-size: 1.2rem;
          color: #e0e0e0;
          line-height: 1.6;
        }
      `;
      document.head.appendChild(style);
    }
};

import LoginPage from "../pages/LoginPage.js";
import RegisterPage from "../pages/RegisterPage.js";
import AdminDashboard from "../pages/Admindashboard.js";
import CustomerDashboard from "../pages/Customerdashboard.js";
import ProfessionalDashboard from "../pages/Professionaldashboard.js";
import AdminSearch from "../pages/AdminSearch.js";

const routes = [
    { path: '/', component: Home },
    { path: '/login', component: LoginPage },
    { path: '/register', component: RegisterPage },
    { path: '/admin', component: AdminDashboard }, // Admin Dashboard
    { path: '/customer', component: CustomerDashboard }, // Customer Dashboard
    { path: '/professional', component: ProfessionalDashboard }, // Professional Dashboard
    { path: '/adminsearch', component: AdminSearch }, // Professional Dashboard
];

const router = new VueRouter({
    routes
});

export default router;
