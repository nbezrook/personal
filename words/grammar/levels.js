(() => {
 'use strict';
 function reveal(hash){
  let id;try{id=decodeURIComponent(hash.slice(1));}catch{return;}
  const target=document.getElementById(id);if(!target)return;
  let node=target;
  while(node){if(node.tagName==='DETAILS')node.open=true;node=node.parentElement;}
 }
 document.addEventListener('click',event=>{
  const link=event.target.closest('a[href^="#"]');
  if(link)reveal(link.getAttribute('href'));
 });
 window.addEventListener('hashchange',()=>reveal(location.hash));
 reveal(location.hash);
 let printState=null;
 window.addEventListener('beforeprint',()=>{
  if(printState)return;
  printState=[...document.querySelectorAll('.grammar-level')].map(el=>[el,el.open]);
  for(const [el] of printState)el.open=true;
 });
 window.addEventListener('afterprint',()=>{
  if(!printState)return;
  for(const [el,open] of printState)el.open=open;
  printState=null;
 });
})();
