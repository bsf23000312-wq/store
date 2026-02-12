// Store demo: products, cart, and simple auth via localStorage
const usersKey = 'store_users_v1';
const currentUserKey = 'store_current_user';
const cartKey = 'store_cart_v1';

// Sample products
const products = [
  {id:1,title:'Aurora Headphones',price:59.99,desc:'Comfortable Bluetooth headphones'},
  {id:2,title:'Nimbus Backpack',price:79.00,desc:'Water-resistant commuter backpack'},
  {id:3,title:'Lumen Desk Lamp',price:29.5,desc:'Adjustable LED lamp with touch control'},
  {id:4,title:'Stride Sneakers',price:99.99,desc:'Lightweight running shoes'},
  {id:5,title:'Orbit Smartwatch',price:149.9,desc:'Fitness tracking and notifications'},
];

// Helpers for DOM
const productsGrid = document.getElementById('productsGrid');
const cartBtn = document.getElementById('cartBtn');
const cartCount = document.getElementById('cartCount');
const cartPanel = document.getElementById('cartPanel');
const cartList = document.getElementById('cartList');
const cartTotal = document.getElementById('cartTotal');
const closeCart = document.getElementById('closeCart');
const checkoutBtn = document.getElementById('checkoutBtn');
const userLink = document.getElementById('userLink');

function renderProducts(){
  if(!productsGrid) return;
  productsGrid.innerHTML = '';
  products.forEach(p => {
    const el = document.createElement('div');
    el.className = 'product card';
    el.innerHTML = `
      <div class="thumb">${p.title.split(' ').slice(0,2).map(w=>w[0]).join('')}</div>
      <div class="prod-title">${p.title}</div>
      <div class="muted">${p.desc}</div>
      <div class="prod-meta" style="margin-top:8px">
        <div class="price">$${p.price.toFixed(2)}</div>
        <div><button class="btn" onclick="addToCart(${p.id})">Add</button></div>
      </div>
    `;
    productsGrid.appendChild(el);
  });
}

function loadCart(){
  try{ return JSON.parse(localStorage.getItem(cartKey))||[] }catch(e){return []}
}
function saveCart(c){ localStorage.setItem(cartKey, JSON.stringify(c)); updateCartBadge(); }

function addToCart(id){
  const p = products.find(x=>x.id===id); if(!p) return;
  const cart = loadCart();
  const item = cart.find(x=>x.id===id);
  if(item) item.qty++;
  else cart.push({id:p.id,title:p.title,price:p.price,qty:1});
  saveCart(cart);
  alert(p.title + ' added to cart');
}

function updateCartBadge(){
  const c = loadCart();
  const count = c.reduce((s,i)=>s+i.qty,0);
  if(cartCount) cartCount.textContent = count;
}

function renderCart(){
  const c = loadCart();
  cartList.innerHTML = '';
  if(c.length===0) cartList.innerHTML = '<div class="muted">Cart is empty</div>';
  c.forEach(i=>{
    const el = document.createElement('div'); el.className = 'card';
    el.style.marginBottom='8px';
    el.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center">
        <div><strong>${i.title}</strong><div class="muted">$${i.price.toFixed(2)} • qty: ${i.qty}</div></div>
        <div style="display:flex;flex-direction:column;gap:6px">
          <button class="btn ghost" onclick="changeQty(${i.id},-1)">-</button>
          <button class="btn ghost" onclick="changeQty(${i.id},1)">+</button>
          <button class="btn ghost" onclick="removeItem(${i.id})">Remove</button>
        </div>
      </div>
    `;
    cartList.appendChild(el);
  });
  const total = c.reduce((s,i)=> s + i.price * i.qty, 0);
  cartTotal.textContent = total.toFixed(2);
}

function changeQty(id,delta){
  const c = loadCart();
  const it = c.find(x=>x.id===id); if(!it) return;
  it.qty += delta; if(it.qty<1) it.qty=1;
  saveCart(c); renderCart();
}
function removeItem(id){
  let c = loadCart(); c = c.filter(x=>x.id!==id); saveCart(c); renderCart();
}

cartBtn && cartBtn.addEventListener('click', ()=>{ cartPanel.setAttribute('aria-hidden','false'); renderCart(); updateCartBadge(); });
closeCart && closeCart.addEventListener('click', ()=> cartPanel.setAttribute('aria-hidden','true'));
checkoutBtn && checkoutBtn.addEventListener('click', ()=>{
  const user = getCurrentUser();
  if(!user){ if(confirm('You must sign in to checkout. Go to login?')) location.href='login.html'; return; }
  localStorage.removeItem(cartKey); renderCart(); updateCartBadge(); alert('Thank you for your purchase, '+ user.name + '! (Demo)'); cartPanel.setAttribute('aria-hidden','true');
});

// Auth: register and login handlers (shared file used by auth pages)
function getUsers(){ try{ return JSON.parse(localStorage.getItem(usersKey)) || []; }catch(e){return []} }
function saveUsers(u){ localStorage.setItem(usersKey, JSON.stringify(u)); }
function registerUser(name,email,password){ const users = getUsers(); if(users.find(x=>x.email===email)) return {ok:false,msg:'Email already registered.'}; users.push({id:Date.now(),name,email,password}); saveUsers(users); return {ok:true}; }
function loginUser(email,password){ const users = getUsers(); const u = users.find(x=>x.email===email && x.password===password); if(!u) return {ok:false,msg:'Invalid credentials.'}; localStorage.setItem(currentUserKey, JSON.stringify({id:u.id,name:u.name,email:u.email})); return {ok:true}; }
function getCurrentUser(){ try{ return JSON.parse(localStorage.getItem(currentUserKey)); }catch(e){return null} }
function signOut(){ localStorage.removeItem(currentUserKey); updateUserLink(); }
function updateUserLink(){ const u = getCurrentUser(); if(userLink){ if(u) userLink.textContent = u.name; else userLink.textContent = 'Login'; userLink.href = u? '#' : 'login.html'; } }

// Page-specific init
window.addEventListener('DOMContentLoaded', ()=>{
  renderProducts(); updateCartBadge(); updateUserLink();

  // login page
  const loginForm = document.getElementById('loginForm');
  if(loginForm){
    document.getElementById('loginMsg').textContent='';
    loginForm.addEventListener('submit', e=>{
      e.preventDefault();
      const email = document.getElementById('loginEmail').value.trim();
      const pass = document.getElementById('loginPassword').value;
      const res = loginUser(email,pass);
      const msg = document.getElementById('loginMsg');
      if(!res.ok) { msg.textContent = res.msg; return; }
      // redirect to home
      location.href = 'index.html';
    });
  }

  // register page
  const regForm = document.getElementById('registerForm');
  if(regForm){ document.getElementById('regMsg').textContent=''; regForm.addEventListener('submit', e=>{
    e.preventDefault();
    const name = document.getElementById('regName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const pass = document.getElementById('regPassword').value;
    const res = registerUser(name,email,pass);
    const msg = document.getElementById('regMsg');
    if(!res.ok){ msg.textContent = res.msg; return; }
    // auto-login
    loginUser(email,pass);
    location.href = 'index.html';
  }); }

  // if on index, wire sign-out link
  if(userLink){ userLink.addEventListener('click', (e)=>{ const u = getCurrentUser(); if(u){ if(!confirm('Sign out?')){ e.preventDefault(); return; } signOut(); updateUserLink(); } }); }
});

// expose helpers for inline onclicks
window.addToCart = addToCart; window.changeQty = changeQty; window.removeItem = removeItem; window.viewCart = ()=>{ cartPanel.setAttribute('aria-hidden','false'); renderCart(); }