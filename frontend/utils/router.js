const Home = {
    template : `<h1> This is a Home page </h1>`
}
import LoginPage from "../pages/LoginPage.js";
import RegisterPage from "../pages/RegisterPage.js";

const routes = [
    {path : '/',component : Home},
    {path : '/login',component : LoginPage},
    {path : '/register',component : RegisterPage},
]

const router = new VueRouter({
    routes
})

export default router;