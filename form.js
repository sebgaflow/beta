// form.js
const token  = "patpwEeJi6lj1kVSA.96038881b98860c419b2dd70e45e3e70d5e7336b9124a86b7d0caf5a270173fc";
const baseId = "appi5iq2xznnBxNvJ";
const table  = "tblefXMYV3zUmEwXk";
const F = {
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

    // 1) Recogemos y limpiamos los valores
    const f        = new FormData(form);
    const telefono = f.get("telefono").trim();
    const nombres  = f.get("nombres").trim();
    const ape1     = f.get("apellido1").trim();
    const ape2     = f.get("apellido2").trim();

    // 2) VALIDACIÓN #1: TELÉFONO
    //    Aquí hacemos la primera interacción con la base:
    const phoneFilter = encodeURIComponent(`{${F.telefono}}='${telefono}'`);
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

    // 3) VALIDACIÓN #2: PERSONA (nombre + apellidos)
    //    Segunda interacción con la base:
    const personFormula = encodeURIComponent(`
      AND(
        {${F.nombres}}='${nombres}',
        {${F.apellido1}}='${ape1}',
        {${F.apellido2}}='${ape2}'
      )
    `);
    const personRes = await fetch(
      `https://api.airtable.com/v0/${baseId}/${table}?filterByFormula=${personFormula}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const personJson = await personRes.json();
    if (personJson.records?.length > 0) {
      msg.textContent = "❌ Error: esta persona ya fue registrada.";
      msg.style.color   = "red";
      return;
    }

    // 4) Ningún duplicado: enviamos el registro
    const recordFields = {
      [F.dependencia]: f.get("dependencia"),
      [F.promotor]:    f.get("promotor"),
      [F.nombres]:     nombres,
      [F.apellido1]:   ape1,
      [F.apellido2]:   ape2,
      [F.calle]:       f.get("calle"),
      [F.numext]:      parseInt(f.get("numext"), 10),
      [F.numint]:      f.get("numint"),
      [F.colonia]:     f.get("colonia"),
      [F.cp]:          parseInt(f.get("cp"), 10),
      [F.seccion]:     parseInt(f.get("seccion"), 10),
      [F.telefono]:    telefono
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
