/*=============== SETTINGS YOU CAN EDIT ===============*/
// WhatsApp number: country code + number, no "+", no spaces. Tanzania example: 255712345678
const WHATSAPP_NUMBER = '255725484857'

// Messages sent to WhatsApp. {package} and {price} are replaced automatically.
const WHATSAPP_MESSAGES = {
  general: "Hello Junior, I found your portfolio website and I'd like to discuss a website project.",
  package: "Hello Junior, I'm interested in the {package} package (starting price: {price}). I'd like to discuss my project."
}

// Contact form (EmailJS). Replace these if you create a new EmailJS service.
const EMAILJS_SERVICE_ID = 'service_ctwlmir'
const EMAILJS_TEMPLATE_ID = 'template_xs2iyfc'
const EMAILJS_PUBLIC_KEY = 'etrdKzkCPBWP0mLCz'
// true = when sending fails, the real EmailJS error is shown under the form (good while testing).
// Set it to false when everything works.
const EMAILJS_DEBUG = true

// Where you receive emails, and the email visitors write to
const CONTACT_EMAIL = 'juniormgaya500@gmail.com'
const EMAIL_SUBJECT = "Website inquiry from Junior's Portfolio"
const EMAIL_BODY = "Hello Junior,\n\nI would like to talk about a website for my business.\n\nMy name: "

// What the Location button opens. Use a place name, or coordinates copied from Google Maps (e.g. '-6.7924,39.2083')
const LOCATION_QUERY = 'Dar es Salaam, Tanzania'

const navMenu = document.getElementById('nav-menu'),
  navToggle = document.getElementById('nav-toggle'),
  navToggleIcon = navToggle ? navToggle.querySelector('i') : null

const setMenu = (open) =>{
  navMenu.classList.toggle('show-menu', open)
  navToggle.setAttribute('aria-expanded', open)
  // change the icon class only (never replace the element, or outside-tap detection breaks)
  navToggleIcon.className = open ? 'ri-close-line' : 'ri-menu-line'
}

if(navToggle){
  navToggle.addEventListener('click', () =>{
    setMenu(!navMenu.classList.contains('show-menu'))
  })
}

// Close when tapping outside the menu or pressing Esc
document.addEventListener('click', (e) =>{
  if(!navMenu.classList.contains('show-menu')) return
  if(e.target.closest('#nav-menu') || e.target.closest('#nav-toggle')) return
  setMenu(false)
})
document.addEventListener('keydown', (e) =>{
  if(e.key === 'Escape') setMenu(false)
})

const navLink = document.querySelectorAll('.nav__link, .nav__contact')
navLink.forEach(n => n.addEventListener('click', () => setMenu(false)))

/*=============== ACCOUNT (saved on this device) ===============*/
const USERS_KEY = 'jr_users',
  SESSION_KEY = 'jr_session',
  REMEMBER_KEY = 'jr_remember',
  HUE_KEY = 'jr_hue'

const store = {
  get(key, fallback){
    try{ const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback }
    catch{ return fallback }
  },
  set(key, value){
    try{ localStorage.setItem(key, JSON.stringify(value)); return true }
    catch{ return false }
  },
  remove(key){
    try{ localStorage.removeItem(key) }catch{}
  }
}

// "Remember me" ON  -> the login is kept in localStorage (stays after the browser is closed)
// "Remember me" OFF -> the login is kept in sessionStorage (ends when the tab / browser is closed)
const sessionStore = {
  get(){
    try{ const v = sessionStorage.getItem(SESSION_KEY); return v ? JSON.parse(v) : null }
    catch{ return null }
  },
  set(email){
    try{ sessionStorage.setItem(SESSION_KEY, JSON.stringify(email)); return true }
    catch{ return false }
  },
  remove(){
    try{ sessionStorage.removeItem(SESSION_KEY) }catch{}
  }
}

const getSessionEmail = () => store.get(SESSION_KEY, null) || sessionStore.get()

const startSession = (email, remember) =>{
  if(remember){
    store.set(SESSION_KEY, email)
    sessionStore.remove()
    store.set(REMEMBER_KEY, email)
  }else{
    store.remove(SESSION_KEY)
    store.remove(REMEMBER_KEY)
    // if the browser blocks sessionStorage, fall back to a normal saved login
    if(!sessionStore.set(email)) store.set(SESSION_KEY, email)
  }
}

const endSession = () =>{
  store.remove(SESSION_KEY)
  sessionStore.remove()
}

