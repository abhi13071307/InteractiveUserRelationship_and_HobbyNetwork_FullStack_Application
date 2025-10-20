import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import "./styles.css";

type Props = {
  refreshKey?: number;
};

const DEFAULT_HOBBIES = [
  "football",
  "music",
  "reading",
  "chess",
  "coding",
  "travel",
  "cooking",
  "gaming",
  "hiking",
  "swimming",
  "photography",
  "painting",
  "yoga",
  "movies",
  "dance",
];

const styles = {
  aside: {},
  title: {},
  input: {},
  addRow: {},
  addInput: {},
  button: {},
  buttonDisabled: {},
  loading: {},
  list: {},
  item: {},
  empty: {},
} as const;

export default function Sidebar({ refreshKey }: Props) {
  const [loading, setLoading] = useState(false);
  const [hobbies, setHobbies] = useState<string[]>(DEFAULT_HOBBIES);
  const [query, setQuery] = useState("");
  const [newHobby, setNewHobby] = useState("");

  const fetchHobbies = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/users");
      const users = res.data?.users ?? [];
      const fromUsers = new Set<string>();
      for (const u of users) {
        if (Array.isArray(u.hobbies)) {
          for (const h of u.hobbies) {
            if (typeof h === "string" && h.trim()) {
              fromUsers.add(h.trim().toLowerCase());
            }
          }
        }
      }
      const merged = Array.from(new Set([...DEFAULT_HOBBIES, ...Array.from(fromUsers)])).sort();
      setHobbies(merged);
    } catch (err) {
      console.error("Failed to fetch hobbies", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHobbies();
  }, []);

  useEffect(() => {
    if (refreshKey !== undefined) {
      fetchHobbies();
    }
  }, [refreshKey]);

  const onDragStart = (e: React.DragEvent, hobby: string) => {
    e.dataTransfer.setData("text/plain", hobby);
    e.dataTransfer.effectAllowed = "copy";
  };

  const addLocalHobby = () => {
    const v = newHobby.trim().toLowerCase();
    if (!v) return;
    setHobbies((prev) => (prev.includes(v) ? prev : [...prev, v].sort()));
    setNewHobby("");
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return hobbies;
    return hobbies.filter((h) => h.toLowerCase().includes(q));
  }, [hobbies, query]);

  return (
    <aside className="sidebar">
      <h3 className="sidebar-title">Hobbies</h3>

      <input
        placeholder="Search hobbies..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="sidebar-input"
      />

      <div className="sidebar-add-row">
        <input
          placeholder="Add hobby..."
          value={newHobby}
          onChange={(e) => setNewHobby(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") addLocalHobby();
          }}
          className="sidebar-add-input"
        />
        <button
          onClick={addLocalHobby}
          disabled={!newHobby.trim()}
          className="sidebar-add-button"
        >
          Add
        </button>
      </div>

      {loading && <div className="sidebar-loading">Loading hobbies...</div>}

      <div className="sidebar-list">
        {filtered.map((h) => (
          <div
            key={h}
            title="Drag onto a user to add hobby"
            draggable
            onDragStart={(e) => onDragStart(e, h)}
            className="sidebar-item"
          >
            {h}
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="sidebar-empty">No hobbies match your search.</div>
        )}
      </div>
    </aside>
  );
}
//updated with first error later