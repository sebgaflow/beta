// form.js
const token         = "patpwEeJi6lj1kVSA.96038881b98860c419b2dd70e45e3e70d5e7336b9124a86b7d0caf5a270173fc";
const baseId        = "appi5iq2xznnBxNvJ";

// IDs de tablas
const depsTable     = "tblhnh0UVIIbHMZFr";  // Dependencia
const promosTable   = "tblriBT8T8hRMHmEZ";  // Promotores
const regTable      = "tblefXMYV3zUmEwXk";  // Registros

// IDs de campos
const depsNameFld   = "fldP7TkiFTkfsyo9p";  // texto en Dependencia
const promosLinkFld = "fldwRyuKRjKksPyHf";  // link a Dependencia en Promotores
const promosNameFld = "fldXhZQ5homWIvAib";  // nombre_promotor (texto)
const regDepFld     = "fldUjZjWXuJ6ujKXB";  // DEPENDENCIA_LINKED (linked-record)
 // lookup fldMNgYuzOKHztVhK se rellena sola: no la usamos en el POST

document.addEventListener("DOMContentLoaded", () => {
  const depEl   = document.getElementById("dependencia");
  const promoEl = document.getElementById("promotor");
  const form    = document.getElementById("formulario");
  const msg     = document.getElementById("mensaje");

  // 1) Cargar todas las dependencias
  fetch(`https://api.airtable.com/v0/${baseId}/${depsTable}`, {
    headers: { Authorization: `Bearer ${token}` }
  })
  .then(r => r.json())
  .then(data => {
    data.records.forEach(rec => {
      const o = document.createElement("option");
      o.value       = rec.id;                    // recordId de Dependencia
      o.textContent = rec.fields[depsNameFld];   // texto
      depEl.appendChild(o);
    });
  });

  // 2) Al elegir dependencia, cargar promotores vinculados
  depEl.addEventListener("change", async () => {
    promoEl.innerHTML = `<option value="">Selecciona un promotor</option>`;
    const depId = depEl.value;
    if (!depId) return;

    const filter = encodeURIComponent(`{${promosLinkFld}}='${depId}'`);
    const url    = `https://api.airtable.com/v0/${baseId}/${promosTable}?filterByFormula=${filter}`;
    const res    = await fetch(url, { headers:{ Authorization:`Bearer ${token}` } });
    const { records } = await res.json();

    records.forEach(rec => {
      const o = document.createElement("option");
      o.value       = rec.id;                         // recordId del promotor
      o.textContent = rec.fields[promosNameFld];      // nombre_promotor
      promoEl.appendChild(o);
    });
  });

  // 3) Al enviar: validaciones + guardar registro
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    msg.textContent = "";

    const f       = new FormData(form);
    const depId   = f.get("dependencia");
    const promoId = f.get("promotor");
    const nombres = f.get("nombres").trim();
    const ape1    = f.get("apellido1").trim();
    const ape2    = f.get("apellido2").trim();
    const telefono= f.get("telefono").trim();
    // (aquí podrías volver a validar duplicados si lo deseas...)

    // Armar payload: sólo linkeamos la dependencia
    const payload = {
      fields: {
        [regDepFld]: [depId],
        nombres,
        apellido1: ape1,
        apellido2: ape2,
        calle: f.get("calle").trim(),
        numext: parseInt(f.get("numext"),10),
        numint: f.get("numint").trim(),
        colonia: f.get("colonia").trim(),
        cp: parseInt(f.get("cp"),10),
        seccion: parseInt(f.get("seccion"),10),
        telefono
      },
      typecast: true
    };

    const saveRes = await fetch(
      `https://api.airtable.com/v0/${baseId}/${regTable}`,
      {
        method:  "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      }
    );
    const saveJson = await saveRes.json();
    if (saveRes.ok) {
      msg.textContent = "✅ Registro exitoso.";
      msg.style.color = "green";
      form.reset();
      promoEl.innerHTML = `<option value="">Selecciona un promotor</option>`;
    } else {
      console.error(saveJson);
      msg.textContent = "❌ Error al enviar el formulario.";
      msg.style.color = "red";
    }
  });
});
