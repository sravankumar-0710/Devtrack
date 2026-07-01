import { Code2 } from "lucide-react";
import { SectionTitle } from "../components/UI";
import { RecordManager } from "../components/RecordManager";
import { DEV_PROJECT_FIELDS } from "../data/consistencyConstants";

export function ProjectsView({ devProjects, addItem, updateItem, deleteItem }) {
  const completed = devProjects.filter((p) => p.status === "Completed").length;
  const inProgress = devProjects.filter((p) => p.status === "In Progress").length;

  return (
    <div style={{ maxWidth: 980, margin: "0 auto", padding: "28px 24px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
        <Code2 size={18} color="#34D399" />
        <h1 style={{ fontSize: 18, fontWeight: 700, color: "#fff", margin: 0 }}>Projects</h1>
      </div>
      <SectionTitle>
        {completed} completed &middot; {inProgress} in progress &middot; {devProjects.length} total
      </SectionTitle>

      <RecordManager
        title="Projects"
        fields={DEV_PROJECT_FIELDS}
        items={devProjects}
        accent="#34D399"
        onAdd={(item) => addItem("devProjects", item)}
        onDelete={(id) => deleteItem("devProjects", id)}
        onUpdate={(id, patch) => updateItem("devProjects", id, patch)}
      />
    </div>
  );
}