const bytesToHex = (buf) => [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('')

const hashPassword = async (password, salt) =>{
  if(window.crypto && crypto.subtle){
    const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits'])
    const bits = await crypto.subtle.deriveBits(
      { name: 'PBKDF2', salt: new TextEncoder().encode(salt), iterations: 100000, hash: 'SHA-256' }, key, 256)
    return bytesToHex(bits)
  }
  // Fallback for non-secure contexts (weak, but the data stays on this device)
  let h = 5381
  const s = salt + password
  for(let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0
  return 'x' + h
}

const randomSalt = () =>{
  if(window.crypto && crypto.getRandomValues) return bytesToHex(crypto.getRandomValues(new Uint8Array(16)))
  return String(Math.random()).slice(2) + Date.now()
}

const htmlEl = document.documentElement,
  auth = document.getElementById('auth'),
  authNote = document.getElementById('auth-note'),
  accountBtn = document.getElementById('account-btn'),
  accountAvatar = document.getElementById('account-avatar'),
  accountName = document.getElementById('account-name'),
  accountSub = document.getElementById('account-sub'),
  loginForm = document.getElementById('login-form'),
  signupForm = document.getElementById('signup-form'),
  settings = document.getElementById('settings')

const getUsers = () => store.get(USERS_KEY, [])
const getCurrentUser = () =>{
  const email = getSessionEmail()
  return email ? getUsers().find(u => u.email === email) || null : null
}
const updateUser = (email, patch) =>{
  const users = getUsers(),
    user = users.find(u => u.email === email)
  if(!user) return false
  Object.assign(user, patch)
  return store.set(USERS_KEY, users)
}

const initial = (user) => (user.name || user.email).trim().charAt(0)

// Show the picture if the user has one, otherwise the first letter
const paintAvatar = (el, user) =>{
  if(user.avatar){
    el.style.backgroundImage = 'url("' + user.avatar + '")'
    el.classList.add('has-img')
    el.textContent = ''
  }else{
    el.style.backgroundImage = ''
    el.classList.remove('has-img')
    el.textContent = initial(user)
  }
}

/*---------- Theme (changes --hue on :root) ----------*/
const THEMES = [
  { name: 'Blue', hue: 220 },
  { name: 'Green', hue: 110 },
  { name: 'Teal', hue: 175 },
  { name: 'Cyan', hue: 195 },
  { name: 'Purple', hue: 270 },
  { name: 'Pink', hue: 330 },
  { name: 'Red', hue: 355 },
  { name: 'Orange', hue: 25 },
  { name: 'Yellow', hue: 48 },
  // White is not a hue: it needs 0% saturation and a high lightness
  { name: 'White', hue: 220, sat: 0, light: 92, g1: 78, g2: 97 }
]
const DEFAULT_THEME = THEMES[0]

const withDefaults = (t) => ({
  name: t.name, hue: t.hue,
  sat: t.sat ?? 90, light: t.light ?? 55, g1: t.g1 ?? 60, g2: t.g2 ?? 85
})

const currentTheme = () =>{
  const saved = store.get(HUE_KEY, null)
  if(saved === null) return DEFAULT_THEME
  if(typeof saved === 'object' && saved.name === 'Custom' && typeof saved.hue === 'number') return saved
  const name = typeof saved === 'object' ? saved.name : null
  return THEMES.find(t => t.name === name) || THEMES.find(t => t.hue === Number(saved) && t.sat === undefined) || DEFAULT_THEME
}

const applyTheme = (theme) =>{
  const t = withDefaults(theme)
  htmlEl.style.setProperty('--hue', t.hue)
  htmlEl.style.setProperty('--sat', t.sat + '%')
  htmlEl.style.setProperty('--light', t.light + '%')
  htmlEl.style.setProperty('--g1', t.g1 + '%')
  htmlEl.style.setProperty('--g2', t.g2 + '%')
  document.querySelectorAll('.theme__swatch').forEach(b =>
    b.classList.toggle('active', b.dataset.name === t.name))
}

const themeGrid = document.getElementById('theme-grid')
THEMES.forEach(t =>{
  const d = withDefaults(t),
    btn = document.createElement('button')
  btn.type = 'button'
  btn.className = 'theme__swatch'
  btn.dataset.name = t.name
  btn.style.setProperty('--h', d.hue)
  btn.style.setProperty('--s', d.sat + '%')
  btn.style.setProperty('--l', d.light + '%')
  btn.innerHTML = '<span class="theme__dot"><i class="ri-check-line"></i></span><span class="theme__name"></span>'
  btn.querySelector('.theme__name').textContent = t.name
  btn.addEventListener('click', () =>{
    store.set(HUE_KEY, { name: t.name, hue: t.hue })
    applyTheme(t)
  })
  themeGrid.appendChild(btn)
})

/*---------- Custom color: the visitor can pick any color ----------*/
const hexToHsl = (hex) =>{
  const r = parseInt(hex.slice(1, 3), 16) / 255,
    g = parseInt(hex.slice(3, 5), 16) / 255,
    b = parseInt(hex.slice(5, 7), 16) / 255,
    max = Math.max(r, g, b), min = Math.min(r, g, b),
    l = (max + min) / 2,
    d = max - min
  let h = 0, s = 0

  if(d){
    s = d / (1 - Math.abs(2 * l - 1))
    if(max === r) h = ((g - b) / d) % 6
    else if(max === g) h = (b - r) / d + 2
    else h = (r - g) / d + 4
    h = Math.round(h * 60)
    if(h < 0) h += 360
  }
  return { h, s: Math.round(s * 100), l: Math.round(l * 100) }
}

const hslToHex = (h, s, l) =>{
  s /= 100; l /= 100
  const k = (n) => (n + h / 30) % 12,
    a = s * Math.min(l, 1 - l),
    f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))
  return '#' + [f(0), f(8), f(4)].map(x => Math.round(x * 255).toString(16).padStart(2, '0')).join('')
}

