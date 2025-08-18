import { useState } from "react";

export default function HeatSubmit() {
  const [form, setForm] = useState({ type: "drop", lat: "", lng: "", sku: "", name: "" });

  const onChange = (e:any)=> setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e:any) => {
    e.preventDefault();
    await fetch("/api/community/heat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ ...form, lat: +form.lat, lng: +form.lng })
    });
    setForm({ type: "drop", lat: "", lng: "", sku: "", name: "" });
  };

  return (
    <form onSubmit={onSubmit} className="p-4 rounded-2xl shadow bg-white space-y-2">
      <h2 className="text-lg font-semibold">Share a Spot</h2>
      <select name="type" value={form.type} onChange={onChange}>
        <option value="drop">Drop</option><option value="restock">Restock</option><option value="find">Find</option>
      </select>
      <input name="lat" value={form.lat} onChange={onChange} placeholder="Lat" />
      <input name="lng" value={form.lng} onChange={onChange} placeholder="Lng" />
      <input name="sku" value={form.sku} onChange={onChange} placeholder="SKU" />
      <input name="name" value={form.name} onChange={onChange} placeholder="Name" />
      <button className="btn">Submit</button>
    </form>
  );
}