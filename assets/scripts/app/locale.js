/**
 * locale.js
 * handles internationalization (i18n)
 *
 */
import i18next from 'i18next'
import i18nextXhr from 'i18next-xhr-backend'
import { supplant } from '../util/helpers'
import { API_URL } from './config'

// Default language is set by browser, or is English if undetermined
const defaultLocale = navigator.language || 'en'

export function initLocale () {
  // Current language is the one set by Streetmix or is the browser default, if unset
  const locale = getLocale()
  doTheI18n(locale)
}

export function onNewLocaleSelected (event) {
  setLocale(event.target.value)
}

export function getLocale () {
  return window.localStorage.getItem('locale') || defaultLocale
}

export function setLocale (locale) {
  window.localStorage.setItem('locale', locale)
  doTheI18n(locale)
}

export function clearLocale () {
  window.localStorage.removeItem('locale')
// TODO: clear language cache here if it's activated
}

function doTheI18n (locale) {
  const options = {
    lng: locale,
    ns: ['main', 'segment-info'],
    defaultNS: 'main',
    fallbackLng: 'en',
    load: 'all',
    backend: {
      loadPath: API_URL + 'v1/translate/{{lng}}/{{ns}}'
    }
  }

  const callback = function (err, t) {
    if (err) {
      console.log(err)
    }
    const els = document.querySelectorAll('[data-i18n]')
    for (let i = 0, j = els.length; i < j; i++) {
      const key = els[i].getAttribute('data-i18n')
      let translation = ''
      for (let ns of options.ns) {
        translation = translation || t(key, {ns: options.ns[ns]})
      }
      els[i].textContent = translation
    }

    // Some parts of the UI need to know language has changed
    window.dispatchEvent(new window.CustomEvent('stmx:language_changed'))
  }

  i18next
    .use(i18nextXhr)
    .init(options, callback)
}

export function t (key, fallback, options) {
  const text = i18next.t(key, options)
  if (!text || text === key) {
    // Must manually supplant fallback strings if replacements are necessary
    if (options) {
      return supplant(fallback, options)
    } else {
      // Otherwise return as-is
      return fallback
    }
  } else {
    return text
  }
}