// Very dark colors would disappear on the dark background, so lightness stays between 35% and 95%
const customFromHex = (hex) =>{
  const { h, s, l } = hexToHsl(hex),
    light = Math.min(95, Math.max(35, l))
  return { name: 'Custom', hue: h, sat: s, light, g1: Math.min(90, light + 5), g2: Math.min(97, light + 30) }
}

const customTile = document.createElement('label')
customTile.className = 'theme__swatch theme__custom'
customTile.dataset.name = 'Custom'
customTile.innerHTML = '<span class="theme__dot"><i class="ri-palette-line theme__plus"></i><i class="ri-check-line"></i></span>' +
  '<span class="theme__name">Custom</span>' +
  '<input type="color" class="theme__input" aria-label="Choose any color" value="#2f6bff">'
themeGrid.appendChild(customTile)

const customInput = customTile.querySelector('.theme__input')

const paintCustomTile = (t) =>{
  customTile.classList.add('has-color')
  customTile.style.setProperty('--h', t.hue)
  customTile.style.setProperty('--s', t.sat + '%')
  customTile.style.setProperty('--l', t.light + '%')
  customInput.value = hslToHex(t.hue, t.sat, t.light)
}

customInput.addEventListener('input', () =>{
  const t = customFromHex(customInput.value)
  store.set(HUE_KEY, t)
  paintCustomTile(t)
  applyTheme(t)
})

document.getElementById('theme-reset').addEventListener('click', () =>{
  store.remove(HUE_KEY)
  customTile.classList.remove('has-color')
  applyTheme(DEFAULT_THEME)
})

const startTheme = currentTheme()
if(startTheme.name === 'Custom') paintCustomTile(startTheme)
applyTheme(startTheme)

/*---------- Account row in the menu + contact form prefill ----------*/
const refreshAccountUI = () =>{
  const user = getCurrentUser()

  if(user){
    paintAvatar(accountAvatar, user)
    accountName.textContent = user.name
    accountSub.textContent = 'View your profile'
    accountBtn.setAttribute('aria-label', 'Open profile')

  }else{
    accountAvatar.style.backgroundImage = ''
    accountAvatar.classList.remove('has-img')
    accountAvatar.innerHTML = '<i class="ri-user-3-line"></i>'
    accountName.textContent = 'Login / Sign up'
    accountSub.textContent = 'Create an account to get started'
    accountBtn.setAttribute('aria-label', 'Open account')
  }
}

// If the saved session points to a deleted account, go back to the welcome page
// data-require-login="true" on <html> forces visitors to log in before they see the website
const loginRequired = htmlEl.dataset.requireLogin === 'true'

if(!getCurrentUser()){
  endSession()
  htmlEl.classList.add('guest')
  htmlEl.classList.toggle('gated', loginRequired)
}else{
  htmlEl.classList.remove('guest', 'gated')
}

const lockScroll = () =>{
  document.body.classList.toggle('no-scroll',
    auth.classList.contains('show-auth') || settings.classList.contains('show-settings'))
}

