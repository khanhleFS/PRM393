import 'package:equatable/equatable.dart';
import '../../data/models/novel_model.dart';

abstract class NovelState extends Equatable {
  const NovelState();
  @override
  List<Object?> get props => [];
}

class NovelInitial extends NovelState {}

class NovelLoading extends NovelState {}

class NovelHomeLoaded extends NovelState {
  final List<NovelModel> featuredNovels;
  final List<NovelModel> latestNovels;
  final List<CategoryModel> categories;
  final String? selectedCategory;

  const NovelHomeLoaded({
    required this.featuredNovels,
    required this.latestNovels,
    required this.categories,
    this.selectedCategory,
  });

  NovelHomeLoaded copyWith({
    List<NovelModel>? featuredNovels,
    List<NovelModel>? latestNovels,
    List<CategoryModel>? categories,
    String? selectedCategory,
    bool clearCategory = false,
  }) {
    return NovelHomeLoaded(
      featuredNovels: featuredNovels ?? this.featuredNovels,
      latestNovels: latestNovels ?? this.latestNovels,
      categories: categories ?? this.categories,
      selectedCategory:
          clearCategory ? null : (selectedCategory ?? this.selectedCategory),
    );
  }

  @override
  List<Object?> get props => [featuredNovels, latestNovels, categories, selectedCategory];
}

class NovelSearchLoaded extends NovelState {
  final List<NovelModel> novels;
  final int totalElements;
  final int page;
  final int totalPages;
  final String? query;
  final String? category;

  const NovelSearchLoaded({
    required this.novels,
    required this.totalElements,
    required this.page,
    required this.totalPages,
    this.query,
    this.category,
  });

  @override
  List<Object?> get props => [novels, totalElements, page, totalPages, query, category];
}

class NovelError extends NovelState {
  final String message;

  const NovelError(this.message);

  @override
  List<Object?> get props => [message];
}
