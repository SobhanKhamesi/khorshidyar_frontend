import axios from 'axios'
import {LocalStorage, Notify} from "quasar";

// const api = axios.create({baseURL: 'https://demo3.boomrangcrm.com/v6.1.0/api/'})
// const api = axios.create({baseURL: 'http://127.0.0.1:8000/api/'})
// const api = axios.create({baseURL: 'http://172.20.10.2:8000/api/'})
const api = axios.create({baseURL: 'https://khrshdyar.ir/v1/api/'})


if (LocalStorage.getItem('auth')) {
  let token = LocalStorage.getItem('token')
  if (token) {
    api.defaults.headers.common['Authorization'] = 'Bearer ' + token
  }
}

api.interceptors.response.use(function (response) {
  return response;
}, function (error) {
  if (error.response.data.errors !== undefined && Object.values(error.response.data.errors).length > 0) {
    let errorsPackage = Object.values(error.response.data.errors)
    for (let i = 0; i < errorsPackage.length; i++) {
      Notify.create({
        position: 'bottom',
        type: 'negative',
        progress: true,
        message: errorsPackage[i]
      })
    }
  }
  else if (error.response.status === 404) {
    Notify.create({
      position: 'center',
      type: 'negative',
      progress: true,
      message: error.response.data.message
    })


    setTimeout(() =>
        location.href = '/'
      , 2000);


  } else if (error.response.status === 422) {
    Notify.create({
      position: 'bottom',
      type: 'negative',
      progress: true,
      message: error.response.data.message
    })
  } else if (error.response.status === 500) {
    Notify.create({
      position: 'bottom',
      type: 'negative',
      progress: true,
      message: error.response.data.message ?? 'مشکلی در سمت سرور رخ داده است'
    })
  } else if (error.response.status === 401) {
    Notify.create({
      position: 'center',
      type: 'negative',
      progress: true,
      message: 'نشست شما منقضی شده است'
    })

   LocalStorage.clear()

    setTimeout(() =>
        location.reload()
      , 1000);

  } else if (error.response.status === 403) {
    Notify.create({
      position: 'center',
      type: 'negative',
      progress: true,
      message: 'دسترسی ندارید !'
    })

    setTimeout(() =>
            location.href = '/'
        , 1000);

  }

  return Promise.reject(error);
});


export {axios, api}