/*---------- Login / sign up window (flip card) ----------*/
const authFlip = document.getElementById('auth-flip'),
  faceLogin = document.getElementById('face-login'),
  faceSignup = document.getElementById('face-signup'),
  resetForm = document.getElementById('reset-form'),
  authForms = [loginForm, signupForm, resetForm]

const EMAIL_RE = /^\S+@\S+\.\S+$/

const field = (form, name) => form.elements.namedItem(name)

const setMsg = (form, text, ok = false) =>{
  const msg = form.querySelector('.auth__msg')
  msg.textContent = text
  msg.classList.toggle('ok', ok)
}

const clearInvalid = (form) =>
  form.querySelectorAll('[aria-invalid]').forEach(i => i.removeAttribute('aria-invalid'))

// Shows the error under the form and puts the cursor in the field that needs fixing
const fail = (form, text, input) =>{
  setMsg(form, text)
  if(input){
    input.setAttribute('aria-invalid', 'true')
    input.focus()
  }
}

const setBusy = (form, busy) =>{
  form.querySelector('.auth__btn').disabled = busy
}

auth.querySelectorAll('.auth__field input').forEach(input =>
  input.addEventListener('input', () => input.removeAttribute('aria-invalid')))

// Show one of: 'login' (front), 'signup' (back of the card) or 'reset' (forgot password)
const showView = (name, animate = true) =>{
  const back = name === 'signup'

  if(!animate) authFlip.classList.add('no-anim')
  authFlip.classList.toggle('flipped', back)
  if(!animate){
    void authFlip.offsetWidth // apply the change instantly, then turn the animation back on
    authFlip.classList.remove('no-anim')
  }

  faceLogin.querySelectorAll('.auth__view').forEach(v =>{
    v.hidden = v.dataset.view !== (name === 'reset' ? 'reset' : 'login')
  })

  // only the face you can see can be reached with the keyboard
  faceLogin.toggleAttribute('inert', back)
  faceSignup.toggleAttribute('inert', !back)

  authForms.forEach(f =>{ setMsg(f, ''); clearInvalid(f) })

  // "Remember me" fills in the email you used last time
  if(name === 'login'){
    const saved = store.get(REMEMBER_KEY, '')
    if(saved && !field(loginForm, 'email').value){
      field(loginForm, 'email').value = saved
      field(loginForm, 'remember').checked = true
    }
  }
}

const hidePasswords = () =>{
  auth.querySelectorAll('.auth__eye').forEach(btn =>{
    btn.dataset.toggle.split(',').forEach(id => { document.getElementById(id).type = 'password' })
    btn.querySelector('i').className = 'ri-eye-line'
    btn.setAttribute('aria-label', 'Show password')
    btn.setAttribute('aria-pressed', 'false')
  })
}

const openAuth = (view, note) =>{
  showView(view || 'login', false)
  authNote.hidden = !note
  authNote.textContent = note || ''
  auth.classList.add('show-auth')
  auth.setAttribute('aria-hidden', 'false')
  lockScroll()
}

const closeAuth = () =>{
  auth.classList.remove('show-auth')
  auth.setAttribute('aria-hidden', 'true')
  authForms.forEach(f =>{ f.reset(); setMsg(f, ''); clearInvalid(f) })
  hidePasswords()
  lockScroll()
}

auth.querySelectorAll('[data-auth-close]').forEach(el => el.addEventListener('click', closeAuth))

document.querySelectorAll('[data-open-auth]').forEach(el =>
  el.addEventListener('click', () =>{
    setMenu(false)
    openAuth(el.dataset.openAuth)
  }))

auth.querySelectorAll('[data-switch]').forEach(btn =>
  btn.addEventListener('click', () => showView(btn.dataset.switch)))

// Eye button: shows / hides the password (the sign up and reset eyes also show the confirm field)
auth.querySelectorAll('.auth__eye').forEach(btn =>
  btn.addEventListener('click', () =>{
    const inputs = btn.dataset.toggle.split(',').map(id => document.getElementById(id)),
      show = inputs[0].type === 'password'

    inputs.forEach(input => { input.type = show ? 'text' : 'password' })
    btn.querySelector('i').className = show ? 'ri-eye-off-line' : 'ri-eye-line'
    btn.setAttribute('aria-label', show ? 'Hide password' : 'Show password')
    btn.setAttribute('aria-pressed', String(show))
  }))

// Reload so the whole website (animations, carousel) starts fresh for the logged-in user
const enterSite = () => { window.location.reload() }

