import ReportModel from "../models/reportModel.js";

class ReportService {
  // ==========================
  // REPORT PER PERIODE
  // ==========================

  static async getReport(periodeId) {
    const periode = await ReportModel.getById(periodeId);

    if (!periode) {
      const err = new Error("Periode tidak ditemukan.");
      err.statusCode = 404;
      throw err;
    }

    const [
      totalMortalitas,
      totalPakan,
      totalProduksi,
      totalBeratTelur,
      totalVaksinasi,
      umurAyam,
      lamaPeriode,
    ] = await Promise.all([
      ReportModel.getTotalMortalitas(periodeId),
      ReportModel.getTotalPakan(periodeId),
      ReportModel.getTotalProduksi(periodeId),
      ReportModel.getTotalBeratTelur(periodeId),
      ReportModel.getTotalVaksinasi(periodeId),
      ReportModel.getUmurAyam(periodeId),
      ReportModel.getLamaPeriode(periodeId),
    ]);

    const populasiAwal = Number(periode.jumlah_awal);
    const populasiAktif = Number(periode.populasi_aktif);

    // ==========================
    // PERSENTASE MORTALITAS
    // ==========================

    const persentaseMortalitas =
      populasiAwal > 0
        ? Number(((totalMortalitas / populasiAwal) * 100).toFixed(2))
        : 0;

    // ==========================
    // RATA-RATA PAKAN / HARI
    // ==========================

    const rataPakanPerHari =
      lamaPeriode > 0 ? Number((totalPakan / lamaPeriode).toFixed(2)) : 0;

    // ==========================
    // HEN DAY (%)
    // ==========================

    const henDay =
      populasiAktif > 0
        ? Number(((totalProduksi / populasiAktif) * 100).toFixed(2))
        : 0;

    // ==========================
    // FCR
    // ==========================

    const fcr =
      totalBeratTelur > 0
        ? Number((totalPakan / totalBeratTelur).toFixed(2))
        : 0;

    return {
      periode: {
        id: periode.id,
        kode_periode: periode.kode_periode,
        kandang: periode.kandang,
        strain: periode.strain,
        tanggal_masuk: periode.tanggal_masuk,
        tanggal_selesai: periode.tanggal_selesai,
      },

      ringkasan: {
        umur_hari: umurAyam,
        lama_periode: lamaPeriode,
      },

      populasi: {
        awal: populasiAwal,
        aktif: populasiAktif,
        mati: totalMortalitas,
        persentase_mortalitas: persentaseMortalitas,
      },

      pakan: {
        total_kg: totalPakan,
        rata_per_hari: rataPakanPerHari,
      },

      produksi: {
        total_telur: totalProduksi,
        total_berat_telur_kg: totalBeratTelur,
        hen_day: henDay,
      },

      vaksinasi: {
        total: totalVaksinasi,
      },

      fcr,
    };
  }
}

export default ReportService;
