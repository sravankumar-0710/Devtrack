import { Library } from "lucide-react";
import { SectionTitle } from "../components/UI";
import { RecordManager } from "../components/RecordManager";
import { RESOURCE_FIELDS } from "../data/consistencyConstants";

export function ResourcesView({ resources, addItem, updateItem, deleteItem }) {
  return (
    <div style={{ maxWidth: 980, margin: "0 auto", padding: "28px 24px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
        <Library size={18} color="#C4B5FD" />
        <h1 style={{ fontSize: 18, fontWeight: 700, color: "#fff", margin: 0 }}>Resources</h1>
      </div>
      <SectionTitle>Courses, videos, books &amp; reference links</SectionTitle>

      <RecordManager
        title="Resources"
        fields={RESOURCE_FIELDS}
        items={resources}
        accent="#C4B5FD"
        onAdd={(item) => addItem("resources", item)}
        onDelete={(id) => deleteItem("resources", id)}
        onUpdate={(id, patch) => updateItem("resources", id, patch)}
      />
    </div>
  );
}
