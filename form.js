
// form.js
// —————————————————————————————————————————————
// 1) Configuración
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

// 2) Cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("formulario");
  const msg  = document.getElementById("mensaje");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const f = new FormData(form);

    // 3) Construir fórmula con template literals
    const filterFormula = `OR(
      {${fields.telefono}}='${f.get("telefono")}',
      AND(
        {${fields.nombres}}='${f.get("nombres")}',
        {${fields.apellido1}}='${f.get("apellido1")}',
        {${fields.apellido2}}='${f.get("apellido2")}'
      )
    )`;
    const encodedFilter = encodeURIComponent(filterFormula);

    // 4) Verificar duplicados
    const checkRes = await fetch(
      `https://api.airtable.com/v0/${baseId}/${table}?filterByFormula=${encodedFilter}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const checkJson = await checkRes.json();
    if (checkJson.records?.length) {
      msg.textContent = "❌ Ya existe un registro duplicado.";
      msg.style.color   = "red";
      return;
    }

    // 5) Armar payload y guardar
    const recordFields = {
      [fields.dependencia]: f.get("dependencia"),
      [fields.promotor]:    f.get("promotor"),
      [fields.nombres]:     f.get("nombres"),
      [fields.apellido1]:   f.get("apellido1"),
      [fields.apellido2]:   f.get("apellido2"),
      [fields.calle]:       f.get("calle"),
      [fields.numext]:      parseInt(f.get("numext"), 10),
      [fields.numint]:      f.get("numint"),
      [fields.colonia]:     f.get("colonia"),
      [fields.cp]:          parseInt(f.get("cp"), 10),
      [fields.seccion]:     parseInt(f.get("seccion"), 10),
      [fields.telefono]:    f.get("telefono")
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
      msg.textContent = "Registro exitoso.";
      msg.style.color   = "green";
      form.reset();
    } else {
      console.error(saveJson);
      msg.textContent = "Error al enviar el formulario.";
      msg.style.color   = "red";
    }
  });
});
