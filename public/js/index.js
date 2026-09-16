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
    //FormData instead of plain objects (which axios parses to application/json)
    // builds a multipart/form-data body, the same wire format Multer expects on the server
    const form = new FormData();
    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);
    form.append('photo', document.getElementById('photo').files[0]);
    updateSettings(form, 'data');
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
