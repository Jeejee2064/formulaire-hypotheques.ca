'use client'
import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import {
    Plus, X, Check, Loader2, ArrowRight, MapPin,
    LogOut, Trash2, RotateCcw, ShieldAlert
} from 'lucide-react'

// ─── helpers ────────────────────────────────────────────────────────────────
function fmt(n) {
    return new Intl.NumberFormat('fr-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 }).format(n)
}
function fmtDate(d) {
    return new Date(d).toLocaleDateString('fr-CA', { day: 'numeric', month: 'short', year: 'numeric' })
}

const TYPE_STYLES = {
    Achat: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    Refinancement: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    Subrogation: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
}
const DOSSIER_STYLES = {
    A: 'bg-green-500/10 text-green-400 border-green-500/20',
    B: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    Privé: 'bg-red-500/10 text-red-400 border-red-500/20',
}
const STATUS_STYLES = {
    open: 'bg-green-500/10 text-green-400 border-green-500/20',
    taken: 'bg-white/5 text-white/60 border-white/10',
    cancelled: 'bg-red-500/10 text-red-400/70 border-red-500/20',
}
const STATUS_LABELS = {
    open: 'Disponible',
    taken: 'Pris',
    cancelled: 'Annulé',
}

function Badge({ label, style }) {
    return (
        <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border ${style || 'bg-white/5 text-white/80 border-white/10'}`}>
            {label}
        </span>
    )
}

// ─── Modal overlay wrapper ───────────────────────────────────────────────────
function Modal({ onClose, children }) {
    return (
        <div className="fixed inset-0 z-[200] flex items-end md:items-center justify-center">
            <motion.div
                className="absolute inset-0 bg-black/90 backdrop-blur-md"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={onClose}
            />
            <motion.div
                initial={{ y: '100%', opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: '100%', opacity: 0 }}
                transition={{ type: 'spring', damping: 26, stiffness: 300 }}
                className="relative bg-[#0F0F0F] border-t md:border border-white/10 rounded-t-[32px] md:rounded-[32px] w-full md:max-w-xl shadow-2xl max-h-[90dvh] overflow-y-auto"
            >
                <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mt-4 mb-0 md:hidden" />
                {children}
            </motion.div>
        </div>
    )
}

// ─── Selector option ─────────────────────────────────────────────────────────
function SelectOption({ label, selected, onClick }) {
    return (
        <button type="button" onClick={onClick}
            className={`w-full text-left p-4 rounded-2xl border-2 transition-all flex justify-between items-center group active:scale-[0.98] ${selected ? 'border-red-600 bg-red-600/10' : 'border-white/10 bg-white/[0.04] hover:border-white/20'}`}>
            <span className="text-base pr-4">{label}</span>
            <div className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${selected ? 'bg-red-600 border-red-600' : 'border-white/20 group-hover:border-white/30'}`}>
                {selected && <Check className="text-white w-3 h-3" strokeWidth={4} />}
            </div>
        </button>
    )
}

