/* eslint-disable */
import { login, logout } from './login';
import '@babel/polyfill';
import { displayMap } from './leafletMap';
import { updateSettings } from './updateSettings';

//DOM ELEMENTS
const mapContainer = document.getElementById('map');
const loginForm = document.querySelector('.form--login');
const userDataForm = document.querySelector('.form-user-data');
const passwordChangeForm = document.querySelector('.form-password-change');
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

if (userDataForm) {
  userDataForm.addEventListener('submit', (ele) => {
    ele.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    updateSettings({ name, email }, 'data');
  });
}

if (passwordChangeForm) {
  passwordChangeForm.addEventListener('submit', async (ele) => {
    ele.preventDefault();
    const saveBtn = document.querySelector('.btn--save-password');
    saveBtn.textContent = 'Updating...';
    const currentPassword = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;
    await updateSettings(
      { currentPassword, password, passwordConfirm },
      'password',
    );
    saveBtn.textContent = 'Save password';
  });
}
