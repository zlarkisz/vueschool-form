import { Form, Field, ErrorMessage, defineRule, configure } from 'vee-validate'
import { required, email, min } from '@vee-validate/rules'
import { localize } from '@vee-validate/i18n'
import { collection, getDocs, getFirestore, query, where } from 'firebase/firestore'

export default (app) => {
  defineRule('required', required)
  defineRule('email', email)
  defineRule('min', min)
  defineRule('unique', async (value, args) => {
    let collectionName, fieldName

    if (Array.isArray(args)) {
      [collectionName, fieldName] = args
    } else {
      ({ collectionName, fieldName } = args)
    }

    const db = getFirestore()
    const querySnapshot = query(
      collection(db, collectionName),
      where(fieldName, '==', value)
    )
    const queryDoc = await getDocs(querySnapshot)

    return queryDoc.empty
  })

  configure({
    generateMessage: localize('en', {
      messages: {
        required: '{field} is required',
        email: '{field} must be a valid email',
        min: '{field} must be 0:{min} characters long',
        unique: '{field} is already taken'
      }
    })
  })

  app.component('VeeForm', Form)
  app.component('VeeField', Field)
  app.component('VeeErrorMessage', ErrorMessage)
}
