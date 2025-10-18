import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import "./styles.css";

type Props = {
  onClose: () => void;
  onCreated: () => void; 
};

type User = {
  _id: string;
  id?: string;
  username: string;
  age: number;
  hobbies?: string[];
};

export default function CreateUserPanel({ onClose, onCreated }: Props) {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");

  const [username, setUsername] = useState("");
  const [age, setAge] = useState<string>("");
  const [hobbiesStr, setHobbiesStr] = useState("");
  const [selectedFriendIds, setSelectedFriendIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const res = await axios.get("/api/users");
        setUsers(res.data?.users || []);
      } catch (err) {
        console.error("Failed to load users", err);
      }
    };
    loadUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) => u.username.toLowerCase().includes(q) || String(u.age).includes(q)
    );
  }, [users, search]);

  const toggleFriend = (id: string) => {
    setSelectedFriendIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const createUser = async () => {
    const name = username.trim();
    const ageNum = Number(age);
    const hobbies = hobbiesStr
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    if (!name) {
      alert("Username is required");
      return;
    }
    if (!Number.isFinite(ageNum) || ageNum < 0) {
      alert("Age must be a non-negative number");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post("/api/users", {
        username: name,
        age: ageNum,
        hobbies,
      });

      const newUser = res.data?.user as User | undefined;
      if (!newUser || !(newUser as any)._id) {
        throw new Error("User creation did not return an id");
      }

      const newId = (newUser as any)._id as string;
      if (selectedFriendIds.size > 0) {
        await Promise.all(
          Array.from(selectedFriendIds).map((fid) =>
            axios.post(`/api/users/${newId}/link`, { friendId: fid })
          )
        );
      }

      onCreated();
      onClose();
    } catch (err: any) {
      console.error(err);
      alert(err?.response?.data?.message || "Failed to create user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="panel panel--create" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div className="panel-header">
        <h3 className="panel-title">Create User</h3>
        <button onClick={onClose}>Close</button>
      </div>

      <label>Username</label>
      <input
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="e.g., Alice"
        style={{ padding: 8, border: "1px solid #ddd", borderRadius: 6 }}
      />

      <label>Age</label>
      <input
        type="number"
        value={age}
        onChange={(e) => setAge(e.target.value)}
        placeholder="e.g., 30"
        style={{ padding: 8, border: "1px solid #ddd", borderRadius: 6 }}
      />

      <label>Hobbies</label>
      <input
        value={hobbiesStr}
        onChange={(e) => setHobbiesStr(e.target.value)}
        placeholder="music, chess, coding"
        style={{ padding: 8, border: "1px solid #ddd", borderRadius: 6 }}
      />

      <div className="create-search-row">
        <strong>Link Friends</strong>
        <input
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: 1, padding: 6, border: "1px solid #ddd", borderRadius: 6 }}
        />
      </div>

      <div className="create-users-box">
        <div className="create-users-header">
          Select one or more existing users to link as friends
        </div>
        <div className="create-users-list">
          {filteredUsers.map((u) => (
            <label key={u._id || u.id} className="create-user-item">
              <input
                type="checkbox"
                checked={selectedFriendIds.has(u._id || (u.id as string))}
                onChange={() => toggleFriend(u._id || (u.id as string))}
              />
              <span>
                {u.username} ({u.age})
              </span>
            </label>
          ))}
          {filteredUsers.length === 0 && (
            <div style={{ padding: 10, color: "#6b7280", fontSize: 12 }}>No users found</div>
          )}
        </div>
      </div>

      <div className="panel-actions" style={{ marginTop: 6 }}>
        <button onClick={createUser} disabled={loading} className="btn btn-primary">
          {loading ? "Creating..." : "Create"}
        </button>
        <button onClick={onClose} disabled={loading} className="btn btn-secondary">
          Cancel
        </button>
      </div>
    </div>
  );
}
