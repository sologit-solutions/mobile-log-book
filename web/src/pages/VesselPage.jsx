import React, { useMemo, useState } from "react";
import "../styles/vesselPage.css";
import PlusButton from "../components/PlusButton";
import { useVessel } from "../contexts/VesselContext";

function VesselIcon() {
    return (
        <i className="gg-anchor up-avatar" />
    );
}

export default function VesselPage() {
    const { vessel, createVessel, updateVessel, deleteVessel } = useVessel();
    const title = vessel?.name?.trim() || "Your vessel";
    const hasVessel = !!vessel;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [error, setError] = useState("");
    const [draft, setDraft] = useState({
        name: "",
        model: "",
        engine: "",
        engineHours: "",
        totalpower: "",
        length: "",
        year: "",
        notes: "",
    });

    function openManage() {
        setError("");
        setDraft({
            name: vessel?.name ?? "",
            model: vessel?.model ?? "",
            engine: vessel?.engine ?? "",
            engineHours: vessel?.engineHours ?? "",
            totalpower: vessel?.totalpower ?? "",
            length: vessel?.length ?? "",
            year: vessel?.year ?? "",
            notes: vessel?.notes ?? "",
        });
        setIsModalOpen(true);
    }

    function openCreate() {
        setError("");
        setDraft({
            name: "",
            model: "",
            engine: "",
            engineHours: "",
            totalpower: "",
            length: "",
            year: "",
            notes: "",
        });
        setIsModalOpen(true);
    }

    function save(e) {
        e.preventDefault();
        setError("");
        if (!draft.name.trim()) {
            setError("Name cannot be empty");
            return;
        }

        const payload = {
            name: draft.name.trim(),
            model: draft.model.trim(),
            engine: draft.engine.trim(),
            engineHours: String(draft.engineHours ?? "").trim(),
            totalpower: String(draft.totalpower ?? "").trim(),
            length: draft.length.trim(),
            year: draft.year.trim(),
            notes: draft.notes.trim(),
        };

        const res = hasVessel ? updateVessel(payload) : createVessel(payload);
        if (!res?.ok) {
            setError(res?.message || "Could not save");
            return;
        }
        setIsModalOpen(false);
    }

    function onDeleteVessel() {
        const ok = window.confirm("Delete vessel?");
        if (!ok) return;
        deleteVessel();
        setIsModalOpen(false);
    }

    const rows = useMemo(() => {
        if (!vessel) return [];
        return [
            { label: "Name:", value: vessel.name || "—" },
            { label: "Model:", value: vessel.model || "—" },
            { label: "Engine:", value: vessel.engine || "—" },
            { label: "Engine hours:", value: vessel.engineHours || "—" },
            { label: "Year:", value: vessel.year || "—" },
            { label: "Total power:", value: vessel.totalpower || "—" },
            { label: "Length:", value: vessel.length || "—" },
        ];
        }, [vessel]);

    return (
        <main className="content up-wrap">
            <section className="up-hero">
                <div className="up-avatar">
                    <VesselIcon />
                </div>
                <h1 className="up-name">{title}</h1>
                {hasVessel ? (
                    <button className="up-manageBtn" type="button" onClick={openManage}>
                        Manage vessel
                    </button>
                ) : (
                    <div className="plusBox">
                        <PlusButton
                            className="createLogBtn Btn"
                            onClick={openCreate}
                            ariaLabel="Add vessel"
                            title="Add vessel"
                        />
                    </div>
                )}
            </section>
            <section className="up-section">
                <h2 className="up-sectionTitle">Vessel info</h2>
                <div className="up-infoCard">
                    {!hasVessel ? (
                        <div className="emptyState" style={{ margin: 0 }}>
                            No vessel added yet.
                        </div>
                    ) : (
                        <>
                            {rows.map((r) => (
                                <div className="up-infoRow" key={r.label}>
                                    <span className="up-infoLabel">{r.label}</span>
                                    <span className="up-infoValue">{r.value}</span>
                                </div>
                            ))}
                            <div className="up-infoRow" style={{ paddingTop: 14 }}>
                                <span className="up-infoLabel">Notes:</span>
                                <span className="up-infoValue vp-notes">
                                    {vessel.notes?.trim() ? vessel.notes : "—"}
                                </span>
                            </div>
                        </>
                    )}
                </div>
            </section>
            {isModalOpen && (
                <div
                    className="modalOverlay"
                    role="dialog"
                    aria-modal="true"
                    onMouseDown={() => setIsModalOpen(false)}
                >
                    <div className="modalCard up-modalCard" onMouseDown={(e) => e.stopPropagation()}>
                        <h3 className="modalTitle">{hasVessel ? "Manage vessel" : "Add vessel"}</h3>
                        {error && <div className="up-error">{error}</div>}
                        <form className="modalForm" onSubmit={save}>
                            <label className="field">
                                <span className="fieldLabel">Name *</span>
                                <input
                                    className="fieldInput"
                                    value={draft.name}
                                    onChange={(e) => setDraft((p) => ({ ...p, name: e.target.value }))}
                                    placeholder='e.g. "Seagull"'
                                    required
                                />
                            </label>
                            <label className="field">
                                <span className="fieldLabel">Model</span>
                                <input
                                    className="fieldInput"
                                    value={draft.model}
                                    onChange={(e) => setDraft((p) => ({ ...p, model: e.target.value }))}
                                    placeholder="e.g. 424 Ketch"
                                />
                            </label>
                            <label className="field">
                                <span className="fieldLabel">Engine</span>
                                <input
                                    className="fieldInput"
                                    value={draft.engine}
                                    onChange={(e) => setDraft((p) => ({ ...p, engine: e.target.value }))}
                                    placeholder="e.g. Volvo Penta D2-40"
                                />
                            </label>
                            <label className="field">
                                <span className="fieldLabel">Engine hours</span>
                                <input
                                    className="fieldInput"
                                    value={draft.engineHours}
                                    onChange={(e) => setDraft((p) => ({ ...p, engineHours: e.target.value }))}
                                    placeholder="e.g. 1240"
                                />
                            </label>
                            <label className="field">
                                <span className="fieldLabel">Year</span>
                                <input
                                    className="fieldInput"
                                    value={draft.year}
                                    onChange={(e) => setDraft((p) => ({ ...p, year: e.target.value }))}
                                    placeholder="dd.mm.yyyy (or year)"
                                />
                            </label>
                            <label className="field">
                                <span className="fieldLabel">Total power</span>
                                <input
                                    className="fieldInput"
                                    value={draft.totalpower}
                                    onChange={(e) => setDraft((p) => ({ ...p, totalpower: e.target.value }))}
                                    placeholder="e.g. 135hp"
                                />
                            </label>
                            <label className="field">
                                <span className="fieldLabel">Length</span>
                                <input
                                    className="fieldInput"
                                    value={draft.length}
                                    onChange={(e) => setDraft((p) => ({ ...p, length: e.target.value }))}
                                    placeholder="e.g. 20.5m"
                                />
                            </label>
                            <label className="field">
                                <span className="fieldLabel">Notes</span>
                                <textarea
                                    className="fieldTextarea"
                                    value={draft.notes}
                                    onChange={(e) => setDraft((p) => ({ ...p, notes: e.target.value }))}
                                    placeholder="Describe your vessel: equipment, maintenance notes, history..."
                                    rows={5}
                                />
                            </label>
                            <div className="modalActions">
                                <button className="btn" type="button" onClick={() => setIsModalOpen(false)}>
                                    Cancel
                                </button>
                                <button className="btn" type="submit">
                                    Save
                                </button>
                                {hasVessel && (
                                    <button className="btn btnDelete" type="button" onClick={onDeleteVessel}>
                                        Delete vessel
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </main>
    );
}