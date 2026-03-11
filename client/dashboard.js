const apiKey='AfriDigital-FMDash-API-Key';
const socket=io();
async function updateWallet(){
  const res=await fetch('/admin/wallet',{headers:{'x-api-key':apiKey}});
  const data=await res.json();
  document.getElementById('native-balance').innerText=data.nativeBalance;
  document.getElementById('coin-balance').innerText=data.coinBalance;
}
document.getElementById('convert-to-coin').addEventListener('click',async()=>{
  const amount=parseInt(prompt('Enter native amount to convert:'));
  await fetch('/admin/wallet/convert',{
    method:'POST',
    headers:{'Content-Type':'application/json','x-api-key':apiKey},
    body:JSON.stringify({direction:'toCoin',amount})
  });
  updateWallet();
});
document.getElementById('convert-to-native').addEventListener('click',async()=>{
  const amount=parseInt(prompt('Enter coin amount to convert:'));
  await fetch('/admin/wallet/convert',{
    method:'POST',
    headers:{'Content-Type':'application/json','x-api-key':apiKey},
    body:JSON.stringify({direction:'toNative',amount})
  });
  updateWallet();
});
updateWallet();
socket.on('new-scan', scan=>{
  const scanList=document.getElementById('scan-list');
  if(scanList){
    const row=document.createElement('tr');
    row.innerHTML=`<td>${scan.target}</td><td>${scan.vulnerability}</td><td>${scan.severity}</td><td>${scan.timestamp}</td>`;
    scanList.appendChild(row);
  }
});
