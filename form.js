
const API_KEY      = "patpwEeJi6lj1kVSA.96038881b98860c419b2dd70e45e3e70d5e7336b9124a86b7d0caf5a270173fc";     // ← pon aquí tu PAT
const BASE_ID      = "appi5iq2xznnBxNvJ";

/* Tablas */
const TBL_PROM     = "tblriBT8T8hRMHmEZ";   // Promotores
const TBL_REG      = "tblefXMYV3zUmEwXk";   // Registros (formulario final)

/* Campos en Promotores */
const PROM_DEP_LNK = "fldwRyuKRjKksPyHf";   // link a Dependencias
const PROM_NOMBRE  = "fldXhZQ5homWIvAib";   // texto promotor

/* Campos en Registros */
const REG_DEP_LNK  = "fldUjZjWXuJ6ujKXB";   // link a Dependencias
const REG_PROM_LNK = "fldBYSsQW7AuCZIxw";   // link a Promotores

/* Otros campos (sin cambios) */
const F = {
  nombres   : "fldZD3e40hfZWkBrC",
  apellido1 : "fldvTQJ9AJXZAq6Go",
  apellido2 : "fldmZn2MhygKGbp5E",
  calle     : "fldTXQpUayq03SqGP",
  numext    : "fldzcyV7OD3UHbdyx",
  numint    : "fldllGor8QzaTactq",
  colonia   : "fldnVmj53rvm5RsdQ",
  cp        : "fldU13HKpwypVx3qt",
  seccion   : "fldhRiT7s8cnZJKhN",
  telefono  : "fldPByjAjeIbIQB0t"
};

/******************************************************************
 * Dependencias (array estático con recordId + nombre)
 *****************************************************************/
const DEPENDENCIAS = [
  { id: "recIulfWPlB8DajsG", nombre: "JEFATURA DE LA OFICINA DE LA GUBERNATURA" },
  { id: "recgYa0wEccO3g5o7", nombre: "SECRETARÍA DE CULTURA" },
  { id: "reckTHDp9tuX49FCx", nombre: "SECRETARÍA DE LA CONTRALORÍA" },
  { id: "recjxD2RyioSIB7Lf", nombre: "SECRETARÍA DE EDUCACIÓN" },
  { id: "rec6Z7vku5Yn0IC6G", nombre: "SECRETARÍA DE HACIENDA" },
  { id: "recQkcwxHQkyrnOBK", nombre: "SECRETARÍA DE LAS MUJERES" },
  { id: "recBmuK23Qdx185aT", nombre: "SECRETARÍA DE SEGURIDAD PÚBLICA Y SEGURIDAD CIUDADANA" },
  { id: "recYc5ryaiABefhA2", nombre: "SECRETARÍA DE DESARROLLO AGROPECUARIO" },
  { id: "recZ6kGSk7xAe16pG", nombre: "SECRETARÍA DE ADMINISTRACIÓN" },
  { id: "rec832QcmrwO8zJW3", nombre: "SECRETARÍA DE INFRAESTRUCTURA" },
  { id: "recUpPfDJGmRYDrHs", nombre: "SECRETARÍA DE SALUD" },
  { id: "rec2MDnoMgTkdaUmU", nombre: "SECRETARÍA DE DESARROLLO SUSTENTABLE" },
  { id: "rec0eA8HMeTjub8KG", nombre: "SECRETARÍA DE DESARROLLO ECONÓMICO" },
  { id: "recru18xEwJXaD0kb", nombre: "SECRETARÍA DE GOBIERNO" },
  { id: "rechTpzFtWgpUKXxt", nombre: "SECRETARÍA DE BIENESTAR" },
  { id: "recl7TAVIA1x8aeqR", nombre: "CONSEJERÍA JURÍDICA" },
  { id: "recLdAybMrn4YmwgB", nombre: "SECRETARÍA DE TURISMO" }
];

/******************************************************************
 * Helpers
 *****************************************************************/
const headers = { Authorization: `Bearer ${API_KEY}` };
const apiURL  = (tbl, qs="") => `https://api.airtable.com/v0/${BASE_ID}/${tbl}${qs ? "?" + qs : ""}`;

/******************************************************************
 * UI refs
 *****************************************************************/
const depEl        = document.getElementById("dependencia");
const promEl       = document.getElementById("promotor");
const promNuevoInp = document.getElementById("promotor_nuevo");
const form         = document.getElementById("formulario");
const msgBox       = document.getElementById("mensaje");

/******************************************************************
 *  A) Poblar dependencias desde el array estático
 *****************************************************************/