signupForm.addEventListener('submit', async (e) =>{
  e.preventDefault()
  clearInvalid(signupForm)
  setMsg(signupForm, '')

  const nameInput = field(signupForm, 'name'),
    emailInput = field(signupForm, 'email'),
    passInput = field(signupForm, 'password'),
    confirmInput = field(signupForm, 'confirm'),
    name = nameInput.value.trim(),
    email = emailInput.value.trim().toLowerCase(),
    password = passInput.value

  if(name.length < 2) return fail(signupForm, 'Please enter your name.', nameInput)
  if(!EMAIL_RE.test(email)) return fail(signupForm, 'Please enter a valid email.', emailInput)
  if(password.length < 6) return fail(signupForm, 'Password must be at least 6 characters.', passInput)
  if(confirmInput.value !== password) return fail(signupForm, 'The two passwords do not match.', confirmInput)

  const users = getUsers()
  if(users.some(u => u.email === email)){
    return fail(signupForm, 'This email already has an account. Please login.', emailInput)
  }

  setBusy(signupForm, true)
  try{
    const salt = randomSalt()
    users.push({ name, email, salt, hash: await hashPassword(password, salt), created: Date.now(), plan: 'free', avatar: '' })

    if(!store.set(USERS_KEY, users)){
      return fail(signupForm, 'Could not save the account (browser storage is blocked).')
    }
    startSession(email, true)
    enterSite()
  }finally{
    setBusy(signupForm, false)
  }
})

loginForm.addEventListener('submit', async (e) =>{
  e.preventDefault()
  clearInvalid(loginForm)
  setMsg(loginForm, '')

  const emailInput = field(loginForm, 'email'),
    passInput = field(loginForm, 'password'),
    email = emailInput.value.trim().toLowerCase(),
    password = passInput.value,
    remember = field(loginForm, 'remember').checked

  if(!email) return fail(loginForm, 'Enter your email.', emailInput)
  if(!password) return fail(loginForm, 'Enter your password.', passInput)

  setBusy(loginForm, true)
  try{
    const user = getUsers().find(u => u.email === email)

    if(!user || user.hash !== await hashPassword(password, user.salt)){
      return fail(loginForm, 'Wrong email or password.', passInput)
    }

    startSession(email, remember)
    enterSite()
  }finally{
    setBusy(loginForm, false)
  }
})

// Forgot password. Accounts live only on this device, so the reset also works only on this device.
resetForm.addEventListener('submit', async (e) =>{
  e.preventDefault()
  clearInvalid(resetForm)
  setMsg(resetForm, '')

  const emailInput = field(resetForm, 'email'),
    passInput = field(resetForm, 'password'),
    confirmInput = field(resetForm, 'confirm'),
    email = emailInput.value.trim().toLowerCase(),
    password = passInput.value

  if(!EMAIL_RE.test(email)) return fail(resetForm, 'Please enter a valid email.', emailInput)
  if(!getUsers().some(u => u.email === email)){
    return fail(resetForm, 'There is no account with this email on this device.', emailInput)
  }
  if(password.length < 6) return fail(resetForm, 'Password must be at least 6 characters.', passInput)
  if(confirmInput.value !== password) return fail(resetForm, 'The two passwords do not match.', confirmInput)

  setBusy(resetForm, true)
  try{
    const salt = randomSalt()

    if(!updateUser(email, { salt, hash: await hashPassword(password, salt) })){
      return fail(resetForm, 'Could not save the new password (browser storage is blocked).')
    }

    resetForm.reset()
    hidePasswords()
    showView('login')
    field(loginForm, 'email').value = email
    setMsg(loginForm, 'Password changed. You can login now.', true)
  }finally{
    setBusy(resetForm, false)
  }
})

/*---------- Settings window (Profile / Upgrade / Theme) ----------*/
const spMsg = document.getElementById('sp-msg')

const renderSettings = () =>{
  const user = getCurrentUser()
  if(!user) return

  paintAvatar(document.getElementById('sp-avatar'), user)
  document.getElementById('sp-name').textContent = user.name
  document.getElementById('sp-fullname').textContent = user.name
  document.getElementById('sp-email').textContent = user.email
  document.getElementById('sp-since').textContent = new Date(user.created).toLocaleDateString(undefined,
    { year: 'numeric', month: 'long', day: 'numeric' })

  const premium = user.plan === 'premium',
    planName = premium ? 'Premium' : 'Free'
  document.getElementById('sp-plan').textContent = planName
  document.getElementById('sp-badge').textContent = planName + ' plan'
  document.getElementById('sp-badge').classList.toggle('premium', premium)
  document.getElementById('plan-free-tag').hidden = premium

  const link = document.getElementById('upgrade-link')
  link.href = 'https://wa.me/255725484857?text=' +
    encodeURIComponent('Hello Junior, I want to upgrade to Premium. My account email: ' + user.email)
  link.hidden = premium

  document.getElementById('sp-remove').hidden = !user.avatar
}

