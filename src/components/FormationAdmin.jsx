import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FaTrash,
  FaEdit,
  FaSave,
  FaTimes,
  FaSearch,
  FaPlus,
  FaSignOutAlt,
  FaUser,
  FaGraduationCap,
  FaComments,
} from "react-icons/fa";
import "../style.css";

export default function FormationAdmin() {
  const [activeTab, setActiveTab] = useState("formations");
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    role: "user",
    password: "",
  });
  const navigate = useNavigate();
  const [formations, setFormations] = useState([]);
  const [filteredFormations, setFilteredFormations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [searchUser, setSearchUser] = useState("");
  const [newFormation, setNewFormation] = useState({
    intitule: "",
    niveau: "licence",
    duree: "",
    langue: "",
    frais: "",
    rentree: "",
    matieres: {},
  });
  const [editIndex, setEditIndex] = useState(null);
  const [editFormation, setEditFormation] = useState({});
  const [message, setMessage] = useState(null);

  const token = sessionStorage.getItem("authToken");

  useEffect(() => {
    if (!token) {
      window.location.href = "/login";
      return;
    }
    fetchFormations();
  }, []);

  useEffect(() => {
    if (activeTab === "users") {
      fetchUsers();
    }
  }, [activeTab]);

  const fetchUsers = async () => {
    try {
      const res = await axios.get("http://localhost:5001/admin/users", {
        headers: { Authorization: token },
      });
      setUsers(res.data);
    } catch (err) {
      setMessage("Erreur chargement utilisateurs");
    }
  };

  const handleAddUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.password) {
      setMessage(
        "Tous les champs doivent être remplis (nom, email, mot de passe)"
      );
      return;
    }
    if (!/\S+@\S+\.\S+/.test(newUser.email)) {
      setMessage("📧 Email invalide !");
      return;
    }

    try {
      await axios.post("http://localhost:5001/admin/users", newUser, {
        headers: { Authorization: token },
      });
      setNewUser({ name: "", email: "", role: "user" });
      setMessage("Utilisateur ajouté !");
      fetchUsers();
    } catch (err) {
      setMessage("Erreur ajout utilisateur : " + err.message);
    }
  };

  const handleDeleteUser = async (email) => {
    if (!window.confirm("Supprimer cet utilisateur ?")) return;
    try {
      await axios.delete(`http://localhost:5001/admin/users/${email}`, {
        headers: { Authorization: token },
      });
      fetchUsers();
    } catch (err) {
      setMessage("Erreur suppression utilisateur : " + err.message);
    }
  };

  const fetchFormations = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await axios.get("http://localhost:5001/admin/formations", {
        headers: { Authorization: token },
      });

      const data = res.data.map((f) => ({
        ...f,
        matieres: f.matieres || {},
      }));
      setFormations(data);
      setFilteredFormations(data);
    } catch (err) {
      setMessage("Erreur chargement formations");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearch(term);
    setFilteredFormations(
      formations.filter((f) => f.intitule.toLowerCase().includes(term))
    );
  };

  const handleLogout = () => {
    sessionStorage.removeItem("authToken");
    window.location.href = "/login";
  };

  const normalizeMatieres = (matObj, niveau) => {
    const semestres = niveau === "licence" ? [1, 2, 3, 4, 5, 6] : [1, 2, 3, 4];
    const result = {};
    semestres.forEach((num) => {
      const key = `Semestre ${num}`;
      const raw = matObj[key] || "";
      result[key] = raw
        .split(",")
        .map((m) => m.trim())
        .filter((m) => m.length > 0);
    });
    return result;
  };

  const handleAdd = async () => {
    if (!newFormation.intitule || !newFormation.duree) {
      setMessage("Intitulé et durée obligatoires");
      return;
    }
    try {
      const dataToSend = {
        ...newFormation,
        matieres: normalizeMatieres(newFormation.matieres, newFormation.niveau),
      };

      await axios.post("http://localhost:5001/admin/formations", dataToSend, {
        headers: { Authorization: token },
      });

      setNewFormation({
        intitule: "",
        niveau: "licence",
        duree: "",
        langue: "",
        frais: "",
        rentree: "",
        matieres: {},
      });
      setMessage("Formation ajoutée avec succès");
      fetchFormations();
    } catch (err) {
      setMessage(
        "Erreur ajout : " + (err.response?.data?.message || err.message)
      );
    }
  };

  const startEdit = (formation, index) => {
    setEditIndex(index);
    const matieresStr = {};
    Object.entries(formation.matieres || {}).forEach(([k, v]) => {
      matieresStr[k] = Array.isArray(v) ? v.join(", ") : v;
    });
    setEditFormation({ ...formation, matieres: matieresStr });
  };

  const cancelEdit = () => {
    setEditIndex(null);
    setEditFormation({});
    setMessage(null);
  };

  const saveEdit = async () => {
    if (!editFormation.intitule || !editFormation.duree) {
      setMessage("Intitulé et durée obligatoires");
      return;
    }
    try {
      const dataToSend = {
        ...editFormation,
        matieres: normalizeMatieres(
          editFormation.matieres,
          editFormation.niveau
        ),
      };

      await axios.put(
        `http://localhost:5001/admin/formations/${editFormation.intitule}`,
        dataToSend,
        { headers: { Authorization: token } }
      );
      setEditIndex(null);
      setEditFormation({});
      setMessage("Formation mise à jour");
      fetchFormations();
    } catch (err) {
      setMessage(
        "Erreur mise à jour : " + (err.response?.data?.message || err.message)
      );
    }
  };

  const handleDelete = async (intitule) => {
    if (!window.confirm("Confirmez la suppression ?")) return;
    try {
      await axios.delete(`http://localhost:5001/admin/formations/${intitule}`, {
        headers: { Authorization: token },
      });
      setMessage("Formation supprimée");
      fetchFormations();
    } catch (err) {
      setMessage(
        "Erreur suppression : " + (err.response?.data?.message || err.message)
      );
    }
  };

  const renderMatieresInputs = (formationState, setFormationState, niveau) => {
    const semestres = niveau === "licence" ? 6 : 4;
    return Array.from({ length: semestres }, (_, i) => i + 1).map((num) => (
      <input
        key={`mat-s${num}`}
        type="text"
        placeholder={`Matières Semestre ${num}`}
        value={formationState.matieres[`Semestre ${num}`] || ""}
        onChange={(e) =>
          setFormationState({
            ...formationState,
            matieres: {
              ...formationState.matieres,
              [`Semestre ${num}`]: e.target.value,
            },
          })
        }
      />
    ));
  };

  return (
    <div className="admin-container">
      <h2>
        <FaGraduationCap style={{ marginRight: "5px" }} />
        Gestion des Formations et des Utilisateurs
      </h2>
      <div className="admin-nav">
        <button onClick={() => setActiveTab("formations")}>
          <FaGraduationCap style={{ marginRight: "5px" }} />
          Formations
        </button>
        <button onClick={() => setActiveTab("users")}>
          <FaUser style={{ marginRight: "5px" }} />
          Utilisateurs
        </button>
        <button onClick={() => navigate("/chat")}>
          <FaComments style={{ marginRight: "5px" }} />
          Basculer vers le chatbot
        </button>
      </div>
      <button className="btn-logout" onClick={handleLogout}>
        <FaSignOutAlt style={{ marginRight: "5px" }} />
        Se déconnecter
      </button>

      {message && <div className="message">{message}</div>}

      {activeTab === "formations" && (
        <>
          <div className="form-admin-controls">
            <div className="form-search">
              <FaSearch />
              <input
                type="text"
                placeholder="Rechercher une formation..."
                value={search}
                onChange={handleSearch}
              />
            </div>

            <div className="form-add">
              <input
                type="text"
                placeholder="Intitulé"
                value={newFormation.intitule}
                onChange={(e) =>
                  setNewFormation({ ...newFormation, intitule: e.target.value })
                }
              />
              <select
                value={newFormation.niveau}
                onChange={(e) =>
                  setNewFormation({
                    ...newFormation,
                    niveau: e.target.value,
                    matieres: {},
                  })
                }
              >
                <option value="licence">Licence</option>
                <option value="master">Master</option>
              </select>
              <input
                type="text"
                placeholder="Durée"
                value={newFormation.duree}
                onChange={(e) =>
                  setNewFormation({ ...newFormation, duree: e.target.value })
                }
              />
              <input
                type="text"
                placeholder="Langue"
                value={newFormation.langue}
                onChange={(e) =>
                  setNewFormation({ ...newFormation, langue: e.target.value })
                }
              />
              <input
                type="text"
                placeholder="Frais"
                value={newFormation.frais}
                onChange={(e) =>
                  setNewFormation({ ...newFormation, frais: e.target.value })
                }
              />
              <input
                type="text"
                placeholder="Rentrée"
                value={newFormation.rentree}
                onChange={(e) =>
                  setNewFormation({ ...newFormation, rentree: e.target.value })
                }
              />
              {renderMatieresInputs(
                newFormation,
                setNewFormation,
                newFormation.niveau
              )}

              <button className="btn-add" onClick={handleAdd}>
                <FaPlus /> Ajouter
              </button>
            </div>
          </div>

          {loading ? (
            <p>Chargement...</p>
          ) : (
            <table className="formation-table">
              <thead>
                <tr>
                  <th>Intitulé</th>
                  <th>Niveau</th>
                  <th>Durée</th>
                  <th>Langue</th>
                  <th>Frais</th>
                  <th>Rentrée</th>
                  <th>Matières</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredFormations.map((formation, idx) => (
                  <tr key={idx}>
                    {editIndex === idx ? (
                      <>
                        <td>
                          <input
                            value={editFormation.intitule}
                            onChange={(e) =>
                              setEditFormation({
                                ...editFormation,
                                intitule: e.target.value,
                              })
                            }
                          />
                        </td>
                        <td>
                          <select
                            value={editFormation.niveau}
                            onChange={(e) =>
                              setEditFormation({
                                ...editFormation,
                                niveau: e.target.value,
                                matieres: {},
                              })
                            }
                          >
                            <option value="licence">Licence</option>
                            <option value="master">Master</option>
                          </select>
                        </td>
                        <td>
                          <input
                            value={editFormation.duree}
                            onChange={(e) =>
                              setEditFormation({
                                ...editFormation,
                                duree: e.target.value,
                              })
                            }
                          />
                        </td>
                        <td>
                          <input
                            value={editFormation.langue}
                            onChange={(e) =>
                              setEditFormation({
                                ...editFormation,
                                langue: e.target.value,
                              })
                            }
                          />
                        </td>
                        <td>
                          <input
                            value={editFormation.frais}
                            onChange={(e) =>
                              setEditFormation({
                                ...editFormation,
                                frais: e.target.value,
                              })
                            }
                          />
                        </td>
                        <td>
                          <input
                            value={editFormation.rentree}
                            onChange={(e) =>
                              setEditFormation({
                                ...editFormation,
                                rentree: e.target.value,
                              })
                            }
                          />
                        </td>
                        <td>
                          {renderMatieresInputs(
                            editFormation,
                            setEditFormation,
                            editFormation.niveau
                          )}
                        </td>
                        <td>
                          <button onClick={saveEdit} title="Sauvegarder">
                            <FaSave />
                          </button>
                          <button onClick={cancelEdit} title="Annuler">
                            <FaTimes />
                          </button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td>{formation.intitule}</td>
                        <td>{formation.niveau}</td>
                        <td>{formation.duree}</td>
                        <td>{formation.langue}</td>
                        <td>{formation.frais}</td>
                        <td>{formation.rentree}</td>
                        <td>
                          {Object.entries(formation.matieres).map(
                            ([sem, mat]) => (
                              <div key={sem}>
                                <b>{sem}:</b>{" "}
                                {Array.isArray(mat) ? mat.join(", ") : mat}
                              </div>
                            )
                          )}
                        </td>
                        <td>
                          <button
                            onClick={() => startEdit(formation, idx)}
                            title="Modifier"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDelete(formation.intitule)}
                            title="Supprimer"
                          >
                            <FaTrash />
                          </button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}

      {activeTab === "users" && (
        <div className="user-management">
          <h3>
            <FaUser style={{ marginRight: "5px" }} /> Gestion des utilisateurs
          </h3>

          {/* ✅ Barre de recherche utilisateur */}
          <div className="form-search">
            <FaSearch />
            <input
              type="text"
              placeholder="Rechercher un utilisateur..."
              value={searchUser}
              onChange={(e) => setSearchUser(e.target.value.toLowerCase())}
            />
          </div>
          <div className="user-form">
            <input
              type="text"
              placeholder="Nom"
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
            />
            <input
              type="email"
              placeholder="Email"
              value={newUser.email}
              onChange={(e) =>
                setNewUser({ ...newUser, email: e.target.value })
              }
            />
            <input
              type="password"
              placeholder="Mot de passe"
              value={newUser.password}
              onChange={(e) =>
                setNewUser({ ...newUser, password: e.target.value })
              }
            />

            <select
              value={newUser.role}
              onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
            >
              <option value="user">Utilisateur</option>
              <option value="admin">Admin</option>
            </select>
            <button onClick={handleAddUser}>
              <FaPlus /> Ajouter
            </button>
          </div>

          <table className="user-table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Email</th>
                <th>Rôle</th>
                <th>Mot de passe</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users
                .filter((u) => {
                  const search = searchUser?.toLowerCase() || "";
                  return (
                    u.name?.toLowerCase().includes(search) ||
                    false ||
                    u.email?.toLowerCase().includes(search) ||
                    false
                  );
                })

                .map((user, i) => (
                  <tr key={i}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.role}</td>
                    <td>
                      ..............................................................................................................
                    </td>
                    <td>
                      <button
                        onClick={() => handleDeleteUser(user.email)}
                        title="Supprimer"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
