import {boot} from 'quasar/wrappers'
import access from 'src/utils/access'

// در دسترس بودن قوانین دسترسی در همه‌ی قالب‌ها: $access.can('sales.delete')، $access.isAdmin() و ...
export default boot(({app}) => {
  app.config.globalProperties.$access = access
})
