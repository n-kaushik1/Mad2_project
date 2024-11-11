import store from './store.js';

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
      // inline styling via JavaScript 
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
import ProfessionalSearch from '../pages/ProfessionalSearch.js';
import CustomerSearch from '../pages/CustomerSearch.js';
import CustomerSummary from '../pages/CustomerSummary.js';
import ProfessionalSummary from '../pages/ProfessionalSummary.js';
import AdminSummary from '../pages/AdminSummary.js';

const routes = [
    { path: '/', component: Home },
    { path: '/login', component: LoginPage },
    { path: '/register', component: RegisterPage },
    { path: '/admin', component: AdminDashboard, meta: { requiresLogin: true, role: 'Admin' } },
    { path: '/customer', component: CustomerDashboard, meta: { requiresLogin: true, role: 'Customer' } },
    { path: '/professional', component: ProfessionalDashboard, meta: { requiresLogin: true, role: 'Service Professional' } },
    { path: '/adminsearch', component: AdminSearch, meta: { requiresLogin: true, role: 'Admin' } },
    { path: '/professionalsearch', component: ProfessionalSearch, meta: { requiresLogin: true, role: 'Service Professional' } },
    { path: '/professionalsummary', component: ProfessionalSummary, meta: { requiresLogin: true, role: 'Service Professional' } },
    { path: '/customersearch', component: CustomerSearch, meta: { requiresLogin: true, role: 'Customer'  } },
    { path: '/customersummary', component: CustomerSummary, meta: { requiresLogin: true, role: 'Customer'  } },
    { path: '/adminsummary', component: AdminSummary, meta: { requiresLogin: true, role: 'Admin' } },
];

const router = new VueRouter({
    routes
});

// Navigation Guards
router.beforeEach((to, from, next) => {
    if (to.matched.some((record) => record.meta.requiresLogin)) {
        // Check if user is logged in
        if (!store.state.loggedIn) {
            next('/login'); // Redirect to login if not logged in
        } else if (to.meta.role && store.state.role !== to.meta.role) {
            // Redirect based on role if user lacks proper role for the route
            if (store.state.role === 'Admin') {
                alert('role not authorized')
                next('/admin');
            } else if (store.state.role === 'Customer') {
                alert('role not authorized')
                next('/customer');
            } else if (store.state.role === 'Service Professional') {
                alert('role not authorized')
                next('/professional');
            } else {
                next('/'); // Redirect to home if role is not recognized
            }
        } else {
            next(); // Allow access if logged in and role matches
        }
    } else {
        next(); // Allow access if no login is required
    }
});

export default router;