// ─── MODAL: Créer un dossier ─────────────────────────────────────────────────
function ModalCreer({ onClose, onCreated, defaultName, userId }) {
    const [form, setForm] = useState({
        broker_name: defaultName,
        type_demande: '',
        dossier_type: '',
        ville: '',
        loan_amount: '',
        notes: '',
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [done, setDone] = useState(false)

    const set = (k, v) => setForm(p => ({ ...p, [k]: v }))
    const isValid = form.broker_name.trim() && form.type_demande && form.dossier_type && form.ville.trim() && form.loan_amount

    const handleSubmit = async () => {
        if (!isValid) return
        setLoading(true)
        setError('')
        try {
            const res = await fetch('/api/courtiers/deals', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    broker_name: form.broker_name.trim(),
                    type_demande: form.type_demande,
                    dossier_type: form.dossier_type,
                    ville: form.ville.trim(),
                    loan_amount: parseFloat(form.loan_amount),
                    notes: form.notes.trim() || null,
                    created_by: userId,
                }),
            })
            const data = await res.json()
            if (!res.ok) { setError(data.error || 'Erreur.'); setLoading(false); return }
            setDone(true)
            setTimeout(() => { onCreated(data.deal); onClose() }, 900)
        } catch { setError('Erreur réseau.'); setLoading(false) }
    }

    if (done) return (
        <div className="p-10 flex flex-col items-center justify-center text-center">
            <div className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-green-500/20">
                <Check size={28} strokeWidth={3} />
            </div>
            <h3 className="text-xl font-bold">Dossier déposé !</h3>
            <p className="text-white/60 text-sm mt-1">Les courtiers ont été notifiés.</p>
        </div>
    )

    return (
        <div className="p-6 md:p-8">
            <div className="flex items-start justify-between mb-6">
                <div>
                    <span className="inline-block text-red-600 font-bold text-[10px] mb-2 uppercase tracking-[0.3em] py-0.5 px-2 bg-red-600/10 rounded-full">Nouveau dossier</span>
                    <h2 className="text-2xl font-bold tracking-tight">Déposer un dossier</h2>
                </div>
                <button onClick={onClose} className="p-2 bg-white/5 rounded-full hover:bg-white/10 text-white/60 flex-shrink-0"><X size={18} /></button>
            </div>

            <div className="space-y-6">
                <div>
                    <label className="block text-[10px] font-bold text-white/70 uppercase tracking-[0.3em] mb-2">Nom du courtier qui propose</label>
                    <input type="text" value={form.broker_name} onChange={e => set('broker_name', e.target.value)} placeholder="Votre nom"
                        className="w-full bg-transparent border-b-2 border-white/10 py-3 text-lg focus:outline-none focus:border-red-600 transition-colors placeholder:text-white/10" />
                </div>
                <div>
                    <label className="block text-[10px] font-bold text-white/70 uppercase tracking-[0.3em] mb-2">Type de demande</label>
                    <div className="space-y-2">
                        {['Achat', 'Refinancement', 'Subrogation'].map(t => (
                            <SelectOption key={t} label={t} selected={form.type_demande === t} onClick={() => set('type_demande', t)} />
                        ))}
                    </div>
                </div>
                <div>
                    <label className="block text-[10px] font-bold text-white/70 uppercase tracking-[0.3em] mb-2">Type de dossier</label>
                    <div className="space-y-2">
                        {['A', 'B', 'Privé'].map(d => (
                            <SelectOption key={d} label={`Dossier ${d}`} selected={form.dossier_type === d} onClick={() => set('dossier_type', d)} />
                        ))}
                    </div>
                </div>
                <div>
                    <label className="block text-[10px] font-bold text-white/70 uppercase tracking-[0.3em] mb-2">Ville</label>
                    <input type="text" value={form.ville} onChange={e => set('ville', e.target.value)} placeholder="Ex: Montréal, Laval..."
                        className="w-full bg-transparent border-b-2 border-white/10 py-3 text-lg focus:outline-none focus:border-red-600 transition-colors placeholder:text-white/10" />
                </div>
                <div>
                    <label className="block text-[10px] font-bold text-white/70 uppercase tracking-[0.3em] mb-2">Montant du prêt</label>
                    <div className="flex items-end gap-2">
                        <span className="text-white/70 text-2xl pb-3">$</span>
                        <input type="number" value={form.loan_amount} onChange={e => set('loan_amount', e.target.value)} placeholder="0" min="0"
                            className="flex-1 bg-transparent border-b-2 border-white/10 py-3 text-lg focus:outline-none focus:border-red-600 transition-colors placeholder:text-white/10 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none" />
                    </div>
                </div>
                <div>
                    <label className="block text-[10px] font-bold text-white/70 uppercase tracking-[0.3em] mb-2">Notes</label>
                    <textarea value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Situation du client, urgence, particularités..." rows={3}
                        className="w-full bg-transparent border-b-2 border-white/10 py-3 text-base focus:outline-none focus:border-red-600 transition-colors placeholder:text-white/10 resize-none" />
                </div>

                {error && <div className="bg-red-600/10 border border-red-600/20 rounded-2xl px-4 py-3 text-sm text-red-400">{error}</div>}

                <button onClick={handleSubmit} disabled={!isValid || loading}
                    className="group w-full bg-red-600 hover:bg-red-700 disabled:opacity-30 disabled:cursor-not-allowed text-white py-4 rounded-full font-bold text-base flex items-center justify-center gap-3 transition-all shadow-xl shadow-red-600/20">
                    {loading ? <Loader2 size={20} className="animate-spin" /> : <>Déposer <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></>}
                </button>
            </div>
        </div>
    )
}

