import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  BarChart3,
  CalendarDays,
  CheckCircle2,
  Egg,
  HeartPulse,
  Home,
  Leaf,
  RotateCcw,
  Save,
  Users,
} from "lucide-react";

import { PageHeader, DatePill } from "../../components/ui/PageHeader";
import { Card, CardHeader } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { TextField, SelectField } from "../../components/ui/Field";
import { EmptyState, ErrorState } from "../../components/ui/States";
import { InputHarianSkeleton } from "../../components/skeletons/PageSkeletons";
import { ConfirmDialog } from "../../components/ui/Modal";
import { toast } from "../../components/ui/toast";
import { useActivePeriode } from "../../hooks/usePeriode";
import { useInputHarian } from "../../features/input-harian/useInputHarian";
import {
  avgEggWeight,
  fcr as calcFcr,
  henDay as calcHenDay,
  umurMinggu,
} from "../../features/analytics/compute";
import {
  formatInt,
  formatNumber,
  formatPercent,
  toApiDate,
} from "../../utils/format";
import { ROUTES } from "../../routes/routePaths";

const GRADES = [
  { key: "krem", label: "KREM", color: "bg-grade-krem" },
  { key: "bagus", label: "BAGUS", color: "bg-grade-bagus" },
  { key: "retak", label: "RETAK", color: "bg-grade-retak" },
];

const emptyGrade = () => ({ butir: "", beratKg: "" });

const jamOf = (v) => {
  const d = v ? new Date(v) : null;
  return d && !Number.isNaN(d.getTime())
    ? d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
    : null;
};

function SummaryRow({ label, value, unit, strong }) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-1.5 text-sm">
      <span className="text-muted">{label}</span>
      <span className={strong ? "font-bold text-ink" : "font-semibold text-ink"}>
        {value}
        {unit ? (
          <span className="ml-1 text-xs font-normal text-faint">{unit}</span>
        ) : null}
      </span>
    </div>
  );
}

function ContextItem({ icon: Icon, label, children }) {
  return (
    <div className="flex items-center gap-3">
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">
        <Icon className="size-5" />
      </span>
      <div className="min-w-0">
        <div className="text-[11px] font-medium uppercase tracking-wide text-faint">
          {label}
        </div>
        <div className="truncate text-sm font-semibold text-ink">{children}</div>
      </div>
    </div>
  );
}

/** Ringkasan entri yang sudah diinput hari ini untuk satu section — bukan
 * pengunci, sekadar pengingat supaya operator tahu apa yang sudah tercatat
 * sebelum menambah entri baru (bisa lebih dari satu kali per hari). */
