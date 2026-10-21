import 'package:equatable/equatable.dart';

abstract class SearchEvent extends Equatable {
  const SearchEvent();

  @override
  List<Object?> get props => [];
}

class SearchNovelsQueryEvent extends SearchEvent {
  final String? query;
  final String? category;
  final String? status;
  final int page;

  const SearchNovelsQueryEvent({
    this.query,
    this.category,
    this.status,
    this.page = 0,
  });

  @override
  List<Object?> get props => [query, category, status, page];
}
