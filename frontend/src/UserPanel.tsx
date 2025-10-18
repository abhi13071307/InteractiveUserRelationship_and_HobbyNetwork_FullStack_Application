import React, { useState, useEffect } from "react";
import axios from "axios";
import "./styles.css";

type Props = {
  userId: string | null;
  onClose: () => void;
  onSaved: () => void; 
};

export default function UserPanel({ userId, onClose, onSaved }: Props) {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [userMap, setUserMap] = useState<Record<string, any>>({});

  useEffect(() => {
    if (!userId) {
      setUser(null);
      return;
    }
    const load = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`/api/users`);
        const users = res.data.users || [];
        const u = users.find((x: any) => x._id === userId || x.id === userId);
        setUser(u || null);
        setAllUsers(users);
        const map: Record<string, any> = {};
        for (const usr of users) {
          const key = (usr._id ?? usr.id)?.toString?.() ?? usr._id ?? usr.id;
          if (key) map[key] = usr;
          if (usr.id && usr.id !== key) map[usr.id] = usr;
          if (usr._id && usr._id.toString && usr._id.toString() !== key) map[usr._id.toString()] = usr;
        }
        setUserMap(map);
      } catch (err: any) {
        setError("Failed to load user");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [userId]);

  const onChange = (k: string, v: any) => setUser((s: any) => ({ ...s, [k]: v }));

  const save = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const payload: any = {
        username: user.username,
        age: Number(user.age),
        hobbies: user.hobbies ?? [],
      };
      await axios.put(`/api/users/${user._id}`, payload);
      alert("User updated");
      onSaved();
      onClose();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to update user");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const remove = async () => {
    if (!user) return;
    if (!confirm(`Delete user ${user.username}? This requires unlinking first if they have friends.`)) return;
    try {
      await axios.delete(`/api/users/${user._id}`);
      alert("User deleted");
      onSaved();
      onClose();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to delete user");
      console.error(err);
    }
  };

  const unlinkFriend = async (friendId: string) => {
    if (!user || !friendId) return;
    const friendName = userMap[friendId]?.username || friendId;
    if (!confirm(`Unlink ${friendName} from ${user.username}?`)) return;
    try {
      await axios.delete(`/api/users/${user._id}/unlink`, { data: { friendId } });
      setUser((s: any) => ({
        ...s,
        friends: (s?.friends || []).filter((f: any) => (typeof f === "string" ? f : f?._id) !== friendId),
      }));
      onSaved();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to unlink friend");
      console.error(err);
    }
  };

  if (!userId) return null;

  return (
    <div className="panel panel--user">
      <div className="panel-header">
        <h3 className="panel-title">{user?.username || "User"}</h3>
        <button onClick={onClose}>Close</button>
      </div>

      {loading && <div>Loading...</div>}
      {error && <div style={{ color: "red" }}>{error}</div>}

      {user && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <label>Username</label>
          <input style={{ width: "100%" }} value={user.username} onChange={(e) => onChange("username", e.target.value)} />

          <label>Age</label>
          <input style={{ width: "100%" }} type="number" value={user.age} onChange={(e) => onChange("age", e.target.value)} />

          <label>Hobbies</label>
          <input
            style={{ width: "100%" }}
            value={(user.hobbies || []).join(",")}
            onChange={(e) => onChange("hobbies", e.target.value.split(",").map((s: string) => s.trim()).filter(Boolean))}
          />

          <div className="panel-actions">
            <button onClick={save} disabled={loading} className="btn btn-primary">Save</button>
            <button onClick={remove} disabled={loading} className="btn btn-danger">Delete</button>
          </div>

          <div className="create-users-box">
            <div className="create-users-header">Linked Friends</div>
            <div className="create-users-list">
              {(user.friends || []).map((f: any) => {
                const fid = typeof f === "string" ? f : (f?._id || (f?.toString ? f.toString() : ""));
                const friend = fid ? userMap[fid] : null;
                const label = friend ? `${friend.username} (${friend.age})` : fid || "Unknown";
                return (
                  <div key={fid} className="create-user-item friend-item">
                    <span className="friend-name">{label}</span>
                    <button onClick={() => unlinkFriend(fid)} className="btn btn-danger">Unlink</button>
                  </div>
                );
              })}
              {(!user.friends || user.friends.length === 0) && (
                <div style={{ padding: 10, color: "#6b7280", fontSize: 12 }}>No friends</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
