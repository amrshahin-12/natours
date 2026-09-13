/* eslint-disable */
import { login, logout } from './login';
import '@babel/polyfill';
import { displayMap } from './leafletMap';

//DOM ELEMENTS
const mapContainer = document.getElementById('map');
const loginForm = document.querySelector('.form');
const logoutBtn = document.querySelector('.nav__el--logout');

//VALUES

//DELEGATION
if (mapContainer) {
  const locations = JSON.parse(mapContainer.dataset.locations);
  displayMap(locations);
}

if (loginForm) {
  loginForm.addEventListener('submit', (ele) => {
    ele.preventDefault();
    //to capture email and password after they are submitted
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });
}

if (logoutBtn) {
  logoutBtn.addEventListener('click', logout);
}
