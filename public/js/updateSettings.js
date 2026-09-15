/* eslint-disable */
import { showAlert } from './alerts';
import axios from 'axios';

//type: 'password' / 'data'
export const updateSettings = async (data, type) => {
  try {
    const url =
      type === 'password'
        ? 'http://127.0.0.1:3000/api/v1/users/update-password'
        : 'http://127.0.0.1:3000/api/v1/users/updateMe';

    const res = await axios({
      method: 'PATCH',
      url,
      data,
    });
    if (res.data.status === 'success') {
      showAlert('success', `${type.toUpperCase()} updated successfully!`);
      if (type === 'password') {
        //clear fields on successful attempt
        document.getElementById('password-current').value = '';
        document.getElementById('password').value = '';
        document.getElementById('password-confirm').value = '';
      } else {
        window.setTimeout(() => {
          location.assign('/me');
        }, 500);
      }
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

// export const updatePassword = async (
//   currentPassword,
//   password,
//   passwordConfirm,
// ) => {
//   try {
//     const res = await axios({
//       method: 'PATCH',
//       url: 'http://127.0.0.1:3000/api/v1/users/update-password',
//       data: {
//         currentPassword,
//         password,
//         passwordConfirm,
//       },
//     });
//     if (res.data.status === 'success') {
//       showAlert('success', 'Password updated successfully!');
//       //clear fields on successful attempt
//       document.getElementById('password-current').value = '';
//       document.getElementById('password').value = '';
//       document.getElementById('password-confirm').value = '';
//     }
//   } catch (err) {
//     showAlert('error', err.response.data.message);
//   }
// };
