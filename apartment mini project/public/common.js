const $ = s => document.querySelector(s);
async function api(url, options={}) {
  const response = await fetch(url, {headers:{"Content-Type":"application/json"}, ...options});
  const text = await response.text();
  let data; try { data = text ? JSON.parse(text) : {}; } catch { data = {message:text}; }
  if (!response.ok) throw new Error(data.error || data.message || "Request failed");
  return data;
}
function showStatus(message,type="success") {
  const box=$("#status"); if(!box) return;
  box.textContent=message; box.className="status "+type;
}
function dateTime(value) {
  if(!value) return "—";
  const d=new Date(value); return Number.isNaN(d.getTime()) ? value : d.toLocaleString();
}
function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
}
async function loadResidents(selectId="resident_id") {
  const residents=await api("/api/residents");
  const select=document.getElementById(selectId);
  if(select) {
    select.innerHTML='<option value="">-- Choose resident / flat --</option>';
    residents.forEach(r=>{
      const o=document.createElement("option");o.value=r.resident_id;
      o.textContent=`${r.flat_no} — ${r.name}`;select.appendChild(o);
    });
  }
  return residents;
}
