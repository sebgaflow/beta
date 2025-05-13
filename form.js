// Configuración
const token         = "patpwEeJi6lj1kVSA.96038881b98860c419b2dd70e45e3e70d5e7336b9124a86b7d0caf5a270173fc";
const baseId        = "appi5iq2xznnBxNvJ";

// IDs de tablas
const depsTable     = "tblhnh0UVIIbHMZFr";  // Dependencia
const promosTable   = "tblriBT8T8hRMHmEZ";  // Promotores
const regTable      = "tblefXMYV3zUmEwXk";  // Registros

// Field **names** (NO IDs) según tu esquema
const depsNameFld   = "DEPENDENCIA";        // en Dependencia (texto)
const promosLinkFld = "dependencia";        // en Promotores (link a Dependencia)
const promosNameFld = "nombre_promotor";    // en Promotores (texto)
const regDepFld     = "DEPENDENCIA_LINKED"; // en Registros (link a Dependencia)
const regPromoFld   = "PROMOTOR_LINKED";    // (opcional) campo link a Promotores en Registros

document.addEventListener("DOMContentLoaded", () => {
  const depEl   = document.getElementById("dependencia");
  const promoEl = document.getElementById("promotor");
  const form    = document.getElementById("formulario");
  const msg     = document.getElementById("mensaje");

  // 1) Cargar dependencias dinámicamente
  fetch(`https://api.airtable.com/v0/${baseId}/${depsTable}`, {
    headers: { Authorization: `Bearer ${token}` }
  })
  .then(res => res.json())
  .then(data => {
    data.records.forEach(rec => {
      const opt = document.createElement("option");
      opt.value       = rec.id;
      opt.textContent = rec.fields[depsNameFld] || "(sin nombre)";
      depEl.appendChild(opt);
    });
  });

  // 2) Al cambiar Dependencia, cargar sólo sus promotores
  depEl.addEventListener("change", async () => {
    promoEl.innerHTML = `<option value="">Selecciona un promotor</option>`;
    const depId = depEl.value;
    if (!depId) return;

    const filter = encodeURIComponent(`{${promosLinkFld}}='${depId}'`);
    const url    = `https://api.airtable.com/v0/${baseId}/${promosTable}?filterByFormula=${filter}`;
    const res    = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const json = await res.json();
    (json.records || []).forEach(rec => {
      const opt = document.createElement("option");
      opt.value       = rec.id;
      opt.textContent = rec.fields[promosNameFld] || "(sin nombre)";
      promoEl.appendChild(opt);
    });
  });

  // 3) Envío del formulario
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    msg.textContent = "";

    const f        = new FormData(form);
    const depId    = f.get("dependencia");
    const promoId  = f.get("promotor");
    const nombres  = f.get("nombres").trim();
    const ape1     = f.get("apellido1").trim();
    const ape2     = f.get("apellido2").trim();
    const telefono = f.get("telefono").trim();
    // (aquí puedes agregar validaciones de duplicados si las necesitas)

    // 4) Payload con linked-records y demás campos
    const payload = {
      fields: {
        [regDepFld]: [depId],
        [regPromoFld]: [promoId],  // si existe ese campo en tu esquema
        nombres,
        apellido1: ape1,
        apellido2: ape2,
        calle: f.get("calle").trim(),
        numext: parseInt(f.get("numext"), 10),
        numint: f.get("numint").trim(),
        colonia: f.get("colonia").trim(),
        cp: parseInt(f.get("cp"), 10),
        seccion: parseInt(f.get("seccion"), 10),
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
