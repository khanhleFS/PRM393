import 'package:equatable/equatable.dart';
import '../../data/models/novel_model.dart';

abstract class SearchState extends Equatable {
  const SearchState();

  @override
  List<Object?> get props => [];
}

class SearchInitial extends SearchState {}

class SearchLoading extends SearchState {}

class SearchLoaded extends SearchState {
  final List<NovelModel> novels;
  final int totalElements;
  final int page;
  final int totalPages;
  final String? query;
  final String? category;
  final String? status;

  const SearchLoaded({
    required this.novels,
    required this.totalElements,
    required this.page,
    required this.totalPages,
    this.query,
    this.category,
    this.status,
  });

  @override
  List<Object?> get props => [
        novels,
        totalElements,
        page,
        totalPages,
        query,
        category,
        status,
      ];
}

class SearchError extends SearchState {
  final String message;

  const SearchError(this.message);

  @override
  List<Object?> get props => [message];
}
