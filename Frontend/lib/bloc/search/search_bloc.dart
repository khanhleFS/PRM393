import 'package:flutter_bloc/flutter_bloc.dart';
import '../../data/repositories/novel_repository.dart';
import 'search_event.dart';
import 'search_state.dart';

class SearchBloc extends Bloc<SearchEvent, SearchState> {
  final NovelRepository novelRepository;

  SearchBloc({required this.novelRepository}) : super(SearchInitial()) {
    on<SearchNovelsQueryEvent>(_onSearchNovels);
  }

  Future<void> _onSearchNovels(
    SearchNovelsQueryEvent event,
    Emitter<SearchState> emit,
  ) async {
    emit(SearchLoading());
    try {
      final result = await novelRepository.searchNovels(
        query: event.query,
        category: event.category,
        status: event.status,
        page: event.page,
      );
      emit(
        SearchLoaded(
          novels: result.content,
          totalElements: result.totalElements,
          page: result.page,
          totalPages: result.totalPages,
          query: event.query,
          category: event.category,
          status: event.status,
        ),
      );
    } catch (e) {
      emit(SearchError(e.toString().replaceAll('Exception: ', '')));
    }
  }
}