// ─── MODAL: Détail + actions ─────────────────────────────────────────────────
function ModalDeal({ deal, currentUserId, isAdmin, onClose, onTaken, onReleased, onCancelled, onRestored }) {
    const [loading, setLoading] = useState(false)
    const [releaseLoading, setReleaseLoading] = useState(false)
    const [cancelLoading, setCancelLoading] = useState(false)
    const [restoreLoading, setRestoreLoading] = useState(false)
    const [error, setError] = useState('')
    const [done, setDone] = useState(false)
    const [confirmCancel, setConfirmCancel] = useState(false)
    const [confirmRelease, setConfirmRelease] = useState(false)
    const [confirmRestore, setConfirmRestore] = useState(false)

    const isOwn = deal.created_by === currentUserId
    const isTaken = deal.status === 'taken'
    const isCancelled = deal.status === 'cancelled'
    const tookByMe = deal.taken_by === currentUserId

    // Admin peut tout annuler/rétablir; broker seulement ses propres dossiers
    const canCancel = !isCancelled && (isAdmin || isOwn)
    const canRestore = isCancelled && (isAdmin || isOwn)
    // Seul celui qui a pris peut libérer
    const canRelease = isTaken && tookByMe

    const handleTake = async () => {
        setLoading(true); setError('')
        try {
            const res = await fetch('/api/courtiers/take-deal', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ dealId: deal.id }),
            })
            const data = await res.json()
            if (!res.ok) { setError(data.error || 'Ce dossier a déjà été pris.'); setLoading(false); return }
            setDone(true)
            setTimeout(() => { onTaken(deal.id); onClose() }, 900)
        } catch { setError('Erreur réseau.'); setLoading(false) }
    }

    const handleRelease = async () => {
        setReleaseLoading(true); setError('')
        try {
            const res = await fetch('/api/courtiers/release-deal', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ dealId: deal.id }),
            })
            const data = await res.json()
            if (!res.ok) { setError(data.error || 'Impossible de libérer ce dossier.'); setReleaseLoading(false); return }
            onReleased(deal.id); onClose()
        } catch { setError('Erreur réseau.'); setReleaseLoading(false) }
    }

    const handleCancel = async () => {
        setCancelLoading(true); setError('')
        try {
            const res = await fetch('/api/courtiers/delete-deal', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ dealId: deal.id }),
            })
            const data = await res.json()
            if (!res.ok) { setError(data.error || 'Impossible d\'annuler ce dossier.'); setCancelLoading(false); return }
            onCancelled(deal.id); onClose()
        } catch { setError('Erreur réseau.'); setCancelLoading(false) }
    }

    const handleRestore = async () => {
        setRestoreLoading(true); setError('')
        try {
            const res = await fetch('/api/courtiers/restore-deal', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ dealId: deal.id }),
            })
            const data = await res.json()
            if (!res.ok) { setError(data.error || 'Impossible de rétablir ce dossier.'); setRestoreLoading(false); return }
            onRestored(deal.id); onClose()
        } catch { setError('Erreur réseau.'); setRestoreLoading(false) }
    }

    return (
        <div className="p-6 md:p-8">
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
                <div className="flex flex-wrap gap-2">
                    <Badge label={deal.type_demande} style={TYPE_STYLES[deal.type_demande]} />
                    <Badge label={`Dossier ${deal.dossier_type}`} style={DOSSIER_STYLES[deal.dossier_type]} />
                    <Badge label={STATUS_LABELS[deal.status] || deal.status} style={STATUS_STYLES[deal.status]} />
                    {isAdmin && <Badge label="Vue admin" style="bg-violet-500/10 text-violet-400 border-violet-500/20" />}
                </div>
                <button onClick={onClose} className="p-2 bg-white/5 rounded-full hover:bg-white/10 text-white/60 flex-shrink-0 ml-4"><X size={18} /></button>
            </div>

            {/* Infos */}
            <div className="space-y-4 mb-6">
                <div>
                    <p className="text-[10px] font-bold text-white/75 uppercase tracking-widest mb-1">Courtier qui propose</p>
                    <p className="text-xl font-semibold">{deal.broker_name}</p>
                </div>
                <div className="flex items-center gap-2 text-white/50">
                    <MapPin size={14} /> <span>{deal.ville}</span>
                </div>
                <div>
                    <p className="text-[10px] font-bold text-white/75 uppercase tracking-widest mb-1">Montant du prêt</p>
                    <p className={`text-3xl font-bold tabular-nums ${isCancelled ? 'opacity-40 line-through' : ''}`}>{fmt(deal.loan_amount)}</p>
                </div>
                {deal.notes && (
                    <div className="bg-white/[0.03] border border-white/[0.05] rounded-2xl px-4 py-4">
                        <p className="text-[10px] font-bold text-white/75 uppercase tracking-widest mb-2">Notes</p>
                        <p className="text-white/50 text-sm leading-relaxed">{deal.notes}</p>
                    </div>
                )}
                <div className="pt-2 border-t border-white/[0.06] text-xs text-white/70 space-y-1">
                    <p>Créé par <span className="text-white/60">{deal.creator?.name || deal.creator?.email?.split('@')[0]}</span> le {fmtDate(deal.created_at)}</p>
                    {isTaken && deal.taker && (
                        <p>Pris par <span className="text-white/60">{deal.taker?.name || deal.taker?.email?.split('@')[0]}</span></p>
                    )}
                </div>
            </div>

            {error && <div className="bg-red-600/10 border border-red-600/20 rounded-2xl px-4 py-3 text-sm text-red-400 mb-4">{error}</div>}

            {/* ── Actions ── */}
            <div className="space-y-3">

                {/* Prendre — tiers sur un dossier ouvert */}
                {!isTaken && !isOwn && !isCancelled && (
                    done
                        ? <div className="flex items-center justify-center gap-3 py-4 text-green-400 font-bold"><Check size={20} /> Dossier pris !</div>
                        : <button onClick={handleTake} disabled={loading}
                            className="group w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white py-4 rounded-full font-bold text-base flex items-center justify-center gap-3 transition-all shadow-xl shadow-red-600/20">
                            {loading ? <Loader2 size={20} className="animate-spin" /> : <>Prendre ce dossier <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></>}
                        </button>
                )}

                {/* Libérer — celui qui a pris uniquement */}
                {canRelease && (
                    confirmRelease ? (
                        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 space-y-3">
                            <p className="text-amber-400 text-sm font-semibold text-center">Confirmer la libération de ce dossier ?</p>
                            <p className="text-white/70 text-xs text-center">Le proposeur et tous les courtiers seront notifiés par courriel.</p>
                            <div className="flex gap-2">
                                <button onClick={() => setConfirmRelease(false)}
                                    className="flex-1 py-3 rounded-full border border-white/10 text-white/50 text-sm font-bold hover:bg-white/5 transition-all">
                                    Annuler
                                </button>
                                <button onClick={handleRelease} disabled={releaseLoading}
                                    className="flex-1 py-3 rounded-full bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white text-sm font-bold flex items-center justify-center gap-2 transition-all">
                                    {releaseLoading ? <Loader2 size={16} className="animate-spin" /> : <><RotateCcw size={15} /> Libérer</>}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button onClick={() => setConfirmRelease(true)}
                            className="w-full py-3.5 rounded-full border border-amber-500/30 text-amber-400 text-sm font-bold flex items-center justify-center gap-2 hover:bg-amber-500/10 transition-all">
                            <RotateCcw size={15} /> Libérer ce dossier
                        </button>
                    )
                )}

                {/* Annuler — créateur ou admin */}
                {canCancel && (
                    confirmCancel ? (
                        <div className="bg-red-600/10 border border-red-600/20 rounded-2xl p-4 space-y-3">
                            <p className="text-red-400 text-sm font-semibold text-center">
                                {isAdmin && !isOwn ? "Annuler ce dossier en tant qu'admin ?" : 'Annuler ce dossier ?'}
                            </p>
                            <p className="text-white/70 text-xs text-center">Le dossier sera masqué mais conservé en base de données.</p>
                            <div className="flex gap-2">
                                <button onClick={() => setConfirmCancel(false)}
                                    className="flex-1 py-3 rounded-full border border-white/10 text-white/50 text-sm font-bold hover:bg-white/5 transition-all">
                                    Retour
                                </button>
                                <button onClick={handleCancel} disabled={cancelLoading}
                                    className="flex-1 py-3 rounded-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-sm font-bold flex items-center justify-center gap-2 transition-all">
                                    {cancelLoading ? <Loader2 size={16} className="animate-spin" /> : (
                                        isAdmin && !isOwn
                                            ? <><ShieldAlert size={15} /> Annuler (admin)</>
                                            : <><Trash2 size={15} /> Annuler</>
                                    )}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button onClick={() => setConfirmCancel(true)}
                            className={`w-full py-3.5 rounded-full text-sm font-bold flex items-center justify-center gap-2 transition-all border ${isAdmin && !isOwn
                                ? 'border-violet-500/30 text-violet-400/70 hover:bg-violet-500/10 hover:text-violet-400 hover:border-violet-500/50'
                                : 'border-red-600/20 text-red-500/60 hover:bg-red-600/10 hover:text-red-400 hover:border-red-600/40'
                                }`}>
                            {isAdmin && !isOwn
                                ? <><ShieldAlert size={15} /> Annuler le dossier (admin)</>
                                : <><Trash2 size={15} /> Annuler ce dossier</>
                            }
                        </button>
                    )
                )}

                {/* Rétablir — créateur ou admin (dossier annulé uniquement) */}
                {canRestore && (
                    confirmRestore ? (
                        <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-4 space-y-3">
                            <p className="text-green-400 text-sm font-semibold text-center">
                                {isAdmin && !isOwn ? "Rétablir ce dossier en tant qu'admin ?" : 'Rétablir ce dossier ?'}
                            </p>
                            <p className="text-white/70 text-xs text-center">Le dossier redeviendra disponible pour tous les courtiers.</p>
                            <div className="flex gap-2">
                                <button onClick={() => setConfirmRestore(false)}
                                    className="flex-1 py-3 rounded-full border border-white/10 text-white/50 text-sm font-bold hover:bg-white/5 transition-all">
                                    Retour
                                </button>
                                <button onClick={handleRestore} disabled={restoreLoading}
                                    className="flex-1 py-3 rounded-full bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-sm font-bold flex items-center justify-center gap-2 transition-all">
                                    {restoreLoading ? <Loader2 size={16} className="animate-spin" /> : (
                                        isAdmin && !isOwn
                                            ? <><Check size={15} /> Rétablir (admin)</>
                                            : <><RotateCcw size={15} /> Rétablir</>
                                    )}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button onClick={() => setConfirmRestore(true)}
                            className={`w-full py-3.5 rounded-full text-sm font-bold flex items-center justify-center gap-2 transition-all border ${isAdmin && !isOwn
                                ? 'border-violet-500/30 text-violet-400/70 hover:bg-violet-500/10 hover:text-violet-400 hover:border-violet-500/50'
                                : 'border-green-500/30 text-green-400/70 hover:bg-green-500/10 hover:text-green-400 hover:border-green-500/50'
                                }`}>
                            <RotateCcw size={15} /> Rétablir ce dossier
                        </button>
                    )
                )}

                {/* Statuts informatifs */}
                {isOwn && !isCancelled && !canCancel && !canRestore && <p className="text-center text-white/20 text-xs">C'est votre dossier</p>}
                {isTaken && !isOwn && !tookByMe && !isAdmin && <p className="text-center text-white/50 text-sm py-3">Ce dossier a déjà été pris</p>}
                {isCancelled && !canRestore && <p className="text-center text-red-400/50 text-xs">Dossier annulé</p>}
            </div>
        </div>
    )
}

