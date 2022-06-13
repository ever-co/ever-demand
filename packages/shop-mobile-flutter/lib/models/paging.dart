class PagingSortInput {
  final String field;
  final String sortBy;

  const PagingSortInput({
    required this.field,
    required this.sortBy,
  });
}

class PagingOptionsInput {
  final PagingOptionsInput? sort;
  final int? limit;
  final int? skip;

  const PagingOptionsInput({
    this.sort,
    this.limit,
    this.skip,
  });
}