const switchTab = (name) =>{
  settings.querySelectorAll('.settings__tab').forEach(t => t.classList.toggle('active', t.dataset.tab === name))
  settings.querySelectorAll('.settings__panel').forEach(p => { p.hidden = p.dataset.panel !== name })
  settings.querySelector('.settings__panels').scrollTop = 0
}

const openSettings = (tab) =>{
  if(!getCurrentUser()) return openAuth('login')
  setMenu(false)
  spMsg.textContent = ''
  renderSettings()
  switchTab(tab || 'profile')
  settings.classList.add('show-settings')
  settings.setAttribute('aria-hidden', 'false')
  lockScroll()
}

const closeSettings = () =>{
  settings.classList.remove('show-settings')
  settings.setAttribute('aria-hidden', 'true')
  lockScroll()
}

settings.querySelectorAll('[data-settings-close]').forEach(el => el.addEventListener('click', closeSettings))
settings.querySelectorAll('.settings__tab').forEach(t => t.addEventListener('click', () => switchTab(t.dataset.tab)))

document.querySelectorAll('[data-open-settings]').forEach(el =>
  el.addEventListener('click', () => openSettings('profile')))

accountBtn.addEventListener('click', () =>{
  if(getCurrentUser()) openSettings('profile')
  else{ setMenu(false); openAuth('login') }
})

document.addEventListener('keydown', (e) =>{
  if(e.key === 'Escape'){ closeAuth(); closeSettings() }
})

// Profile picture: any image is cropped to a centered square and shrunk
const fileToAvatar = (file) => new Promise((resolve, reject) =>{
  const img = new Image(),
    url = URL.createObjectURL(file)

  img.onload = () =>{
    const size = 256,
      canvas = document.createElement('canvas'),
      side = Math.min(img.naturalWidth, img.naturalHeight),
      sx = (img.naturalWidth - side) / 2,
      sy = (img.naturalHeight - side) / 2
    canvas.width = canvas.height = size
    canvas.getContext('2d').drawImage(img, sx, sy, side, side, 0, 0, size, size)
    URL.revokeObjectURL(url)
    resolve(canvas.toDataURL('image/jpeg', 0.85))
  }
  img.onerror = () =>{ URL.revokeObjectURL(url); reject(new Error('bad image')) }
  img.src = url
})

const afterAvatarChange = () =>{
  const user = getCurrentUser()
  renderSettings()
  refreshAccountUI()
  return user
}

document.getElementById('sp-file').addEventListener('change', async (e) =>{
  const file = e.target.files[0],
    user = getCurrentUser()
  e.target.value = ''
  if(!file || !user) return

  if(!file.type.startsWith('image/')){
    spMsg.textContent = 'Please choose an image file.'
    return
  }
  try{
    const avatar = await fileToAvatar(file)
    if(!updateUser(user.email, { avatar })){
      spMsg.textContent = 'Could not save the picture (browser storage is full or blocked).'
      return
    }
    spMsg.textContent = ''
    afterAvatarChange()
  }catch{
    spMsg.textContent = 'That image could not be read. Try another one.'
  }
})

document.getElementById('sp-remove').addEventListener('click', () =>{
  const user = getCurrentUser()
  if(!user) return
  updateUser(user.email, { avatar: '' })
  spMsg.textContent = ''
  afterAvatarChange()
})

document.getElementById('logout-btn').addEventListener('click', () =>{
  endSession()
  window.location.reload()
})

// Contact form and WhatsApp still check for an account
const requireLogin = (note) =>{
  if(!loginRequired || getCurrentUser()) return true
  openAuth('login', note)
  return false
}

const whatsappBtn = document.getElementById('whatsapp-order')
if(whatsappBtn){
  whatsappBtn.addEventListener('click', (e) =>{
    if(!requireLogin('Please login or create an account first.')) e.preventDefault()
  })
}

refreshAccountUI()

const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches

/*=============== HOME: rotating text + typed line ===============*/
const homeText = document.getElementById('home-text')

