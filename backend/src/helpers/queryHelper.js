class QueryHelper {
  static parse(query = {}) {
    const page = Math.max(parseInt(query.page) || 1, 1);
    const limit = Math.max(parseInt(query.limit) || 10, 1);

    const offset = (page - 1) * limit;

    const search = (query.search || "").trim();

    const allowedSort = [
      "id",
      "kode",
      "nama",
      "status",
      "created_at",
      "updated_at",
    ];

    const sort = allowedSort.includes(query.sort) ? query.sort : "id";

    const order =
      (query.order || "ASC").toUpperCase() === "DESC" ? "DESC" : "ASC";

    return {
      page,
      limit,
      offset,
      search,
      sort,
      order,
    };
  }
}

export default QueryHelper;
