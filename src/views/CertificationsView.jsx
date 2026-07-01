import { Award } from "lucide-react";
import { SectionTitle } from "../components/UI";
import { RecordManager } from "../components/RecordManager";
import { CERTIFICATION_FIELDS } from "../data/consistencyConstants";

export function CertificationsView({ certifications, addItem, updateItem, deleteItem }) {
  const completed = certifications.filter((c) => c.status === "Completed").length;

  return (
    <div style={{ maxWidth: 980, margin: "0 auto", padding: "28px 24px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
        <Award size={18} color="#FCD34D" />
        <h1 style={{ fontSize: 18, fontWeight: 700, color: "#fff", margin: 0 }}>Certifications</h1>
      </div>
      <SectionTitle>{completed} of {certifications.length} completed</SectionTitle>

      <RecordManager
        title="Certifications"
        fields={CERTIFICATION_FIELDS}
        items={certifications}
        accent="#FCD34D"
        onAdd={(item) => addItem("certifications", item)}
        onDelete={(id) => deleteItem("certifications", id)}
        onUpdate={(id, patch) => updateItem("certifications", id, patch)}
      />
    </div>
  );
}