if(homeText){
  const letters = homeText.textContent.trim().split(''),
    angleStep = 360 / letters.length

  homeText.textContent = ''

  letters.forEach((char, i) =>{
    const span = document.createElement('span')
    span.textContent = char
    span.style.transform = `rotate(${i * angleStep}deg)`
    homeText.appendChild(span)
  })
}

if(window.Typed && document.getElementById('home-typed') && !reduceMotion){
  new Typed('#home-typed', {
    strings: ['Landing pages', 'Business websites', 'Responsive redesigns', 'Frontend fixes'],
    typeSpeed: 60,
    backSpeed: 30,
    backDelay: 2000,
    loop: true,
  })
}

/*=============== HEADER SHADOW ===============*/
const scrollHeader = () =>{
  const header = document.getElementById('header')
  if(!header) return
  window.scrollY >= 50 ? header.classList.add('scroll-header')
    : header.classList.remove('scroll-header')
}
window.addEventListener('scroll', scrollHeader)

/*=============== PROJECTS SLIDER ===============*/
if(window.Swiper && document.querySelector('.work__swiper')){
  new Swiper('.work__swiper', {
    loop: true,
    spaceBetween: 24,
    slidesPerView: 'auto',
    grabCursor: true,
    speed: 600,

    pagination: {
      el: '.swiper-pagination',
      clickable: true,
    },
    autoplay: reduceMotion ? false : {
      delay: 3000,
      disableOnInteraction: false,
    }
  })
}

/*=============== SERVICES ACCORDION ===============*/
const servicesCards = document.querySelectorAll('.services__card'),
  servicesButtons = document.querySelectorAll('.services__button')

servicesButtons.forEach(button => {
  button.addEventListener('click', () => {
    const currentCard = button.closest('.services__card'),
      isOpen = currentCard.classList.contains('services-open')

    servicesCards.forEach(card => {
      card.classList.replace('services-open','services-close')
    })

    if(!isOpen){
      currentCard.classList.replace('services-close','services-open')
    }
  })
})

/*=============== WHATSAPP LINKS ===============*/
// Every element with data-wa gets a WhatsApp link with a ready-made message.
//   data-wa="general" -> general website inquiry
//   data-wa="package" -> uses the package name and price written in its .price card
const waLink = (message) =>
  'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(message)

document.querySelectorAll('[data-wa]').forEach(link =>{
  let message = WHATSAPP_MESSAGES.general

  if(link.dataset.wa === 'package'){
    const card = link.closest('.price'),
      name = card && card.querySelector('.price__name'),
      price = card && card.querySelector('.price__amount')

    if(name && price){
      message = WHATSAPP_MESSAGES.package
        .replace('{package}', name.textContent.trim())
        .replace('{price}', price.textContent.trim())
    }
  }

  link.href = waLink(message)
  link.target = '_blank'
  link.rel = 'noopener noreferrer'
})

/*=============== EMAIL + LOCATION BUTTONS ===============*/
const isPhone = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)

document.querySelectorAll('[data-mail]').forEach(link =>{
  const subject = encodeURIComponent(EMAIL_SUBJECT),
    body = encodeURIComponent(EMAIL_BODY)

  if(isPhone){
    // On a phone this opens the Gmail app (or the default mail app) with a new message ready
    link.href = 'mailto:' + CONTACT_EMAIL + '?subject=' + subject + '&body=' + body
  }else{
    // On a computer this opens a new Gmail message in the browser
    link.href = 'https://mail.google.com/mail/?view=cm&fs=1&to=' + encodeURIComponent(CONTACT_EMAIL) +
      '&su=' + subject + '&body=' + body
    link.target = '_blank'
    link.rel = 'noopener noreferrer'
  }
})

document.querySelectorAll('[data-map]').forEach(link =>{
  link.href = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(LOCATION_QUERY)
})

/*=============== CONTACT FORM (EmailJS) ===============*/
const contactForm = document.getElementById('contact-form'),
  contactMessage = document.getElementById('contact-message')

const showContactMessage = (text) =>{
  if(!contactMessage) return
  contactMessage.textContent = text
  setTimeout(() => contactMessage.textContent = '', 12000)
}