DEPENDENCIAS.forEach(dep => {
  const o = document.createElement("option");
  o.value       = dep.id;      // recordId
  o.textContent = dep.nombre;
  depEl.appendChild(o);
});

/******************************************************************
 *  B) Al cambiar dependencia, poblar promotores
 *****************************************************************/
depEl.addEventListener("change", async () => {
  promEl.innerHTML = `<option value="">Selecciona un promotor</option>`;
  promNuevoInp.style.display = "none";
  promNuevoInp.value = "";

  if (!depEl.value) return;                 // sin selección

  const filter = encodeURIComponent(`{${PROM_DEP_LNK}}='${depEl.value}'`);
  const res    = await fetch(apiURL(TBL_PROM, `filterByFormula=${filter}`), { headers });
  const { records } = await res.json();

  records.forEach(rec => {
    const opt = document.createElement("option");
    opt.value       = rec.id;
    opt.textContent = rec.fields[PROM_NOMBRE];
    promEl.appendChild(opt);
  });

  const optNew = document.createElement("option");
  optNew.value = "__nuevo__";
  optNew.textContent = "Agregar nuevo promotor…";
  promEl.appendChild(optNew);
});

/******************************************************************
 *  C) Mostrar input si eligen “Agregar nuevo…”
 *****************************************************************/
promEl.addEventListener("change", () => {
  if (promEl.value === "__nuevo__") {
    promNuevoInp.style.display = "block";
    promNuevoInp.required = true;
  } else {
    promNuevoInp.style.display = "none";
    promNuevoInp.required = false;
  }
});

/******************************************************************
 *  D) Submit con validaciones y guardado
 *****************************************************************/
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  msgBox.textContent = "";
  const f      = new FormData(form);
  const tel    = f.get("telefono").trim();
  const nombre = f.get("nombres").trim();
  const ape1   = f.get("apellido1").trim();
  const ape2   = f.get("apellido2").trim();
  const depId  = depEl.value;
  let   promId = promEl.value;

  /* 1. Duplicados */
  const telRes = await fetch(apiURL(TBL_REG, `filterByFormula=${encodeURIComponent(`{${F.telefono}}='${tel}'`)}`), { headers }).then(r=>r.json());
  if (telRes.records?.length) { msgBox.textContent = "❌ Número ya registrado."; msgBox.style.color="red"; return; }
  const perRes = await fetch(apiURL(TBL_REG, `filterByFormula=${encodeURIComponent(`AND({${F.nombres}}='${nombre}',{${F.apellido1}}='${ape1}',{${F.apellido2}}='${ape2}')`)}`), { headers }).then(r=>r.json());
  if (perRes.records?.length) { msgBox.textContent = "❌ Persona ya registrada."; msgBox.style.color="red"; return; }

  /* 2. Nuevo promotor */
  if (promId === "__nuevo__") {
    const nuevoNombre = promNuevoInp.value.trim();
    if (!nuevoNombre) { msgBox.textContent = "❌ Escribe nombre del promotor."; msgBox.style.color="red"; return; }
    const res = await fetch(apiURL(TBL_PROM), {
      method : "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body   : JSON.stringify({
        fields: {
          [PROM_NOMBRE] : nuevoNombre,
          [PROM_DEP_LNK]: [depId]
        }
      })
    }).then(r=>r.json());
    promId = res.id;
  }

  /* 3. Guardar registro */
  const payload = {
    fields: {
      [REG_DEP_LNK] : [depId],
      [REG_PROM_LNK]: [promId],
      [F.nombres]   : nombre,
      [F.apellido1] : ape1,
      [F.apellido2] : ape2,
      [F.calle]     : f.get("calle").trim(),
      [F.numext]    : parseInt(f.get("numext"),10),
      [F.numint]    : f.get("numint").trim(),
      [F.colonia]   : f.get("colonia").trim(),
      [F.cp]        : parseInt(f.get("cp"),10),
      [F.seccion]   : parseInt(f.get("seccion"),10),
      [F.telefono]  : tel
    },
    typecast: true
  };

  const save = await fetch(apiURL(TBL_REG), {
    method : "POST",
    headers: { ...headers, "Content-Type": "application/json" },
    body   : JSON.stringify(payload)
  });
  if (save.ok) {
    msgBox.textContent = "✅ Registro exitoso.";
    msgBox.style.color = "green";
    form.reset();
    promEl.innerHTML = `<option value="">Selecciona un promotor</option>`;
  } else {
    const err = await save.json();
    console.error(err);
    msgBox.textContent = "❌ Error al enviar el formulario.";
    msgBox.style.color = "red";
  }
});
