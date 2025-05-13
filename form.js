
const API_KEY = "patpwEeJi6lj1kVSA.96038881b98860c419b2dd70e45e3e70d5e7336b9124a86b7d0caf5a270173fc";                // ← tu PAT
const BASE_ID = "appi5iq2xznnBxNvJ";

const TBL_PROM = "tblriBT8T8hRMHmEZ";                 // Promotores
const TBL_REG  = "tblefXMYV3zUmEwXk";                 // Registros

/* Campos en Promotores */
const PROM_DEP_SELECT = "fldWIhpiouC0iPslt";          // single‑select
const PROM_NOMBRE     = "fldXhZQ5homWIvAib";          // texto promotor

/* Campos en Registros */
const REG_DEP_LNK  = "fldUjZjWXuJ6ujKXB";             // link Dependencia
const REG_PROM_LNK = "fldBYSsQW7AuCZIxw";             // link Promotor

/* Resto de campos (sin cambios) */
const F = {
  nombres  :"fldZD3e40hfZWkBrC",
  apellido1:"fldvTQJ9AJXZAq6Go",
  apellido2:"fldmZn2MhygKGbp5E",
  calle    :"fldTXQpUayq03SqGP",
  numext   :"fldzcyV7OD3UHbdyx",
  numint   :"fldllGor8QzaTactq",
  colonia  :"fldnVmj53rvm5RsdQ",
  cp       :"fldU13HKpwypVx3qt",
  seccion  :"fldhRiT7s8cnZJKhN",
  telefono :"fldPByjAjeIbIQB0t"
};

/******************************************************************
 * Dependencias (id + nombre)
 *****************************************************************/
const DEPENDENCIAS = [
  { id:"recIulfWPlB8DajsG", nombre:"JEFATURA DE LA OFICINA DE LA GUBERNATURA" },
  { id:"recgYa0wEccO3g5o7", nombre:"SECRETARÍA DE CULTURA" },
  { id:"reckTHDp9tuX49FCx", nombre:"SECRETARÍA DE LA CONTRALORÍA" },
  { id:"recjxD2RyioSIB7Lf", nombre:"SECRETARÍA DE EDUCACIÓN" },
  { id:"rec6Z7vku5Yn0IC6G", nombre:"SECRETARÍA DE HACIENDA" },
  { id:"recQkcwxHQkyrnOBK", nombre:"SECRETARÍA DE LAS MUJERES" },
  { id:"recBmuK23Qdx185aT", nombre:"SECRETARÍA DE SEGURIDAD PÚBLICA Y SEGURIDAD CIUDADANA" },
  { id:"recYc5ryaiABefhA2", nombre:"SECRETARÍA DE DESARROLLO AGROPECUARIO" },
  { id:"recZ6kGSk7xAe16pG", nombre:"SECRETARÍA DE ADMINISTRACIÓN" },
  { id:"rec832QcmrwO8zJW3", nombre:"SECRETARÍA DE INFRAESTRUCTURA" },
  { id:"recUpPfDJGmRYDrHs", nombre:"SECRETARÍA DE SALUD" },
  { id:"rec2MDnoMgTkdaUmU", nombre:"SECRETARÍA DE DESARROLLO SUSTENTABLE" },
  { id:"rec0eA8HMeTjub8KG", nombre:"SECRETARÍA DE DESARROLLO ECONÓMICO" },
  { id:"recru18xEwJXaD0kb", nombre:"SECRETARÍA DE GOBIERNO" },
  { id:"rechTpzFtWgpUKXxt", nombre:"SECRETARÍA DE BIENESTAR" },
  { id:"recl7TAVIA1x8aeqR", nombre:"CONSEJERÍA JURÍDICA" },
  { id:"recLdAybMrn4YmwgB", nombre:"SECRETARÍA DE TURISMO" }
];

/******************************************************************
 * Helpers & UI refs
 *****************************************************************/
