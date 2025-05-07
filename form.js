
form_js_fixed = """
const token = "patpwEeJi6lj1kVSA.96038881b98860c419b2dd70e45e3e70d5e7336b9124a86b7d0caf5a270173fc";
const baseId = "appi5iq2xznnBxNvJ";
const tableId = "tblefXMYV3zUmEwXk";
const fields = {
  dependencia: "fldUxubMvcv8fTvUl",
  promotor: "fldBYSsQW7AuCZIxw",
  nombres: "fldZD3e40hfZWkBrC",
  apellido1: "fldvTQJ9AJXZAq6Go",
  apellido2: "fldmZn2MhygKGbp5E",
  calle: "fldTXQpUayq03SqGP",
  numext: "fldzcyV7OD3UHbdyx",
  numint: "fldllGor8QzaTactq",
  colonia: "fldnVmj53rvm5RsdQ",
  cp: "fldU13HKpwypVx3qt",
  seccion: "fldhRiT7s8cnZJKhN",
  telefono: "fldPByjAjeIbIQB0t"
};

document.getElementById("formulario").addEventListener("submit", async function (e) {
  e.preventDefault();
  const f = new FormData(this);

  const filter = encodeURIComponent(
    "OR({" + fields.telefono + "} = '" + f.get("telefono") + "', AND({" +
    fields.nombres + "} = '" + f.get("nombres") + "', {" +
    fields.apellido1 + "} = '" + f.get("apellido1") + "', {" +
    fields.apellido2 + "} = '" + f.get("apellido2") + "'))"
  );

  const res = await fetch("https://api.airtable.com/v0/" + baseId + "/" + tableId + "?filterByFormula=" + filter, {
    headers: { Authorization: "Bearer " + token }
  });
  const json = await res.json();

  if (json.records && json.records.length > 0) {
    document.getElementById("mensaje").innerText = "❌ Ya existe un registro duplicado.";
    document.getElementById("mensaje").style.color = "red";
    return;
  }

  const record = {
    fields: {
      [fields.dependencia]: f.get("dependencia"),
      [fields.promotor]: f.get("promotor"),
      [fields.nombres]: f.get("nombres"),
      [fields.apellido1]: f.get("apellido1"),
      [fields.apellido2]: f.get("apellido2"),
      [fields.calle]: f.get("calle"),
      [fields.numext]: parseInt(f.get("numext")),
      [fields.numint]: f.get("numint"),
      [fields.colonia]: f.get("colonia"),
      [fields.cp]: parseInt(f.get("cp")),
      [fields.seccion]: parseInt(f.get("seccion")),
      [fields.telefono]: f.get("telefono")
    }
  };

  const save = await fetch("https://api.airtable.com/v0/" + baseId + "/" + tableId, {
    method: "POST",
    headers: {
      Authorization: "Bearer " + token,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ ...record, typecast: true })
  });

  const result = await save.json();

  if (save.ok) {
    document.getElementById("mensaje").innerText = "✅ Registro exitoso.";
    document.getElementById("mensaje").style.color = "green";
    this.reset();
  } else {
    console.error("Error:", result);
    document.getElementById("mensaje").innerText = "❌ Error al enviar el formulario.";
    document.getElementById("mensaje").style.color = "red";
  }
});
"""

fixed_js_path = "/mnt/data/form_corregido.js"
with open(fixed_js_path, "w", encoding="utf-8") as f:
    f.write(form_js_fixed)

fixed_js_path