const sendEmail = async (e) => {
  e.preventDefault()

  if(!requireLogin('Please login or create an account to send a message.')) return

  if(!window.emailjs){
    showContactMessage('The form is not available right now. Please contact me on WhatsApp.')
    return
  }

  try {
    await emailjs.sendForm(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, '#contact-form', EMAILJS_PUBLIC_KEY)
    showContactMessage('Message sent successfully ✅️')
    contactForm.reset()
    refreshAccountUI()
  }catch (error) {
    console.error('EmailJS error:', error)
    const details = EMAILJS_DEBUG && error ? ' (' + (error.status || '') + ' ' + (error.text || error.message || '') + ')' : ''
    showContactMessage('Message not sent. Please try again or contact me on WhatsApp. ❌️' + details)
  }
}

if(contactForm){
  contactForm.addEventListener('submit', sendEmail)

  // Start with an empty form after every refresh or return to the page
  window.addEventListener('pageshow', () => contactForm.reset())
  contactForm.reset()
}

/*=============== FOOTER YEAR ===============*/
const yearEl = document.getElementById('year')
if(yearEl) yearEl.textContent = new Date().getFullYear()

/*=============== SCROLL UP BUTTON ===============*/
const scrollUp = () =>{
  const scrollUpBtn = document.getElementById('scroll-up')
  if(!scrollUpBtn) return
  window.scrollY >= 350 ? scrollUpBtn.classList.add('show-scroll')
    : scrollUpBtn.classList.remove('show-scroll')
}
window.addEventListener('scroll', scrollUp)

/*=============== ACTIVE LINK ON SCROLL ===============*/
const sections = document.querySelectorAll('main section[id]')

const scrollActive = () => {
  const scrollY = window.scrollY

  sections.forEach(section => {
    const id = section.id,
      top = section.offsetTop - 80,
      height = section.offsetHeight,
      link = document.querySelector('.nav__menu a[href="#' + id + '"]')

    if(!link) return

    link.classList.toggle('active-link', scrollY > top && scrollY <= top + height)
  })
}
window.addEventListener('scroll', scrollActive)

/*============== CUSTOM CURSOR (mouse only)
==============*/
const cursor = document.querySelector('.cursor')

if(cursor && window.matchMedia('(pointer: fine)').matches){
  let mouseX = 0, mouseY = 0

  const cursorMove = () => {
    cursor.style.left = `${mouseX}px`
    cursor.style.top = `${mouseY}px`
    cursor.style.transform = 'translate(-50%, -50%)'
    requestAnimationFrame(cursorMove)
  }

  document.addEventListener('mousemove', (e) =>{
    mouseX = e.clientX
    mouseY = e.clientY
  })
  cursorMove()

  document.querySelectorAll('a').forEach(item => {
    item.addEventListener('mouseover', () => cursor.classList.add('hide-cursor'))
    item.addEventListener('mouseleave', () => cursor.classList.remove('hide-cursor'))
  })
}

/*=============== SCROLL REVEAL ANIMATIONS ===============*/
if(window.ScrollReveal && !reduceMotion){
  const sr = ScrollReveal({
    origin: 'bottom',
    distance: '60px',
    duration: 1200,
    delay: 300,
    easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  })

  sr.reveal('.home__subtitle')
  sr.reveal('.home__title', {delay: 600})
  sr.reveal('.home__description', {delay: 900})
  sr.reveal('.home__typed-line', {delay: 1000})
  sr.reveal('.home__cta', {delay: 1100})
  sr.reveal('.home__box-1', {delay: 1200, rotate:{z: -20}})
  sr.reveal('.home__box-2', {delay: 1300, rotate:{z: -30}})
  sr.reveal('.home__box-3', {delay: 1400, rotate:{z: -40}})
  sr.reveal('.home__img', {delay: 1700, distance: '-60px'})
  sr.reveal('.home__circle', {delay: 2000, distance: '-100px'})

  sr.reveal('.about__title')
  sr.reveal('.about__description', {delay: 400})
  sr.reveal('.about__points', {delay: 600})
  sr.reveal('.about__button', {delay: 800})

  sr.reveal('.services__card:nth-child(odd)', {interval: 200, origin: 'left', distance: '100px'})
  sr.reveal('.services__card:nth-child(even)', {interval: 200, origin: 'right', distance: '100px'})

  sr.reveal('.price', {interval: 200})
  sr.reveal('.pricing__notes')

  sr.reveal('.work__swiper')

  sr.reveal('.process__step', {interval: 200})
  sr.reveal('.process__note')

  sr.reveal('.skills__description')
  sr.reveal('.skills__card', {delay: 400, interval: 200})

  sr.reveal('.contact__form')
  sr.reveal('.contact__link', {delay: 600, interval: 200})

  sr.reveal('.footer__container')
}