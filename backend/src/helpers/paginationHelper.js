class PaginationHelper {
  static getPagination(query) {
    const page = Math.max(parseInt(query.page) || 1, 1);
    const limit = Math.max(parseInt(query.limit) || 10, 1);

    const offset = (page - 1) * limit;

    return {
      page,
      limit,
      offset,
    };
  }

  static createMeta(page, limit, totalData) {
    return {
      page,
      limit,
      total_data: totalData,
      total_page: Math.ceil(totalData / limit),
    };
  }
}

export default PaginationHelper;