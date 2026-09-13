/* eslint-disable */
import { login } from './login';
import '@babel/polyfill';
import { displayMap } from './leafletMap';

//DOM ELEMENTS
const mapContainer = document.getElementById('map');
const loginForm = document.querySelector('.form');

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
