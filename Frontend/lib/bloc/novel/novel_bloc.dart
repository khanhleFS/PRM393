import 'package:flutter_bloc/flutter_bloc.dart';
import '../../data/repositories/novel_repository.dart';
import 'novel_event.dart';
import 'novel_state.dart';

class NovelBloc extends Bloc<NovelEvent, NovelState> {
  final NovelRepository novelRepository;

  NovelBloc({required this.novelRepository}) : super(NovelInitial()) {
    on<FetchHomeDataEvent>(_onFetchHomeData);
    on<SelectCategoryEvent>(_onSelectCategory);
    on<SearchNovelsEvent>(_onSearchNovels);
  }

  Future<void> _onFetchHomeData(
    FetchHomeDataEvent event,
    Emitter<NovelState> emit,
  ) async {
    emit(NovelLoading());
    try {
      final categoriesFuture = novelRepository.getCategories();
      final pageFuture = novelRepository.searchNovels(page: 0, size: 20);

      final results = await Future.wait([categoriesFuture, pageFuture]);
      final categories = results[0] as List<dynamic>;
      final pageResponse = results[1] as dynamic;

      final novels = pageResponse.content as List<dynamic>;
      final featured = novels.take(5).toList();
      final latest = novels.toList();

      emit(
        NovelHomeLoaded(
          featuredNovels: List.from(featured),
          latestNovels: List.from(latest),
          categories: List.from(categories),
        ),
      );
    } catch (e) {
      emit(NovelError(e.toString().replaceAll('Exception: ', '')));
    }
  }

  Future<void> _onSelectCategory(
    SelectCategoryEvent event,
    Emitter<NovelState> emit,
  ) async {
    if (state is NovelHomeLoaded) {
      final current = state as NovelHomeLoaded;
      emit(current.copyWith(selectedCategory: event.categorySlug));

      try {
        final pageResponse = await novelRepository.searchNovels(
          category: event.categorySlug,
          page: 0,
          size: 20,
        );
        emit(current.copyWith(
          latestNovels: pageResponse.content,
          selectedCategory: event.categorySlug,
        ));
      } catch (e) {
        emit(NovelError(e.toString().replaceAll('Exception: ', '')));
      }
    }
  }

  Future<void> _onSearchNovels(
    SearchNovelsEvent event,
    Emitter<NovelState> emit,
  ) async {
    emit(NovelLoading());
    try {
      final result = await novelRepository.searchNovels(
        query: event.query,
        category: event.category,
        status: event.status,
        page: event.page,
      );
      emit(
        NovelSearchLoaded(
          novels: result.content,
          totalElements: result.totalElements,
          page: result.page,
          totalPages: result.totalPages,
          query: event.query,
          category: event.category,
        ),
      );
    } catch (e) {
      emit(NovelError(e.toString().replaceAll('Exception: ', '')));
    }
  }
}
