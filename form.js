
// form.js
const token  = "patpwEeJi6lj1kVSA.96038881b98860c419b2dd70e45e3e70d5e7336b9124a86b7d0caf5a270173fc";
const baseId = "appi5iq2xznnBxNvJ";
const table  = "tblefXMYV3zUmEwXk";
const fields = {
  dependencia: "fldUxubMvcv8fTvUl",
  promotor:    "fldBYSsQW7AuCZIxw",
  nombres:     "fldZD3e40hfZWkBrC",
  apellido1:   "fldvTQJ9AJXZAq6Go",
  apellido2:   "fldmZn2MhygKGbp5E",
  calle:       "fldTXQpUayq03SqGP",
  numext:      "fldzcyV7OD3UHbdyx",
  numint:      "fldllGor8QzaTactq",
  colonia:     "fldnVmj53rvm5RsdQ",
  cp:          "fldU13HKpwypVx3qt",
  seccion:     "fldhRiT7s8cnZJKhN",
  telefono:    "fldPByjAjeIbIQB0t"
};

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("formulario");
  const msg  = document.getElementById("mensaje");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const f = new FormData(form);
    const telefono  = f.get("telefono");
    const nombres   = f.get("nombres");
    const apellido1 = f.get("apellido1");
    const apellido2 = f.get("apellido2");

    // ——— 1) Validar duplicado por teléfono —————————————————————
    const phoneFilter = encodeURIComponent(
      `{${fields.telefono}}='${telefono}'`
    );
    const phoneRes = await fetch(
      `https://api.airtable.com/v0/${baseId}/${table}?filterByFormula=${phoneFilter}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const phoneJson = await phoneRes.json();
    if (phoneJson.records?.length > 0) {
      msg.textContent = "❌ Error: este número ya fue registrado.";
      msg.style.color   = "red";
      return;
    }

    // ——— 2) Validar duplicado por persona (nombre + apellidos) ——————
    const nameFormula = `AND(
      {${fields.nombres}}='${nombres}',
      {${fields.apellido1}}='${apellido1}',
      {${fields.apellido2}}='${apellido2}'
    )`;
    const nameFilter = encodeURIComponent(nameFormula);
    const nameRes = await fetch(
      `https://api.airtable.com/v0/${baseId}/${table}?filterByFormula=${nameFilter}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const nameJson = await nameRes.json();
    if (nameJson.records?.length > 0) {
      msg.textContent = "❌ Error: esta persona ya fue registrada.";
      msg.style.color   = "red";
      return;
    }

    // ——— 3) Si no hay duplicados, armar y enviar el registro ——————
    const recordFields = {
      [fields.dependencia]: f.get("dependencia"),
      [fields.promotor]:    f.get("promotor"),
      [fields.nombres]:     nombres,
      [fields.apellido1]:   apellido1,
      [fields.apellido2]:   apellido2,
      [fields.calle]:       f.get("calle"),
      [fields.numext]:      parseInt(f.get("numext"), 10),
      [fields.numint]:      f.get("numint"),
      [fields.colonia]:     f.get("colonia"),
      [fields.cp]:          parseInt(f.get("cp"), 10),
      [fields.seccion]:     parseInt(f.get("seccion"), 10),
      [fields.telefono]:    telefono
    };

    const saveRes = await fetch(
      `https://api.airtable.com/v0/${baseId}/${table}`,
      {
        method:  "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ fields: recordFields, typecast: true })
      }
    );
    const saveJson = await saveRes.json();
    if (saveRes.ok) {
      msg.textContent = "✅ Registro exitoso.";
      msg.style.color   = "green";
      form.reset();
    } else {
      console.error(saveJson);
      msg.textContent = "❌ Error al enviar el formulario.";
      msg.style.color   = "red";
    }
  });
});