const headers = { Authorization:`Bearer ${API_KEY}` };
const apiURL  = (tbl, qs="") => `https://api.airtable.com/v0/${BASE_ID}/${tbl}${qs?"?"+qs:""}`;

const depEl  = document.getElementById("dependencia");
const promEl = document.getElementById("promotor");
const form   = document.getElementById("formulario");
const msg    = document.getElementById("mensaje");

/******************************************************************
 * A) Poblar dependencias
 *****************************************************************/
DEPENDENCIAS.forEach(d=>{
  const o=document.createElement("option");
  o.value=d.id; o.textContent=d.nombre; depEl.appendChild(o);
});

/******************************************************************
 * B) Filtrar promotores por dependencia (single‑select)
 *****************************************************************/
depEl.addEventListener("change", async ()=>{
  promEl.innerHTML=`<option value="">Selecciona un promotor</option>`;
  if(!depEl.value) return;

  const depNombre = DEPENDENCIAS.find(d=>d.id===depEl.value).nombre;
  const filter    = encodeURIComponent(`{${PROM_DEP_SELECT}}='${depNombre}'`);
  const r         = await fetch(apiURL(TBL_PROM,`filterByFormula=${filter}`),{headers}).then(x=>x.json());

  r.records.forEach(rec=>{
    const o=document.createElement("option");
    o.value=rec.id; o.textContent=rec.fields[PROM_NOMBRE]; promEl.appendChild(o);
  });
});

/******************************************************************
 * C) Submit con validaciones (sin “nuevo promotor”)
 *****************************************************************/
form.addEventListener("submit", async e=>{
  e.preventDefault(); msg.textContent="";
  const f=new FormData(form);
  const tel = f.get("telefono").trim();
  const nom = f.get("nombres").trim();
  const a1  = f.get("apellido1").trim();
  const a2  = f.get("apellido2").trim();
  const depId  = depEl.value;
  const promId = promEl.value;

  if(!depId || !promId){
    msg.textContent="❌ Selecciona dependencia y promotor."; msg.style.color="red"; return;
  }

  /* Duplicados */
  const dupTel = await fetch(apiURL(TBL_REG,`filterByFormula=${encodeURIComponent(`{${F.telefono}}='${tel}'`)}`),{headers}).then(r=>r.json());
  if(dupTel.records?.length){msg.textContent="❌ Número ya registrado."; msg.style.color="red"; return;}

  const dupPer = await fetch(apiURL(TBL_REG,`filterByFormula=${encodeURIComponent(`AND({${F.nombres}}='${nom}',{${F.apellido1}}='${a1}',{${F.apellido2}}='${a2}')`)}`),{headers}).then(r=>r.json());
  if(dupPer.records?.length){msg.textContent="❌ Persona ya registrada."; msg.style.color="red"; return;}

  /* Guardar registro */
  const payload={
    fields:{
      [REG_DEP_LNK]: [depId],
      [REG_PROM_LNK]:[promId],
      [F.nombres]: nom,
      [F.apellido1]:a1,
      [F.apellido2]:a2,
      [F.calle]:    f.get("calle").trim(),
      [F.numext]:   parseInt(f.get("numext"),10),
      [F.numint]:   f.get("numint").trim(),
      [F.colonia]:  f.get("colonia").trim(),
      [F.cp]:       parseInt(f.get("cp"),10),
      [F.seccion]:  parseInt(f.get("seccion"),10),
      [F.telefono]: tel
    },typecast:true
  };

  const res=await fetch(apiURL(TBL_REG),{
    method:"POST", headers:{...headers,"Content-Type":"application/json"},
    body:JSON.stringify(payload)
  });
  if(res.ok){
    msg.textContent="✅ Registro exitoso."; msg.style.color="green";
    form.reset(); promEl.innerHTML=`<option value="">Selecciona un promotor</option>`;
  }else{
    console.error(await res.json());
    msg.textContent="❌ Error al enviar."; msg.style.color="red";
  }
});
