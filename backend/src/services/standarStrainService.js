import StandarStrainModel from "../models/standarStrainModel.js";

class StandarStrainService {
  static async getAll() {
    return await StandarStrainModel.getAll();
  }

  static async getById(id) {
    const standarStrain = await StandarStrainModel.findById(id);

    if (!standarStrain) {
      throw new Error("Standar strain tidak ditemukan.");
    }

    return standarStrain;
  }

  static async create(data) {
    const existing = await StandarStrainModel.findByStrainAndUmur(
      data.strain_id,
      data.umur_minggu,
    );

    if (existing) {
      throw new Error("Standar strain untuk umur minggu tersebut sudah ada.");
    }

    return await StandarStrainModel.create(data);
  }

  static async update(id, data) {
    const standarStrain = await StandarStrainModel.findById(id);

    if (!standarStrain) {
      throw new Error("Standar strain tidak ditemukan.");
    }

    const existing = await StandarStrainModel.findByStrainAndUmur(
      data.strain_id,
      data.umur_minggu,
    );

    if (existing && existing.id !== Number(id)) {
      throw new Error("Standar strain untuk umur minggu tersebut sudah ada.");
    }

    await StandarStrainModel.update(id, data);
  }

  static async delete(id) {
    const standarStrain = await StandarStrainModel.findById(id);

    if (!standarStrain) {
      throw new Error("Standar strain tidak ditemukan.");
    }

    await StandarStrainModel.delete(id);
  }
}

export default StandarStrainService;
