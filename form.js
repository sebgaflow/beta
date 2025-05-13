// form.js
const token       = "patpwEeJi6lj1kVSA.96038881b98860c419b2dd70e45e3e70d5e7336b9124a86b7d0caf5a270173fc";
const baseId      = "appi5iq2xznnBxNvJ";
const promosTable = "tblriBT8T8hRMHmEZ";  // tu tabla Promotores
const promosLink  = "fldwRyuKRjKksPyHf";   // campo Link a Dependencia
const promosName  = "fldXhZQ5homWIvAib";   // campo texto nombre_promotor
const regTable    = "tblefXMYV3zUmEwXk";   // tabla Registros
const regDepLink  = "fldUjZjWXuJ6ujKXB";   // DEPENDENCIA_LINKED en Registros
const regPromoFld = "fldMNgYuzOKHztVhK";   // lookup Promotores en Registros

document.addEventListener("DOMContentLoaded", () => {
  const depEl   = document.getElementById("dependencia");
  const promoEl = document.getElementById("promotor");
  const form    = document.getElementById("formulario");
  const msg     = document.getElementById("mensaje");

  // 1) Al cambiar dependencia, recargo promotores
  depEl.addEventListener("change", async () => {
    promoEl.innerHTML = `<option value="">Selecciona un promotor</option>`;

    const depText = depEl.value;
    if (!depText) return;

    try {
      // Filtramos promotores cuyo linked-record Dependencia 
      // tenga el nombre igual a depText. Airtable permite 
      // filtrar linked-record por ID, pero si todos los 
      // registros de Dependencia usan como Primary Field el 
      // nombre de texto, se puede filtrar así:
      const filter = encodeURIComponent(`{${promosLink}}='${depText}'`);
      const url    = `https://api.airtable.com/v0/${baseId}/${promosTable}?filterByFormula=${filter}`;
      const res    = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      const json   = await res.json();

      if (json.error) {
        console.error("Airtable error:", json.error);
        msg.textContent = "❌ Error al cargar promotores.";
        msg.style.color = "red";
        return;
      }

      (json.records || []).forEach(rec => {
        const o = document.createElement("option");
        o.value       = rec.id;
        o.textContent = rec.fields[promosName] || "(sin nombre)";
        promoEl.appendChild(o);
      });

    } catch (err) {
      console.error("Fetch failed:", err);
      msg.textContent = "❌ Error de red al cargar promotores.";
      msg.style.color = "red";
    }
  });

  // 2) Al enviar formulario
  form.addEventListener("submit", async e => {
    e.preventDefault();
    msg.textContent = "";

    const f        = new FormData(form);
    const depText  = f.get("dependencia");
    const promoId  = f.get("promotor");
    const payload  = {
      fields: {
        [regDepLink]: [depText],       // guardamos el texto como linked-record
        [regPromoFld]: [promoId],      // ID del promotor elegido
        nombres:       f.get("nombres").trim(),
        apellido1:     f.get("apellido1").trim(),
        apellido2:     f.get("apellido2").trim(),
        calle:         f.get("calle").trim(),
        numext:        parseInt(f.get("numext"), 10),
        numint:        f.get("numint").trim(),
        colonia:       f.get("colonia").trim(),
        cp:            parseInt(f.get("cp"), 10),
        seccion:       parseInt(f.get("seccion"), 10),
        telefono:      f.get("telefono").trim()
      },
      typecast: true
    };

    try {
      const saveRes  = await fetch(
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
        console.error("Airtable save error:", saveJson.error);
        msg.textContent = "❌ Error al enviar el formulario.";
        msg.style.color = "red";
      }
    } catch (err) {
      console.error("Network save error:", err);
      msg.textContent = "❌ Error de red al enviar el formulario.";
      msg.style.color = "red";
    }
  });
});
