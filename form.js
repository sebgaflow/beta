/******************************************************************
 * Configuración de Airtable
 *****************************************************************/
const API_KEY      = "patpwEeJi6lj1kVSA.96038881b98860c419b2dd70e45e3e70d5e7336b9124a86b7d0caf5a270173fc"; // ← pon aquí tu PAT
const BASE_ID      = "appi5iq2xznnBxNvJ";

/* Tablas */
const TBL_DEP      = "tblhnh0UVIIbHMZFr"; // Dependencias
const TBL_PROM     = "tblriBT8T8hRMHmEZ"; // Promotores
const TBL_REG      = "tblefXMYV3zUmEwXk"; // Registros (formulario final)

/* Campos (IDs) */
const DEP_NOMBRE   = "fldP7TkiFTkfsyo9p"; // texto en Dependencias
const PROM_DEP_LNK = "fldwRyuKRjKksPyHf"; // link a Dependencias en Promotores
const PROM_NOMBRE  = "fldXhZQ5homWIvAib"; // texto promotor
const REG_DEP_LNK  = "fldUjZjWXuJ6ujKXB"; // link a Dependencias en Registros
const REG_PROM_LNK = "fldBYSsQW7AuCZIxw"; // link a Promotores en Registros

/* Resto de campos (siguen igual) */
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
 * Helpers
 *****************************************************************/
const headers = { Authorization: `Bearer ${API_KEY}` };
const apiURL   = (tbl, qs="") =>
  `https://api.airtable.com/v0/${BASE_ID}/${tbl}${qs ? "?" + qs : ""}`;

/******************************************************************
 * UI refs
 *****************************************************************/
const depEl        = document.getElementById("dependencia");
const promEl       = document.getElementById("promotor");
const promNuevoInp = document.getElementById("promotor_nuevo");
const form         = document.getElementById("formulario");
const msgBox       = document.getElementById("mensaje");

/******************************************************************
 *  A) Cargar dependencias al iniciar
 *****************************************************************/
fetch(apiURL(TBL_DEP), { headers })
  .then(r => r.json())
  .then(({ records }) => {
    records.forEach(rec => {
      const opt = document.createElement("option");
      opt.value       = rec.id;                 // recordId
      opt.textContent = rec.fields[DEP_NOMBRE]; // nombre visible
      depEl.appendChild(opt);
    });
  });

/******************************************************************
 *  B) Al cambiar dependencia, poblar promotores
 *****************************************************************/
depEl.addEventListener("change", async () => {
  promEl.innerHTML = `<option value="">Selecciona un promotor</option>`;
  promNuevoInp.style.display = "none";
  promNuevoInp.value = "";

  if (!depEl.value) return;

  const filter = encodeURIComponent(`{${PROM_DEP_LNK}}='${depEl.value}'`);
  const res    = await fetch(apiURL(TBL_PROM, `filterByFormula=${filter}`), { headers });
  const { records } = await res.json();

  records.forEach(rec => {
    const opt = document.createElement("option");
    opt.value       = rec.id;
    opt.textContent = rec.fields[PROM_NOMBRE];
    promEl.appendChild(opt);
  });

  // Opción para añadir nuevo
  const optNuevo = document.createElement("option");
  optNuevo.value = "__nuevo__";
  optNuevo.textContent = "Agregar nuevo promotor…";
  promEl.appendChild(optNuevo);
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

  /* 1. Leer valores */
  const f        = new FormData(form);
  const tel      = f.get("telefono").trim();
  const nombre   = f.get("nombres").trim();
  const ape1     = f.get("apellido1").trim();
  const ape2     = f.get("apellido2").trim();
  const depId    = depEl.value;
  let   promId   = promEl.value;          // puede ser "__nuevo__"

  /* 2. Validar duplicados en Registros */
  const telFilter = encodeURIComponent(`{${F.telefono}}='${tel}'`);
  const perFilter = encodeURIComponent(`AND({${F.nombres}}='${nombre}',{${F.apellido1}}='${ape1}',{${F.apellido2}}='${ape2}')`);
  const dupTel = await fetch(apiURL(TBL_REG, `filterByFormula=${telFilter}`), { headers }).then(r=>r.json());
  if (dupTel.records?.length) {
    msgBox.textContent = "❌ Error: este número ya fue registrado.";
    msgBox.style.color = "red"; return;
  }
  const dupPer = await fetch(apiURL(TBL_REG, `filterByFormula=${perFilter}`), { headers }).then(r=>r.json());
  if (dupPer.records?.length) {
    msgBox.textContent = "❌ Error: esta persona ya fue registrada.";
    msgBox.style.color = "red"; return;
  }

  /* 3. Si es nuevo promotor, crearlo primero */
  if (promId === "__nuevo__") {
    const nuevoNombre = promNuevoInp.value.trim();
    if (!nuevoNombre) {
      msgBox.textContent = "❌ Escribe el nombre del nuevo promotor.";
      msgBox.style.color = "red"; return;
    }
    const res = await fetch(apiURL(TBL_PROM), {
      method : "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body   : JSON.stringify({
        fields: {
          [PROM_NOMBRE] : nuevoNombre,
          [PROM_DEP_LNK]: [depId]          // linked‑record array
        }
      })
    }).then(r=>r.json());
    promId = res.id;
  }

  /* 4. Guardar registro final en la tabla Registros */
  const payload = {
    fields: {
      [REG_DEP_LNK] : [depId],           // dependencia (linked‑record)
      [REG_PROM_LNK]: [promId],          // promotor   (linked‑record)
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
