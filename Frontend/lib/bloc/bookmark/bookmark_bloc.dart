import 'package:flutter_bloc/flutter_bloc.dart';
import '../../data/repositories/bookmark_repository.dart';
import 'bookmark_event.dart';
import 'bookmark_state.dart';

class BookmarkBloc extends Bloc<BookmarkEvent, BookmarkState> {
  final BookmarkRepository bookmarkRepository;

  BookmarkBloc({required this.bookmarkRepository}) : super(BookmarkInitial()) {
    on<FetchBookmarksEvent>(_onFetchBookmarks);
    on<ToggleBookmarkEvent>(_onToggleBookmark);
    on<UpdateReadingProgressEvent>(_onUpdateReadingProgress);
  }

  Future<void> _onFetchBookmarks(
    FetchBookmarksEvent event,
    Emitter<BookmarkState> emit,
  ) async {
    emit(BookmarkLoading());
    try {
      final bookmarks = await bookmarkRepository.getMyBookmarks();
      emit(BookmarkLoaded(bookmarks));
    } catch (e) {
      emit(BookmarkError(e.toString().replaceAll('Exception: ', '')));
    }
  }

  Future<void> _onToggleBookmark(
    ToggleBookmarkEvent event,
    Emitter<BookmarkState> emit,
  ) async {
    try {
      if (event.isFavorite) {
        await bookmarkRepository.upsertBookmark(
          novelId: event.novelId,
          isFavorite: true,
        );
      } else {
        await bookmarkRepository.removeBookmark(event.novelId);
      }
      final updated = await bookmarkRepository.getMyBookmarks();
      emit(BookmarkLoaded(updated));
    } catch (e) {
      emit(BookmarkError(e.toString().replaceAll('Exception: ', '')));
    }
  }

  Future<void> _onUpdateReadingProgress(
    UpdateReadingProgressEvent event,
    Emitter<BookmarkState> emit,
  ) async {
    try {
      await bookmarkRepository.upsertBookmark(
        novelId: event.novelId,
        isFavorite: true,
        lastChapterId: event.lastChapterId,
        lastPage: event.lastPage,
        readingProgressPercent: event.readingProgressPercent,
      );
      final updated = await bookmarkRepository.getMyBookmarks();
      emit(BookmarkLoaded(updated));
    } catch (_) {
      // Background sync, silent fail
    }
  }
}
