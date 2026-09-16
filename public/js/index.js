/* eslint-disable */

//DO WE NEED TO AWAIT THE CB FUNCS INSIDE addEventListener???

import { login, logout } from './login';
import { signup } from './signup';
import '@babel/polyfill';
import { displayMap } from './leafletMap';
import { updateSettings } from './updateSettings';

//DOM ELEMENTS
const mapContainer = document.getElementById('map');
const loginForm = document.querySelector('.form--login');
const signupForm = document.querySelector('.form--signup');
const userDataForm = document.querySelector('.form-user-data');
const passwordChangeForm = document.querySelector('.form-password-change');
const logoutBtn = document.querySelector('.nav__el--logout');

//VALUES

//DELEGATION
if (mapContainer) {
  const locations = JSON.parse(mapContainer.dataset.locations);
  displayMap(locations);
}

if (signupForm) {
  signupForm.addEventListener('submit', async (ele) => {
    ele.preventDefault();

    const submitbtn = signupForm.querySelector('.btn');
    const originalText = submitbtn.textContent;
    //change btn text and disable it
    submitbtn.textContent = 'Signing up...';
    submitbtn.disable = true;

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('passwordConfirm').value;
    await signup(name, email, password, passwordConfirm);

    submitbtn.textContent = originalText;
    submitbtn.disable = false;
  });
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
