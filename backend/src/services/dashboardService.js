import DashboardModel from "../models/dashboardModel.js";

class DashboardService {
  // ==========================
  // GET ACTIVE PERIODE (HELPER)
  // PERBAIKAN: terima dan teruskan parameter user ke DashboardModel
  // ==========================
  static async getActivePeriode(user) {
    const periode = await DashboardModel.getActivePeriode(user);

    if (!periode) {
      const err = new Error("Belum ada periode aktif.");
      err.statusCode = 404;
      throw err;
    }

    return periode;
  }

  // ==========================
  // GET STATUS (HELPER)
  // Normal/Under/Over dengan toleransi ±3%
  // ==========================
  static getStatus(aktual, standar) {
    if (standar == null) return "Normal";

    const tolerance = standar * 0.03;

    if (aktual < standar - tolerance) return "Under";
    if (aktual > standar + tolerance) return "Over";

    return "Normal";
  }

  // ==========================
  // GET DASHBOARD
  // PERBAIKAN: teruskan user ke getActivePeriode
  // ==========================
  static async getDashboard(user) {
    const periode = await this.getActivePeriode(user);

    const [
      feedHariIni,
      produksiHariIni,
      totalMortalitas,
      umurAyam,
      vaksinTerakhir,
    ] = await Promise.all([
      DashboardModel.getFeedHariIni(periode.id),
      DashboardModel.getProduksiHariIni(periode.id),
      DashboardModel.getTotalMortalitas(periode.id),
      DashboardModel.getUmurAyam(periode.id),
      DashboardModel.getLastVaksin(periode.id),
    ]);

    const standarHariIni = await DashboardModel.getStandarHariIni(
      periode.strain_id,
      umurAyam.umur_minggu,
    );

    if (!standarHariIni) {
      const err = new Error(
        `Standar strain belum tersedia untuk umur ${umurAyam.umur_minggu} minggu.`,
      );
      err.statusCode = 404;
      throw err;
    }

    // Hen Day Production = (total telur hari ini / populasi aktif) × 100
    const henDay =
      periode.populasi_aktif > 0
        ? Number(
            (
              (produksiHariIni.telur_total / periode.populasi_aktif) *
              100
            ).toFixed(2),
          )
        : 0;

    // Rata-rata berat telur hari ini
    const avgEggWeight =
      produksiHariIni.telur_total > 0
        ? Number(
            (produksiHariIni.berat_total / produksiHariIni.telur_total).toFixed(
              2,
            ),
          )
        : 0;

    return {
      periode: {
        id: periode.id,
        kode_periode: periode.kode_periode,
        kandang: periode.kandang,
        strain: periode.strain,
        tanggal_masuk: periode.tanggal_masuk,
        populasi_aktif: periode.populasi_aktif,
        umur_minggu: umurAyam.umur_minggu,
      },

      feed: {
        gram_per_ekor: feedHariIni.gram_per_ekor,
        total_kg: feedHariIni.total_kg,
        standar: standarHariIni.feed_gram,
        status: this.getStatus(
          feedHariIni.gram_per_ekor,
          standarHariIni.feed_gram,
        ),
      },

      produksi: {
        telur_total: produksiHariIni.telur_total,
        hen_day: henDay,
        standar: standarHariIni.produksi_persen,
        status: this.getStatus(henDay, standarHariIni.produksi_persen),
      },

      berat_telur: {
        rata_rata: avgEggWeight,
        standar: standarHariIni.berat_telur,
        status: this.getStatus(avgEggWeight, standarHariIni.berat_telur),
      },

      mortalitas: {
        total: totalMortalitas,
      },

      vaksin_terakhir: vaksinTerakhir,
    };
  }

  // ==========================
  // GET PRODUKSI MINGGUAN
  // PERBAIKAN: teruskan user
  // ==========================
  static async getProduksiMingguan(user) {
    const periode = await this.getActivePeriode(user);
    return await DashboardModel.getProduksiMingguan(periode.id);
  }

  // ==========================
  // GET PAKAN MINGGUAN
  // PERBAIKAN: teruskan user
  // ==========================
  static async getPakanMingguan(user) {
    const periode = await this.getActivePeriode(user);
    return await DashboardModel.getPakanMingguan(periode.id);
  }

  // ==========================
  // GET MORTALITAS MINGGUAN
  // PERBAIKAN: teruskan user
  // ==========================
  static async getMortalitasMingguan(user) {
    const periode = await this.getActivePeriode(user);
    return await DashboardModel.getMortalitasMingguan(periode.id);
  }

  // ==========================
  // GET UMUR AYAM
  // PERBAIKAN: teruskan user
  // ==========================
  static async getUmurAyam(user) {
    const periode = await this.getActivePeriode(user);
    return await DashboardModel.getUmurAyam(periode.id);
  }

  // ==========================
  // GET VAKSIN TERAKHIR
  // PERBAIKAN: teruskan user
  // ==========================
  static async getVaksinTerakhir(user) {
    const periode = await this.getActivePeriode(user);
    return await DashboardModel.getLastVaksin(periode.id);
  }

  // ==========================
  // GET PERFORMA (kumulatif)
  // PERBAIKAN: teruskan user
  // ==========================
  static async getPerforma(user) {
    const periode = await this.getActivePeriode(user);

    const data = await DashboardModel.getPerforma(periode.id);

    // Hen Day kumulatif
    const henDay =
      data.populasi_aktif > 0
        ? Number(((data.total_telur / data.populasi_aktif) * 100).toFixed(2))
        : 0;

    // Rata-rata berat telur kumulatif
    const avgEggWeight =
      data.total_telur > 0
        ? Number((data.total_berat_telur / data.total_telur).toFixed(2))
        : 0;

    // FCR = total pakan (kg) / total berat telur (kg)
    const fcr =
      data.total_berat_telur > 0
        ? Number((data.total_pakan / data.total_berat_telur).toFixed(2))
        : 0;

    // Persentase mortalitas
    const mortalitas =
      data.jumlah_awal > 0
        ? Number(((data.total_mortalitas / data.jumlah_awal) * 100).toFixed(2))
        : 0;

    return {
      hen_day: henDay,
      avg_egg_weight: avgEggWeight,
      fcr,
      mortalitas,
    };
  }

  // ==========================
  // GET ADMIN DASHBOARD
  // ==========================
  static async getAdminDashboard(user) {
    const rows = await DashboardModel.getAdminDashboard();

    const summary = {
      total_kandang: rows.length,

      total_ayam: rows.reduce(
        (sum, row) => sum + Number(row.populasi_aktif),
        0,
      ),

      total_telur: rows.reduce((sum, row) => sum + Number(row.total_telur), 0),

      total_mati: rows.reduce((sum, row) => sum + Number(row.total_mati), 0),
    };

    return {
      summary,
      kandangs: rows,
    };
  }
}

export default DashboardService;