function TodayLog({ entries, renderItem, totalLabel }) {
  if (!entries.length) return null;
  return (
    <div className="mt-4 rounded-xl bg-canvas p-3.5">
      <div className="flex items-center gap-2 text-xs font-semibold text-muted">
        <CheckCircle2 className="size-3.5 text-brand-500" />
        Sudah diinput hari ini ({entries.length}x{totalLabel ? ` · ${totalLabel}` : ""})
      </div>
      <ul className="mt-2 space-y-1 text-[13px] text-ink/90">
        {entries.map((r, i) => (
          <li key={r.id ?? i} className="flex items-baseline justify-between gap-3">
            <span>{renderItem(r)}</span>
            {jamOf(r.created_at) ? (
              <span className="shrink-0 text-xs text-faint">{jamOf(r.created_at)}</span>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function InputHarianPage() {
  const { activePeriode, isLoading: periodeLoading, isError, refetch } =
    useActivePeriode();
  const daily = useInputHarian(activePeriode);

  const [tanggal, setTanggal] = useState(toApiDate(new Date()));
  const [totalKg, setTotalKg] = useState("");
  const [pakanId, setPakanId] = useState("");
  const [mati, setMati] = useState("");
  const [afkir, setAfkir] = useState("");
  const [grades, setGrades] = useState({
    krem: emptyGrade(),
    bagus: emptyGrade(),
    retak: emptyGrade(),
  });
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const population = Number(activePeriode?.populasi_aktif) || 0;

  const summary = useMemo(() => {
    const totalMati = (Number(mati) || 0) + (Number(afkir) || 0);
    // Populasi efektif = populasi aktif dikurangi kematian yang baru diinput
    // hari ini (belum tersimpan), supaya pakan/ekor mencerminkan populasi
    // setelah mortalitas — sesuai urutan input (mortalitas dulu, baru pakan).
    const effectivePopulation = Math.max(0, population - totalMati);

    const totalPakanKg = Number(totalKg) || 0;
    const gramPerEkor =
      effectivePopulation > 0 ? (totalPakanKg * 1000) / effectivePopulation : 0;

    const perGrade = GRADES.map(({ key }) => {
      const butir = Number(grades[key].butir) || 0;
      const beratKg = Number(grades[key].beratKg) || 0;
      const avg = butir > 0 ? (beratKg * 1000) / butir : 0;
      return { key, butir, beratKg, avg };
    });

    const totalTelur = perGrade.reduce((t, x) => t + x.butir, 0);
    const totalBeratKg = perGrade.reduce((t, x) => t + x.beratKg, 0);
    const avgW = avgEggWeight(totalBeratKg * 1000, totalTelur);
    const hd = calcHenDay(totalTelur, effectivePopulation);

    return {
      perGrade,
      totalPakanKg,
      gramPerEkor,
      totalTelur,
      totalBeratKg,
      avgW,
      henDay: hd,
      fcr: calcFcr(totalPakanKg, totalTelur, avgW),
      totalMati,
      effectivePopulation,
    };
  }, [totalKg, population, grades, mati, afkir]);

  const header = (
    <PageHeader
      title="Input Data Harian"
      description="Masukkan data harian kandang. Setiap bagian bisa diisi lebih dari sekali dalam sehari."
      breadcrumb={
        <>
          <Link to={ROUTES.dashboard} className="hover:text-brand-600">
            Dashboard
          </Link>{" "}
          / <span className="text-muted">Input Harian</span>
        </>
      }
      aside={<DatePill />}
    />
  );

  if (periodeLoading || daily.isLoading) {
    return (
      <div className="space-y-6">
        {header}
        <InputHarianSkeleton />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-6">
        {header}
        <Card>
          <ErrorState error="Gagal memuat data." onRetry={refetch} />
        </Card>
      </div>
    );
  }

  if (!activePeriode) {
    return (
      <div className="space-y-6">
        {header}
        <Card>
          <EmptyState
            icon={CalendarDays}
            title="Belum ada periode aktif"
            description="Mulai periode baru dari halaman Dashboard sebelum menginput data harian."
            action={
              <Button as={Link} to={ROUTES.dashboard}>
                Ke Dashboard
              </Button>
            }
          />
        </Card>
      </div>
    );
  }

  const st = daily.state;
  const week = umurMinggu(activePeriode);

  const resetForm = () => {
    setTotalKg("");
    setPakanId("");
    setMati("");
    setAfkir("");
    setGrades({ krem: emptyGrade(), bagus: emptyGrade(), retak: emptyGrade() });
  };

  const validate = () => {
    const hasFeed = Number(totalKg) > 0;
    const hasMort = summary.totalMati > 0;
    const hasEgg = summary.perGrade.some((g) => g.butir > 0);

    if (!hasFeed && !hasMort && !hasEgg) {
      toast.warning("Isi minimal satu bagian sebelum menyimpan.");
      return false;
    }
    if (hasFeed && !pakanId) {
      toast.warning("Pilih jenis pakan terlebih dahulu.");
      return false;
    }
    if (hasEgg) {
      const bad = summary.perGrade.find((g) => g.butir > 0 && g.beratKg <= 0);
      if (bad) {
        toast.warning(`Isi berat total untuk telur ${bad.key}.`);
        return false;
      }
      if (summary.totalTelur > population) {
        toast.warning("Total telur melebihi populasi hidup.");
        return false;
      }
    }
    return true;
  };

  const doSubmit = async () => {
    setSubmitting(true);
    const results = await daily.submitAll({
      tanggal,
      mortalitas: { mati: Number(mati) || 0, afkir: Number(afkir) || 0 },
      feed: { totalKg: Number(totalKg), pakanId },
      produksi: {
        bagus: grades.bagus.butir,
        krem: grades.krem.butir,
        retak: grades.retak.butir,
        beratBagusKg: grades.bagus.beratKg,
        beratKremKg: grades.krem.beratKg,
        beratRetakKg: grades.retak.beratKg,
      },
    });
    setSubmitting(false);
    setConfirmOpen(false);

    const ok = results.filter((r) => r.ok);
    const failed = results.filter((r) => !r.ok);
    if (ok.length) toast.success(`${ok.map((r) => r.section).join(", ")} berhasil disimpan.`);
    failed.forEach((r) => toast.error(`${r.section}: ${r.message}`));
    if (ok.length && !failed.length) resetForm();
  };

  return (
    <div className="space-y-6">
      {header}

      {/* Context bar */}
      <Card className="grid gap-5 p-5 sm:grid-cols-2 xl:grid-cols-4">
        <ContextItem icon={Home} label="Kandang">
          <span className="flex flex-wrap items-center gap-1.5">
            {activePeriode.kandang}
            <Badge tone="neutral">Strain: {activePeriode.strain}</Badge>
          </span>
        </ContextItem>
        <div>
          <div className="mb-1 text-[11px] font-medium uppercase tracking-wide text-faint">
            Tanggal Input
          </div>
          <input
            type="date"
            value={tanggal}
            max={toApiDate(new Date())}
            onChange={(e) => setTanggal(e.target.value)}
            className="field-input"
          />
        </div>
        <ContextItem icon={CalendarDays} label="Umur Ayam">
          {week} Minggu
        </ContextItem>
        <ContextItem icon={Users} label="Populasi Hidup">
          {formatInt(population)} ekor
        </ContextItem>
      </Card>

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-2">
          {/* Mortality + Feed */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="p-5">
              <CardHeader
                icon={HeartPulse}
                title="1. Data Mortalitas"
                subtitle="Jumlah ayam yang mati atau afkir hari ini."
              />
              <div className="mt-4 grid grid-cols-2 gap-3">
                <TextField
                  label="Ayam Mati"
                  type="number"
                  inputMode="numeric"
                  min="0"
                  suffix="ekor"
                  placeholder="0"
                  value={mati}
                  onChange={(e) => setMati(e.target.value)}
                />
                <TextField
                  label="Ayam Afkir"
                  type="number"
                  inputMode="numeric"
                  min="0"
                  suffix="ekor"
                  placeholder="0"
                  value={afkir}
                  onChange={(e) => setAfkir(e.target.value)}
                  hint="Opsional. Ikut mengurangi populasi."
                />
              </div>
              <TodayLog
                entries={st.mortalitas.todayEntries}
                totalLabel={`total ${formatInt(st.mortalitas.todayTotal)} ekor`}
                renderItem={(r) => (
                  <>
                    {formatInt(r.jumlah)} ekor
                    {r.penyebab ? ` · ${r.penyebab}` : ""}
                  </>
                )}
              />
            </Card>

            <Card className="p-5">
              <CardHeader
                icon={Leaf}
                title="2. Data Pakan"
                subtitle="Total pakan yang diberikan hari ini untuk seluruh populasi."
              />
              <div className="mt-4 space-y-3">
                <SelectField
                  label="Jenis Pakan"
                  placeholder="Pilih jenis pakan"
                  value={pakanId}
                  onChange={(e) => setPakanId(e.target.value)}
                >
                  {st.pakanOptions.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nama}
                    </option>
                  ))}
                </SelectField>
                <TextField
                  label="Total Pakan"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.1"
                  suffix="kg"
                  placeholder="0"
                  value={totalKg}
                  onChange={(e) => setTotalKg(e.target.value)}
                  hint={
                    summary.gramPerEkor > 0
                      ? `Setara ${formatInt(summary.gramPerEkor)} gram/ekor dari populasi ${formatInt(summary.effectivePopulation)} ekor.`
                      : "Gram/ekor dihitung otomatis dari total pakan dibagi populasi."
                  }
                />
              </div>
              <TodayLog
                entries={st.feed.todayEntries}
                totalLabel={`total ${formatNumber(st.feed.todayTotalKg)} kg`}
                renderItem={(r) => (
                  <>
                    {formatNumber(r.total_kg)} kg · {r.pakan} · ≈
                    {formatInt(r.gram_per_ekor)} g/ekor
                  </>
                )}
              />
            </Card>
          </div>

          {/* Egg grades */}
          <Card className="p-5">
            <CardHeader
              icon={Egg}
              title="3. Produksi Telur per Grade"
              subtitle="Masukkan jumlah butir dan berat total untuk setiap grade telur."
            />
            <div className="mt-4 scrollbar-slim overflow-x-auto">
              <table className="w-full min-w-140 text-sm">
                <thead>
                  <tr className="text-left text-xs font-semibold uppercase tracking-wide text-faint">
                    <th className="pb-3 pr-3">Grade Telur</th>
                    <th className="pb-3 px-3">Jumlah Butir</th>
                    <th className="pb-3 px-3">Berat Total (kg)</th>
                    <th className="pb-3 pl-3">Berat Rata-rata</th>
                  </tr>
                </thead>
                <tbody>
                  {GRADES.map((g) => {
                    const row = summary.perGrade.find((x) => x.key === g.key);
                    return (
                      <tr key={g.key} className="border-t border-line">
                        <td className="py-3 pr-3">
                          <span className="flex items-center gap-2 font-medium text-ink">
                            <span
                              className={`size-2.5 rounded-full ${g.color}`}
                            />
                            {g.label}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <input
                            type="number"
                            min="0"
                            inputMode="numeric"
                            placeholder="0"
                            className="field-input"
                            value={grades[g.key].butir}
                            onChange={(e) =>
                              setGrades((s) => ({
                                ...s,
                                [g.key]: { ...s[g.key], butir: e.target.value },
                              }))
                            }
                          />
                        </td>
                        <td className="py-3 px-3">
                          <input
                            type="number"
                            min="0"
                            step="0.1"
                            inputMode="decimal"
                            placeholder="0.0"
                            className="field-input"
                            value={grades[g.key].beratKg}
                            onChange={(e) =>
                              setGrades((s) => ({
                                ...s,
                                [g.key]: {
                                  ...s[g.key],
                                  beratKg: e.target.value,
                                },
                              }))
                            }
                          />
                        </td>
                        <td className="py-3 pl-3 font-semibold text-ink">
                          {row.avg > 0 ? `${formatNumber(row.avg, 1)} g` : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <TodayLog
              entries={st.produksi.todayEntries}
              totalLabel={`total ${formatInt(st.produksi.todayTotals.eggs)} butir`}
              renderItem={(r) => (
                <>
                  Bagus {formatInt(r.telur_bagus)} · Krem {formatInt(r.telur_krem)} ·
                  Retak {formatInt(r.telur_retak)} · {formatNumber(r.berat_total / 1000)} kg
                </>
              )}
            />
          </Card>
        </div>

        {/* Summary rail */}
        <div>
          <Card className="sticky top-6 p-5">
            <CardHeader
              icon={BarChart3}
              title="Ringkasan Entri Ini"
              subtitle="Hasil dihitung dari input di samping (belum termasuk entri sebelumnya hari ini)."
            />
            <div className="mt-4 divide-y divide-line">
              <div className="pb-2">
                <SummaryRow
                  label="Total Populasi"
                  value={formatInt(population)}
                  unit="ekor"
                />
                <SummaryRow
                  label="Total Pakan"
                  value={formatNumber(summary.totalPakanKg)}
                  unit="kg"
                />
                <SummaryRow
                  label="Rata-rata Pakan/Ekor"
                  value={formatInt(summary.gramPerEkor)}
                  unit="gram"
                />
              </div>
              <div className="py-2">
                <SummaryRow
                  label="Total Telur"
                  value={formatInt(summary.totalTelur)}
                  unit="butir"
                />
                <SummaryRow
                  label="Total Berat Telur"
                  value={formatNumber(summary.totalBeratKg)}
                  unit="kg"
                />
                <SummaryRow
                  label="Berat Rata-rata Telur"
                  value={formatNumber(summary.avgW, 1)}
                  unit="g/butir"
                />
              </div>
              <div className="pt-2">
                <SummaryRow
                  label="Hen Day (HD)"
                  value={formatPercent(summary.henDay)}
                  strong
                />
                <SummaryRow
                  label="Feed Conversion (FCR)"
                  value={formatNumber(summary.fcr, 2)}
                  strong
                />
              </div>
            </div>

            <div className="mt-4 flex items-center gap-3 rounded-xl bg-brand-50 px-3.5 py-3 text-sm text-brand-700">
              <CheckCircle2 className="size-5 shrink-0" />
              <div>
                <div className="font-semibold">Data siap disimpan</div>
                <div className="text-xs text-brand-700/80">
                  Bisa menambah entri lagi kapan saja hari ini.
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Footer actions */}
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="outline" icon={RotateCcw} onClick={resetForm}>
          Reset
        </Button>
        <Button icon={Save} onClick={() => validate() && setConfirmOpen(true)}>
          Simpan Data
        </Button>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={doSubmit}
        loading={submitting}
        title="Simpan entri ini?"
        description="Entri akan ditambahkan sebagai data baru dan tidak bisa diubah setelah disimpan. Pastikan nilai yang diisi sudah benar."
        confirmLabel="Ya, Simpan"
      />
    </div>
  );
}
