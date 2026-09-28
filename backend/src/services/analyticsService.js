import AnalyticsModel from "../models/analyticsModel.js";
import PeriodeModel from "../models/periodeModel.js";

class AnalyticsService {
  // ==========================
  // ANALYTICS PER PERIODE
  // ==========================

  static async getAnalytics(periodeId) {
    // Cek periode
    const periode = await PeriodeModel.findById(periodeId);

    if (!periode) {
      const err = new Error("Periode tidak ditemukan.");
      err.statusCode = 404;
      throw err;
    }

    const [produksi, feed, mortalitas, hdData, populasi] = await Promise.all([
      AnalyticsModel.getProduksi7Hari(periodeId),
      AnalyticsModel.getFeed7Hari(periodeId),
      AnalyticsModel.getMortalitas7Hari(periodeId),
      AnalyticsModel.getHD7Hari(periodeId),
      AnalyticsModel.getPopulasiAktif(periodeId),
    ]);

    const populasiAktif = Number(populasi.populasi_aktif);

    // ==========================
    // HITUNG HD %
    // ==========================

    const hd = hdData.map((item) => {
      const total =
        Number(item.telur_bagus) +
        Number(item.telur_krem) +
        Number(item.telur_retak);

      return {
        tanggal: item.tanggal,
        hd:
          populasiAktif > 0
            ? Number(((total / populasiAktif) * 100).toFixed(2))
            : 0,
      };
    });

    return {
      periode: {
        id: periode.id,
        kode_periode: periode.kode_periode,
      },

      produksi,

      feed,

      mortalitas,

      hd,
    };
  }
}

export default AnalyticsService;