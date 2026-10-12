import 'package:equatable/equatable.dart';

abstract class NovelEvent extends Equatable {
  const NovelEvent();
  @override
  List<Object?> get props => [];
}

class FetchHomeDataEvent extends NovelEvent {}

class SearchNovelsEvent extends NovelEvent {
  final String? query;
  final String? category;
  final String? status;
  final int page;

  const SearchNovelsEvent({
    this.query,
    this.category,
    this.status,
    this.page = 0,
  });

  @override
  List<Object?> get props => [query, category, status, page];
}

class SelectCategoryEvent extends NovelEvent {
  final String? categorySlug;

  const SelectCategoryEvent(this.categorySlug);

  @override
  List<Object?> get props => [categorySlug];
}
