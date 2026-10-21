import 'package:flutter_bloc/flutter_bloc.dart';
import '../../core/storage/local_storage.dart';
import '../../data/models/chapter_model.dart';
import '../../data/repositories/chapter_repository.dart';
import 'reader_event.dart';
import 'reader_state.dart';

class ReaderBloc extends Bloc<ReaderEvent, ReaderState> {
  final ChapterRepository chapterRepository;

  ReaderBloc({required this.chapterRepository}) : super(ReaderInitial()) {
    on<LoadChapterEvent>(_onLoadChapter);
    on<UnlockChapterEvent>(_onUnlockChapter);
    on<ChangeFontSizeEvent>(_onChangeFontSize);
    on<ChangeFontFamilyEvent>(_onChangeFontFamily);
    on<ChangeReaderThemeEvent>(_onChangeReaderTheme);
  }

  Future<void> _onLoadChapter(
    LoadChapterEvent event,
    Emitter<ReaderState> emit,
  ) async {
    emit(ReaderLoading());
    try {
      final chapter = await chapterRepository.readChapter(event.novelId, event.chapterId);
      final fontSize = LocalStorage.getFontSize();
      final fontFamily = LocalStorage.getFontFamily();
      final readerTheme = LocalStorage.getReaderTheme();

      // Find previous and next chapters if chapter list is provided
      ChapterModel? prev;
      ChapterModel? next;
      List<ChapterModel> chapters = event.chaptersList ?? [];

      if (chapters.isEmpty) {
        try {
          chapters = await chapterRepository.getChapters(event.novelId);
        } catch (_) {}
      }

      if (chapters.isNotEmpty) {
        final currentIndex = chapters.indexWhere(
          (c) => c.chapterNumber == chapter.chapterNumber,
        );
        if (currentIndex > 0) {
          prev = chapters[currentIndex - 1];
        }
        if (currentIndex >= 0 && currentIndex < chapters.length - 1) {
          next = chapters[currentIndex + 1];
        }
      }

      emit(
        ReaderLoaded(
          chapter: chapter,
          novelTitle: event.novelTitle,
          fontSize: fontSize,
          fontFamily: fontFamily,
          readerTheme: readerTheme,
          chaptersList: chapters,
          prevChapter: prev,
          nextChapter: next,
        ),
      );
    } catch (e) {
      emit(ReaderError(e.toString().replaceAll('Exception: ', '')));
    }
  }

  Future<void> _onUnlockChapter(
    UnlockChapterEvent event,
    Emitter<ReaderState> emit,
  ) async {
    try {
      final result = await chapterRepository.unlockChapter(event.novelId, event.chapterId);
      // Reload chapter content after unlocking
      final chapter = await chapterRepository.readChapter(event.novelId, event.chapterId);

      if (state is ReaderLoaded) {
        final current = state as ReaderLoaded;
        emit(current.copyWith(chapter: chapter));
      } else {
        emit(ReaderUnlockSuccess(result));
      }
    } catch (e) {
      emit(ReaderError(e.toString().replaceAll('Exception: ', '')));
    }
  }

  Future<void> _onChangeFontSize(
    ChangeFontSizeEvent event,
    Emitter<ReaderState> emit,
  ) async {
    await LocalStorage.saveFontSize(event.fontSize);
    if (state is ReaderLoaded) {
      final current = state as ReaderLoaded;
      emit(current.copyWith(fontSize: event.fontSize));
    }
  }

  Future<void> _onChangeFontFamily(
    ChangeFontFamilyEvent event,
    Emitter<ReaderState> emit,
  ) async {
    await LocalStorage.saveFontFamily(event.fontFamily);
    if (state is ReaderLoaded) {
      final current = state as ReaderLoaded;
      emit(current.copyWith(fontFamily: event.fontFamily));
    }
  }

  Future<void> _onChangeReaderTheme(
    ChangeReaderThemeEvent event,
    Emitter<ReaderState> emit,
  ) async {
    await LocalStorage.saveReaderTheme(event.readerTheme);
    if (state is ReaderLoaded) {
      final current = state as ReaderLoaded;
      emit(current.copyWith(readerTheme: event.readerTheme));
    }
  }
}