// ─── MAIN DASHBOARD ──────────────────────────────────────────────────────────
export default function DashboardClient({ initialDeals, currentUserId, currentUserName, currentUserRole }) {
    const router = useRouter()
    const supabase = createClient()
    const isAdmin = currentUserRole === 'admin'

    const [deals, setDeals] = useState(initialDeals)
    const [modalCreer, setModalCreer] = useState(false)
    const [selectedDeal, setSelectedDeal] = useState(null)
    const [tab, setTab] = useState('open')

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/courtiers/login')
    }

    const handleCreated = (newDeal) => {
        setDeals(prev => [{ ...newDeal, creator: { name: currentUserName } }, ...prev])
    }
    
    const handleTaken = (dealId) => {
        setDeals(prev => prev.map(d => d.id === dealId ? { ...d, status: 'taken', taken_by: currentUserId } : d))
    }
    
    const handleReleased = (dealId) => {
        setDeals(prev => prev.map(d => d.id === dealId ? { ...d, status: 'open', taken_by: null, taken_at: null } : d))
    }
    
    const handleCancelled = (dealId) => {
        // Pour admin ET brokers: on garde le deal dans la liste mais on change son statut
        // Le broker pourra toujours le voir dans "Mes dossiers" grâce au filtre mis à jour
        setDeals(prev => prev.map(d => d.id === dealId ? { ...d, status: 'cancelled' } : d))
    }

    const handleRestored = (dealId) => {
        setDeals(prev => prev.map(d => d.id === dealId ? { ...d, status: 'open', taken_by: null, taken_at: null } : d))
    }

    // ── Filtered lists ───────────────────────────────────────────────────────
    const openDeals = useMemo(() => deals.filter(d => d.status === 'open'), [deals])
    const takenDeals = useMemo(() => deals.filter(d => d.status === 'taken'), [deals])
    const cancelledDeals = useMemo(() => deals.filter(d => d.status === 'cancelled'), [deals])
    
    // Pour les brokers: leurs dossiers (créés, pris OU annulés par eux)
    // IMPORTANT: Un broker voit ses propres dossiers annulés, mais pas ceux des autres
    const myDeals = useMemo(() =>
        deals.filter(d => {
            const isMine = d.created_by === currentUserId || d.taken_by === currentUserId
            const isMyCancelled = d.status === 'cancelled' && d.created_by === currentUserId
            // Inclure les dossiers annulés seulement si c'est le broker qui l'a créé
            return isMine || isMyCancelled
        }), [deals, currentUserId])

    // Affichage selon le rôle et le tab
    const displayed = useMemo(() => {
        if (isAdmin) {
            switch (tab) {
                case 'open': return openDeals
                case 'taken': return takenDeals
                case 'cancelled': return cancelledDeals
                default: return openDeals
            }
        } else {
            // Broker
            switch (tab) {
                case 'open': return openDeals
                case 'mine': return myDeals
                default: return openDeals
            }
        }
    }, [isAdmin, tab, openDeals, takenDeals, cancelledDeals, myDeals])

    // ── Progress bar position ────────────────────────────────────────────────
    const getTabIndex = () => {
        if (isAdmin) {
            return { open: 0, taken: 1, cancelled: 2 }[tab] || 0
        } else {
            return { open: 0, mine: 1 }[tab] || 0
        }
    }
    const getTabCount = () => isAdmin ? 3 : 2
    const tabIndex = getTabIndex()
    const tabCount = getTabCount()
    const barWidth = `${((tabIndex + 1) / tabCount) * 100}%`

    return (
        <div className="min-h-screen bg-black text-white antialiased">

            {/* ── HEADER ── */}
            <header className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-xl border-b border-white/[0.06] h-16 flex items-center">
                <div className="max-w-4xl mx-auto px-5 w-full flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <img src="/logo.svg" alt="Logo" className="h-5 w-auto object-contain" />
                        {isAdmin && (
                            <span className="text-[10px] font-bold uppercase tracking-[0.25em] px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20">
                                Admin
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        <button onClick={() => setModalCreer(true)}
                            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-full font-bold text-sm transition-all shadow-lg shadow-red-600/20">
                            <Plus size={16} /> Nouveau
                        </button>
                        <button onClick={handleLogout} className="p-2 text-white/75 hover:text-white/60 transition-colors hover:bg-white/5 rounded-full">
                            <LogOut size={16} />
                        </button>
                    </div>
                </div>

                {/* Progress bar */}
                <div className="absolute bottom-0 left-0 w-full h-[2px] bg-white/5">
                    <motion.div className="h-full bg-red-600" animate={{ width: barWidth }}
                        transition={{ duration: 0.3 }} style={{ boxShadow: '0 0 12px rgba(220,38,38,0.8)' }} />
                </div>
            </header>

            {/* ── CONTENT ── */}
            <main className="pt-20 pb-24 max-w-4xl mx-auto px-4 md:px-5">

                {/* ── Tabs selon le rôle ── */}
                <div className="flex items-center gap-2 mt-6 mb-6 overflow-x-auto pb-1">
                    {isAdmin ? (
                        // TABS ADMIN: Disponibles | Pris | Annulés
                        <>
                            <button onClick={() => setTab('open')}
                                className={`flex-shrink-0 px-5 py-2.5 rounded-full text-sm font-bold transition-all ${tab === 'open' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'text-white/70 hover:text-white/60'}`}>
                                Disponibles
                                <span className={`ml-2 text-xs font-bold ${tab === 'open' ? 'text-green-400' : 'text-white/20'}`}>{openDeals.length}</span>
                            </button>
                            <button onClick={() => setTab('taken')}
                                className={`flex-shrink-0 px-5 py-2.5 rounded-full text-sm font-bold transition-all ${tab === 'taken' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'text-white/70 hover:text-white/60'}`}>
                                Pris
                                <span className={`ml-2 text-xs font-bold ${tab === 'taken' ? 'text-amber-400' : 'text-white/20'}`}>{takenDeals.length}</span>
                            </button>
                            <button onClick={() => setTab('cancelled')}
                                className={`flex-shrink-0 px-5 py-2.5 rounded-full text-sm font-bold transition-all ${tab === 'cancelled' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'text-white/70 hover:text-white/60'}`}>
                                Annulés
                                <span className={`ml-2 text-xs font-bold ${tab === 'cancelled' ? 'text-red-400' : 'text-white/20'}`}>{cancelledDeals.length}</span>
                            </button>
                        </>
                    ) : (
                        // TABS BROKER: Disponibles | Mes dossiers
                        <>
                            <button onClick={() => setTab('open')}
                                className={`flex-shrink-0 px-5 py-2.5 rounded-full text-sm font-bold transition-all ${tab === 'open' ? 'bg-white/10 text-white border border-white/10' : 'text-white/70 hover:text-white/60'}`}>
                                Disponibles
                                <span className={`ml-2 text-xs font-bold ${tab === 'open' ? 'text-red-500' : 'text-white/20'}`}>{openDeals.length}</span>
                            </button>
                            <button onClick={() => setTab('mine')}
                                className={`flex-shrink-0 px-5 py-2.5 rounded-full text-sm font-bold transition-all ${tab === 'mine' ? 'bg-white/10 text-white border border-white/10' : 'text-white/70 hover:text-white/60'}`}>
                                Mes dossiers
                                <span className={`ml-2 text-xs font-bold ${tab === 'mine' ? 'text-red-500' : 'text-white/20'}`}>{myDeals.length}</span>
                            </button>
                        </>
                    )}
                </div>

                {/* ── Liste ── */}
                <AnimatePresence mode="wait">
                    {displayed.length === 0 ? (
                        <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            className="text-center py-24 border border-white/[0.06] rounded-3xl text-white/70">
                            <p className="text-4xl mb-3">📭</p>
                            <p className="text-base font-medium">
                                {isAdmin 
                                    ? tab === 'open' ? 'Aucun dossier disponible'
                                        : tab === 'taken' ? 'Aucun dossier pris'
                                        : 'Aucun dossier annulé'
                                    : tab === 'open' ? 'Aucun dossier disponible'
                                        : "Aucun dossier pour l'instant"
                                }
                            </p>
                        </motion.div>
                    ) : (
                        <motion.div key={`${tab}-${isAdmin}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                            {displayed.map((deal, i) => {
                                const isOwn = deal.created_by === currentUserId
                                const isTaken = deal.status === 'taken'
                                const isCancelled = deal.status === 'cancelled'
                                const isMyCancelled = isCancelled && deal.created_by === currentUserId
                                
                                return (
                                    <motion.div key={deal.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.03 }}
                                        onClick={() => setSelectedDeal(deal)}
                                        className={`border rounded-2xl md:rounded-3xl p-5 cursor-pointer transition-all active:scale-[0.99] ${isCancelled
                                            ? 'bg-white/[0.01] border-white/[0.04] opacity-50 hover:opacity-70'
                                            : 'bg-white/[0.03] border-white/[0.07] hover:border-white/20 hover:bg-white/[0.05]'
                                            }`}>

                                        {/* Top row */}
                                        <div className="flex items-start justify-between gap-4 mb-3">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex flex-wrap gap-2 mb-2.5">
                                                    <Badge label={deal.type_demande} style={TYPE_STYLES[deal.type_demande]} />
                                                    <Badge label={`Dossier ${deal.dossier_type}`} style={DOSSIER_STYLES[deal.dossier_type]} />
                                                    <div className="flex items-center gap-2">
                                                        <div className={`w-2.5 h-2.5 rounded-full ${isCancelled ? 'bg-red-500/40' : isTaken ? 'bg-orange-400' : 'bg-green-500'}`} />
                                                        <span className={`text-xs font-semibold ${isCancelled ? 'text-red-400/50' : isTaken ? 'text-orange-300' : 'text-green-400'}`}>
                                                            {isCancelled ? 'Annulé' : isTaken ? 'Pris' : 'Disponible'}
                                                        </span>
                                                    </div>
                                                    {isMyCancelled && (
                                                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
                                                            À rétablir
                                                        </span>
                                                    )}
                                                </div>
                                                <p className={`font-semibold text-lg leading-snug ${isCancelled ? 'text-white/70 line-through' : 'text-white'}`}>
                                                    {deal.broker_name}
                                                </p>
                                                <p className="text-white/70 text-sm mt-0.5 flex items-center gap-1.5"><MapPin size={12} />{deal.ville}</p>
                                            </div>
                                            <div className="text-right flex-shrink-0">
                                                <p className={`text-2xl font-bold tabular-nums ${isCancelled ? 'text-white/85 line-through' : ''}`}>
                                                    {fmt(deal.loan_amount)}
                                                </p>
                                                <p className="text-white/85 text-xs mt-0.5">montant du prêt</p>
                                            </div>
                                        </div>

                                        {/* Notes preview */}
                                        {deal.notes && (
                                            <p className="text-white/70 text-sm line-clamp-1 bg-white/[0.02] rounded-xl px-3 py-2 mb-3 border border-white/[0.04]">
                                                {deal.notes}
                                            </p>
                                        )}

                                        {/* Footer */}
                                        <div className="flex items-center justify-between pt-2 border-t border-white/[0.05]">
                                            <p className="text-white/85 text-xs">
                                                {deal.creator?.name || deal.creator?.email?.split('@')[0] || '—'}
                                                <span className="mx-1.5 text-white/10">·</span>
                                                {fmtDate(deal.created_at)}
                                            </p>
                                            {!isTaken && !isCancelled && !isOwn && !isAdmin && (
                                                <span className="text-red-500 text-xs font-bold flex items-center gap-1">
                                                    Prendre <ArrowRight size={12} />
                                                </span>
                                            )}
                                            {isOwn && !isCancelled && <span className="text-white/75 text-xs">Votre dossier</span>}
                                            {isMyCancelled && <span className="text-red-400/70 text-xs font-medium">Cliquez pour rétablir</span>}
                                            {isCancelled && isAdmin && <span className="text-red-400/40 text-xs">Annulé</span>}
                                            {isTaken && isAdmin && deal.taker && (
                                                <span className="text-amber-400/60 text-xs">
                                                    Pris par {deal.taker?.name || deal.taker?.email?.split('@')[0]}
                                                </span>
                                            )}
                                        </div>
                                    </motion.div>
                                )
                            })}
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            {/* ── FAB mobile ── */}
            <button onClick={() => setModalCreer(true)}
                className="md:hidden fixed bottom-6 right-5 z-40 w-14 h-14 bg-red-600 rounded-full flex items-center justify-center shadow-2xl shadow-red-600/40 active:scale-95 transition-transform">
                <Plus size={24} />
            </button>

            {/* ── MODALS ── */}
            <AnimatePresence>
                {modalCreer && (
                    <Modal key="creer" onClose={() => setModalCreer(false)}>
                        <ModalCreer
                            onClose={() => setModalCreer(false)}
                            onCreated={handleCreated}
                            defaultName={currentUserName}
                            userId={currentUserId}
                        />
                    </Modal>
                )}
                {selectedDeal && (
                    <Modal key="deal" onClose={() => setSelectedDeal(null)}>
                        <ModalDeal
                            deal={selectedDeal}
                            currentUserId={currentUserId}
                            isAdmin={isAdmin}
                            onClose={() => setSelectedDeal(null)}
                            onTaken={handleTaken}
                            onReleased={handleReleased}
                            onCancelled={handleCancelled}
                            onRestored={handleRestored}
                        />
                    </Modal>
                )}
            </AnimatePresence>
        </div>
    )
}